package com.assessment.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AutoScoringService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public BigDecimal autoScore(UUID questionId, Object answerValue) {
        var meta = jdbcTemplate.query(
            """
            SELECT qt.input_type, q.scoring_schema 
            FROM public.question q
            JOIN public.question_type qt ON qt.id = q.type_id
            WHERE q.id = ? 
            LIMIT 1
            """,
            ps -> ps.setObject(1, questionId),
            rs -> rs.next()
                ? new QuestionMeta(
                    rs.getString("input_type"),
                    parseJsonSafe(rs.getString("scoring_schema"))
                  )
                : null
        );
        if (meta == null) return null;

        String type = normalizeType(meta.type);
        
        // Points aus scoring_schema extrahieren (falls vorhanden)
        BigDecimal points = extractPointsFromScoring(meta.scoring);
        if (points == null || points.compareTo(BigDecimal.ZERO) < 0) {
            points = BigDecimal.ZERO;
        }

        // Manuelle Typen → kein Auto-Score
        if (isManual(type)) return null;

        JsonNode ans = objectMapper.valueToTree(answerValue);

        return switch (type) {
            case "rating_scale" -> scoreRating(ans);
            case "multiple_choice", "dropdown" -> scoreSingleChoice(ans, meta.scoring, points);
            case "multiple_select" -> scoreMultiSelect(ans, meta.scoring, points);
            default -> null;
        };
    }

    private BigDecimal scoreRating(JsonNode ans) {
        if (ans == null || ans.isNull()) return null;
        
        // Extrahiere Zahl aus verschiedenen Formaten
        int value;
        try {
            if (ans.isNumber()) {
                value = ans.asInt();
            } else if (ans.isTextual()) {
                value = Integer.parseInt(ans.asText().trim());
            } else if (ans.has("rating")) {
                value = ans.get("rating").asInt();
            } else if (ans.has("value")) {
                value = ans.get("value").asInt();
            } else {
                return null; // Ungültiges Format
            }
        } catch (NumberFormatException e) {
            return null; // Keine gültige Zahl
        }
        
        // Validierung: Muss Integer zwischen 0 und 5 sein
        if (value < 0 || value > 5) {
            return null; // Außerhalb des gültigen Bereichs
        }
        
        return BigDecimal.valueOf(value);
    }

    private String normalizeType(String t) {
        String s = t == null ? "" : t.toLowerCase();
        return switch (s) {
            case "single", "single_choice", "radio" -> "multiple_choice";
            case "dropdown", "select" -> "dropdown";
            case "multi", "multiple", "checkbox", "mcq_multi" -> "multiple_select";
            case "text", "text_input" -> "text_input";
            case "number", "numeric", "number_input" -> "number_input";
            case "date", "date_input" -> "date_input";
            case "rating", "range", "rating_scale" -> "rating_scale";
            case "ordering", "order", "sort" -> "ordering";
            default -> s;
        };
    }

    private boolean isManual(String type) {
        return switch (type) {
            case "text_input", "number_input", "date_input", "ordering" -> true;
            default -> false;
        };
    }

    /**
     * Single Choice Scoring (Radio Button, Dropdown)
     * 
     * Unterstützt zwei Formate:
     * 
     * 1. NEUES FORMAT (empfohlen):
     *    scoringSchema: {"opt1": 5, "opt2": 0, "opt3": 0}
     *    answer: "opt1" oder {"choiceId": "opt1"}
     *    → Gibt Punkte für gewählte Option zurück
     */
    private BigDecimal scoreSingleChoice(JsonNode ans, JsonNode scoring, BigDecimal points) {
        if (scoring == null) return null;
        
        // Extrahiere gewählte Option aus Answer
        String chosen = null;
        if (ans == null || ans.isNull()) return BigDecimal.ZERO;
        
        if (ans.isTextual()) {
            chosen = ans.asText();
        } else if (ans.hasNonNull("choiceId")) {
            chosen = ans.get("choiceId").asText();
        } else if (ans.has("choiceIds") && ans.get("choiceIds").isArray() && ans.get("choiceIds").size() > 0) {
            chosen = ans.get("choiceIds").get(0).asText();
        }
        
        if (chosen == null) return BigDecimal.ZERO;
        
        // NEUES FORMAT: Direktes Mapping von Option ID zu Punkten
        // z.B. {"opt1": 5, "opt2": 0, "opt3": 0}
        if (scoring.has(chosen)) {
            JsonNode scoreNode = scoring.get(chosen);
            if (scoreNode.isNumber()) {
                return BigDecimal.valueOf(scoreNode.asDouble());
            }
        }
        
        // ALTES FORMAT (Legacy): correctOptionId + points
        // z.B. {"correctOptionId": "opt1", "points": 5}
        if (scoring.hasNonNull("correctOptionId")) {
            String correct = scoring.get("correctOptionId").asText();
            return correct.equals(chosen) ? points : BigDecimal.ZERO;
        }
        
        // Fallback für correctOptionIds Array
        if (scoring.has("correctOptionIds") && scoring.get("correctOptionIds").isArray()) {
            if (scoring.get("correctOptionIds").size() > 0) {
                String correct = scoring.get("correctOptionIds").get(0).asText();
                return correct.equals(chosen) ? points : BigDecimal.ZERO;
            }
        }
        
        // Keine passende Scoring-Regel gefunden
        return BigDecimal.ZERO;
    }

    /**
     * Multiple Select Scoring (Checkbox)
     * 
     * Unterstützt zwei Formate:
     * 
     * 1. NEUES FORMAT (empfohlen):
     *    scoringSchema: {"opt1": 2.5, "opt2": 0, "opt3": 2.5, "opt4": 0}
     *    answer: ["opt1", "opt3"] oder {"choiceIds": ["opt1", "opt3"]}
     *    → Summiert Punkte aller gewählten Optionen: 2.5 + 2.5 = 5.0
     *    → Negative Punkte für falsche Antworten möglich
     */
    private BigDecimal scoreMultiSelect(JsonNode ans, JsonNode scoring, BigDecimal points) {
        if (scoring == null) return null;
        
        // Extrahiere gewählte Optionen aus Answer
        Set<String> chosen = new HashSet<>();
        if (ans != null) {
            if (ans.isArray()) {
                ans.forEach(n -> {
                    if (n.isTextual()) chosen.add(n.asText());
                });
            } else if (ans.has("choiceIds") && ans.get("choiceIds").isArray()) {
                ans.get("choiceIds").forEach(n -> {
                    if (n.isTextual()) chosen.add(n.asText());
                });
            } else if (ans.isTextual()) {
                chosen.add(ans.asText());
            }
        }
        
        // Wenn keine Optionen gewählt wurden
        if (chosen.isEmpty()) return BigDecimal.ZERO;
        
        // NEUES FORMAT: Direktes Mapping von Option IDs zu Punkten
        // Prüfe ob scoringSchema Option-Keys enthält (nicht nur Meta-Keys)
        boolean hasDirectMapping = false;
        for (String optionId : chosen) {
            if (scoring.has(optionId) && scoring.get(optionId).isNumber()) {
                hasDirectMapping = true;
                break;
            }
        }
        
        if (hasDirectMapping || !scoring.has("correctOptionIds")) {
            // Summiere Punkte für alle gewählten Optionen
            BigDecimal total = BigDecimal.ZERO;
            for (String optionId : chosen) {
                if (scoring.has(optionId)) {
                    JsonNode scoreNode = scoring.get(optionId);
                    if (scoreNode.isNumber()) {
                        total = total.add(BigDecimal.valueOf(scoreNode.asDouble()));
                    }
                }
            }
            return total.stripTrailingZeros();
        }
        
        // ALTES FORMAT (Legacy): correctOptionIds + partial credit
        if (!scoring.has("correctOptionIds")) return null;
        
        Set<String> correct = new HashSet<>();
        scoring.get("correctOptionIds").forEach(n -> {
            if (n.isTextual()) correct.add(n.asText());
        });
        
        boolean allOrNothing = scoring.has("allOrNothing") && scoring.get("allOrNothing").asBoolean(false);
        double penaltyPerWrong = scoring.has("penaltyPerWrong") ? scoring.get("penaltyPerWrong").asDouble(0.0) : 0.0;
        
        if (allOrNothing) {
            return chosen.equals(correct) ? points : BigDecimal.ZERO;
        }
        
        int correctCount = correct.size();
        if (correctCount == 0) return BigDecimal.ZERO;
        
        Set<String> hits = new HashSet<>(chosen);
        hits.retainAll(correct);
        int hitCount = hits.size();
        
        Set<String> wrong = new HashSet<>(chosen);
        wrong.removeAll(correct);
        int wrongCount = wrong.size();
        
        double raw = ((double) hitCount / (double) correctCount) - (penaltyPerWrong * wrongCount);
        double frac = Math.max(0.0, Math.min(1.0, raw));
        return points.multiply(BigDecimal.valueOf(frac)).stripTrailingZeros();
    }

    private JsonNode parseJsonSafe(String json) {
        try { return json == null ? null : objectMapper.readTree(json); }
        catch (Exception e) { return null; }
    }

    /**
     * Extrahiert Points aus dem scoring_schema JSON
     * Unterstützt verschiedene Formate wie:
     * - {"points": 5}
     * - {"max_points": 10}
     * - {"scale_points": {...}, "weight": 0.8}
     */
    private BigDecimal extractPointsFromScoring(JsonNode scoring) {
        if (scoring == null) return BigDecimal.valueOf(3); // Default
        
        // Direkt: {"points": X}
        if (scoring.has("points") && scoring.get("points").isNumber()) {
            return BigDecimal.valueOf(scoring.get("points").asDouble());
        }
        
        // Alternative: {"max_points": X}
        if (scoring.has("max_points") && scoring.get("max_points").isNumber()) {
            return BigDecimal.valueOf(scoring.get("max_points").asDouble());
        }
        
        // Für scale_points: nimm den höchsten Wert
        if (scoring.has("scale_points") && scoring.get("scale_points").isObject()) {
            double maxValue = 0;
            scoring.get("scale_points").fields().forEachRemaining(entry -> {
                // Ignoriere nicht-numerische Werte
            });
            if (maxValue > 0) return BigDecimal.valueOf(maxValue);
        }
        
        // Default: 3 Punkte wenn nichts angegeben
        return BigDecimal.valueOf(3);
    }

    private record QuestionMeta(String type, JsonNode scoring) {}
}