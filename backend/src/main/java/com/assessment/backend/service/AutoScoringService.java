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
            "SELECT type, points, scoring FROM public.question WHERE id = ? LIMIT 1",
            ps -> ps.setObject(1, questionId),
            rs -> rs.next()
                ? new Meta(rs.getString("type"), rs.getBigDecimal("points"), parseJsonSafe(rs.getString("scoring")))
                : null
        );
        if (meta == null) return null;

        String type = normalizeType(meta.type);
        BigDecimal points = meta.points != null ? meta.points : BigDecimal.ZERO;
        if (points.compareTo(BigDecimal.ZERO) < 0) points = BigDecimal.ZERO;

        // Manuelle Typen → kein Auto-Score
        if (isManual(type)) return null;

        JsonNode ans = objectMapper.valueToTree(answerValue);

        return switch (type) {
            case "multiple_choice", "dropdown" -> scoreSingleChoice(ans, meta.scoring, points);
            case "multiple_select" -> scoreMultiSelect(ans, meta.scoring, points);
            default -> null;
        };
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
            case "text_input", "number_input", "date_input", "rating_scale", "ordering" -> true;
            default -> false;
        };
    }

    private BigDecimal scoreSingleChoice(JsonNode ans, JsonNode scoring, BigDecimal points) {
        if (scoring == null) return null;
        String correct = scoring.hasNonNull("correctOptionId")
                ? scoring.get("correctOptionId").asText()
                : null;
        if (correct == null && scoring.has("correctOptionIds") && scoring.get("correctOptionIds").isArray() && scoring.get("correctOptionIds").size() > 0) {
            correct = scoring.get("correctOptionIds").get(0).asText();
        }
        if (correct == null) return null;

        String chosen = null;
        if (ans == null || ans.isNull()) return BigDecimal.ZERO;
        if (ans.hasNonNull("choiceId")) chosen = ans.get("choiceId").asText();
        else if (ans.has("choiceIds") && ans.get("choiceIds").isArray() && ans.get("choiceIds").size() > 0)
            chosen = ans.get("choiceIds").get(0).asText();
        else if (ans.isTextual()) chosen = ans.asText();

        if (chosen == null) return BigDecimal.ZERO;
        return correct.equals(chosen) ? points : BigDecimal.ZERO;
    }

    private BigDecimal scoreMultiSelect(JsonNode ans, JsonNode scoring, BigDecimal points) {
        if (scoring == null || !scoring.has("correctOptionIds")) return null;

        Set<String> correct = new HashSet<>();
        scoring.get("correctOptionIds").forEach(n -> correct.add(n.asText()));

        boolean allOrNothing = scoring.has("allOrNothing") && scoring.get("allOrNothing").asBoolean(false);
        double penaltyPerWrong = scoring.has("penaltyPerWrong") ? scoring.get("penaltyPerWrong").asDouble(0.0) : 0.0;

        Set<String> chosen = new HashSet<>();
        if (ans != null) {
            if (ans.has("choiceIds") && ans.get("choiceIds").isArray()) {
                ans.get("choiceIds").forEach(n -> chosen.add(n.asText()));
            } else if (ans.isArray()) {
                ans.forEach(n -> chosen.add(n.asText()));
            } else if (ans.isTextual()) {
                chosen.add(ans.asText());
            }
        }

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

    private record Meta(String type, BigDecimal points, JsonNode scoring) {}
}