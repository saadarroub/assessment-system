package com.assessment.backend.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class PublicQueryUtil {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int countQuestionsByThema(UUID themaId) {
        Integer c = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM public.question_node WHERE thema_id = ?",
                Integer.class, themaId
        );
        return c != null ? c : 0;
    }

    public boolean questionBelongsToThema(UUID questionId, UUID themaId) {
        Integer c = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM public.question_node WHERE thema_id = ? AND question_id = ?",
                Integer.class, themaId, questionId
        );
        return c != null && c > 0;
    }

    @Nullable
    public Map<String, Object> findNextQuestion(UUID sessionId, UUID themaId) {
        return jdbcTemplate.query(
                """
                SELECT 
                    qn.question_id,
                    qn.order_index,
                    q.text AS question_text,
                    q.options,
                    q.scoring_schema,
                    qt.input_type,
                    qt.name AS question_type_name
                FROM public.question_node qn
                JOIN public.question q ON q.id = qn.question_id
                JOIN public.question_type qt ON qt.id = q.type_id
                WHERE qn.thema_id = ?
                  AND NOT EXISTS (
                    SELECT 1 FROM public.answer a 
                    WHERE a.session_id = ? AND a.question_id = qn.question_id
                  )
                ORDER BY qn.order_index ASC
                LIMIT 1
                """,
                ps -> { ps.setObject(1, themaId); ps.setObject(2, sessionId); },
                rs -> {
                    if (!rs.next()) return null;
                    
                    Map<String, Object> result = new java.util.HashMap<>();
                    result.put("questionId", UUID.fromString(rs.getString("question_id")));
                    result.put("index", rs.getInt("order_index"));
                    result.put("text", rs.getString("question_text"));
                    result.put("inputType", rs.getString("input_type"));
                    result.put("questionTypeName", rs.getString("question_type_name"));
                    
                    // Options als JSON String (wird vom Frontend geparst)
                    String options = rs.getString("options");
                    result.put("options", options);
                    
                    // Scoring Schema als JSON String (optional für Frontend)
                    String scoringSchema = rs.getString("scoring_schema");
                    result.put("scoringSchema", scoringSchema);
                    
                    // Noch nicht beantwortet
                    result.put("answered", false);
                    
                    return result;
                }
        );
    }

    @Nullable
    public Integer findOrderIndex(UUID themaId, UUID questionId) {
        return jdbcTemplate.query(
                "SELECT order_index FROM public.question_node WHERE thema_id = ? AND question_id = ? LIMIT 1",
                ps -> { ps.setObject(1, themaId); ps.setObject(2, questionId); },
                rs -> rs.next() ? rs.getInt("order_index") : null
        );
    }

    @Nullable
    public String getQuestionInputType(UUID questionId) {
        return jdbcTemplate.query(
                """
                SELECT qt.input_type
                FROM public.question q
                JOIN public.question_type qt ON qt.id = q.type_id
                WHERE q.id = ? 
                LIMIT 1
                """,
                ps -> ps.setObject(1, questionId),
                rs -> rs.next() ? rs.getString("input_type") : null
        );
    }

    /**
     * Berechnet max_possible_score für ein Thema:
     * - Auto-Scoring: Summe aller max Punkte aus scoring_schema
     * - Manual Scoring: 5 Punkte pro Frage
     * 
     * @param themaId UUID des Themas
     * @return max_possible_score als BigDecimal
     */
    public java.math.BigDecimal calculateMaxPossibleScore(UUID themaId) {
        return jdbcTemplate.query(
                """
                SELECT 
                    q.id,
                    qt.input_type,
                    q.scoring_schema
                FROM public.question_node qn
                JOIN public.question q ON q.id = qn.question_id
                JOIN public.question_type qt ON qt.id = q.type_id
                WHERE qn.thema_id = ?
                ORDER BY qn.order_index
                """,
                ps -> ps.setObject(1, themaId),
                rs -> {
                    java.math.BigDecimal total = java.math.BigDecimal.ZERO;
                    
                    while (rs.next()) {
                        String inputType = rs.getString("input_type");
                        String scoringSchemaJson = rs.getString("scoring_schema");
                        
                        // Normalisiere input_type
                        String normalized = normalizeInputType(inputType);
                        
                        // Auto-Scoring Typen: rating_scale, multiple_choice, multiple_select, dropdown
                        if ("rating_scale".equals(normalized)) {
                            // Rating Scale: max = 5
                            total = total.add(java.math.BigDecimal.valueOf(5));
                        } 
                        else if ("multiple_select".equals(normalized)) {
                            // Multiple Select: Summe ALLER positiven Werte
                            if (scoringSchemaJson != null && !scoringSchemaJson.isBlank()) {
                                java.math.BigDecimal sumFromSchema = extractSumScore(scoringSchemaJson);
                                total = total.add(sumFromSchema);
                            } else {
                                // Fallback: keine Schema = 5 Punkte
                                total = total.add(java.math.BigDecimal.valueOf(5));
                            }
                        }
                        else if ("multiple_choice".equals(normalized) || "dropdown".equals(normalized)) {
                            // Single Choice/Dropdown: Maximum aus Schema
                            if (scoringSchemaJson != null && !scoringSchemaJson.isBlank()) {
                                java.math.BigDecimal maxFromSchema = extractMaxScore(scoringSchemaJson);
                                total = total.add(maxFromSchema);
                            } else {
                                // Fallback: keine Schema = 5 Punkte
                                total = total.add(java.math.BigDecimal.valueOf(5));
                            }
                        } 
                        else {
                            // Manual Scoring: text_input, number_input, date_input, ordering
                            // Jeweils 5 Punkte
                            total = total.add(java.math.BigDecimal.valueOf(5));
                        }
                    }
                    
                    return total;
                }
        );
    }

    /**
     * Extrahiert den maximalen Score aus einem scoring_schema JSON (für Single Choice/Dropdown)
     * Unterstützt beide Formate:
     * - NEW: {"opt1": 5, "opt2": 3} -> max = 5
     * - OLD: {"correctOptionId": "opt1", "points": 5} -> 5
     */
    private java.math.BigDecimal extractMaxScore(String scoringSchemaJson) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(scoringSchemaJson);
            
            // OLD Format prüfen
            if (root.has("points")) {
                double points = root.get("points").asDouble(0.0);
                return java.math.BigDecimal.valueOf(points);
            }
            
            // NEW Format: Maximum aller Werte finden
            double maxValue = 0.0;
            var fields = root.fields();
            while (fields.hasNext()) {
                var entry = fields.next();
                if (entry.getValue().isNumber()) {
                    double val = entry.getValue().asDouble(0.0);
                    if (val > maxValue) {
                        maxValue = val;
                    }
                }
            }
            
            return java.math.BigDecimal.valueOf(maxValue);
        } catch (Exception e) {
            // Fallback bei Parse-Fehler
            return java.math.BigDecimal.valueOf(5);
        }
    }

    /**
     * Extrahiert die Summe aller positiven Scores aus einem scoring_schema JSON (für Multiple Select)
     * Format: {"opt1": 1.5, "opt2": 1.5, "opt3": 2, "opt4": 0}
     * Summe = 1.5 + 1.5 + 2 = 5.0
     */
    private java.math.BigDecimal extractSumScore(String scoringSchemaJson) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(scoringSchemaJson);
            
            // OLD Format prüfen
            if (root.has("points")) {
                double points = root.get("points").asDouble(0.0);
                return java.math.BigDecimal.valueOf(points);
            }
            
            // NEW Format: Summe aller positiven Werte
            double sum = 0.0;
            var fields = root.fields();
            while (fields.hasNext()) {
                var entry = fields.next();
                if (entry.getValue().isNumber()) {
                    double val = entry.getValue().asDouble(0.0);
                    if (val > 0) {
                        sum += val;
                    }
                }
            }
            
            return java.math.BigDecimal.valueOf(sum);
        } catch (Exception e) {
            // Fallback bei Parse-Fehler
            return java.math.BigDecimal.valueOf(5);
        }
    }

    /**
     * Normalisiert input_type Namen (analog zu AutoScoringService)
     */
    private String normalizeInputType(String inputType) {
        if (inputType == null) return "";
        String s = inputType.toLowerCase();
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
}