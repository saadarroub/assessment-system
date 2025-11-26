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
    
    /**
     * Prüft ob eine Frage als Pflichtfrage (is_required=true) markiert ist
     */
    public boolean isQuestionRequired(UUID questionId, UUID themaId) {
        Boolean required = jdbcTemplate.queryForObject(
                "SELECT is_required FROM public.question_node WHERE thema_id = ? AND question_id = ?",
                Boolean.class, themaId, questionId
        );
        return required != null && required;
    }

    @Nullable
    public Map<String, Object> findNextQuestion(UUID sessionId, UUID themaId) {
        return jdbcTemplate.query(
                """
                -- Recursive CTE für hierarchische Fragenreihenfolge
                -- Sortiert nach: Vater -> Kinder -> Enkel -> ... (beliebig tief)
                WITH RECURSIVE question_hierarchy AS (
                  -- Basis: Root-Fragen (ohne Parent)
                  SELECT 
                    qn.id as node_id,
                    qn.question_id,
                    qn.order_index,
                    qn.parent_node_id,
                    qn.is_required,
                    0 as depth,
                    -- sort_path: hierarchischer Pfad für Sortierung (z.B. "0010", "0010.0020", "0010.0020.0010")
                    LPAD(qn.order_index::TEXT, 4, '0') as sort_path
                  FROM public.question_node qn
                  WHERE qn.thema_id = ? 
                    AND qn.parent_node_id IS NULL
                  
                  UNION ALL
                  
                  -- Rekursion: Kinder der bereits gefundenen Nodes
                  SELECT 
                    child.id,
                    child.question_id,
                    child.order_index,
                    child.parent_node_id,
                    child.is_required,
                    qh.depth + 1,
                    -- Pfad erweitern: parent_path + "." + child_order_index
                    qh.sort_path || '.' || LPAD(child.order_index::TEXT, 4, '0')
                  FROM public.question_node child
                  INNER JOIN question_hierarchy qh ON child.parent_node_id = qh.node_id
                  WHERE child.thema_id = ?
                )
                SELECT 
                  qh.question_id,
                  qh.order_index,
                  q.text AS question_text,
                  q.options,
                  q.scoring_schema,
                  qt.input_type,
                  qt.name AS question_type_name
                FROM question_hierarchy qh
                JOIN public.question q ON q.id = qh.question_id
                JOIN public.question_type qt ON qt.id = q.type_id
                WHERE qh.question_id NOT IN (
                  -- Bereits beantwortete Fragen ausschließen
                  SELECT a.question_id 
                  FROM public.answer a 
                  WHERE a.session_id = ?
                )
                ORDER BY qh.sort_path ASC
                LIMIT 1
                """,
                ps -> { 
                    ps.setObject(1, themaId);  // Root-Fragen Filter
                    ps.setObject(2, themaId);  // Kinder Filter (Rekursion)
                    ps.setObject(3, sessionId); // Bereits beantwortet Filter
                },
                rs -> {
                    if (!rs.next()) return null;
                    
                    Map<String, Object> result = new java.util.HashMap<>();
                    result.put("questionId", UUID.fromString(rs.getString("question_id")));
                    result.put("index", rs.getInt("order_index"));
                    result.put("text", rs.getString("question_text"));
                    result.put("inputType", rs.getString("input_type"));
                    result.put("questionTypeName", rs.getString("question_type_name"));
                    result.put("isRequired", rs.getBoolean("is_required"));
                    
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
     * Findet die vorherige (letzte beantwortete) Frage in einer Session
     * Nutzt die hierarchische Sortierung via sort_path (wie findNextQuestion)
     * aber filtert nur auf bereits beantwortete Fragen und nimmt die letzte.
     * 
     * @param sessionId UUID der Session
     * @param themaId UUID des Themas
     * @return Map mit Frage-Details oder null wenn keine vorherige Frage existiert
     */
    @Nullable
    /**
     * Findet die vorherige (letzte beantwortete) Frage einer Session.
     * @param sessionId UUID der Session
     * @param themaId UUID des Themas
     * @return Map mit Frage-Details oder null wenn keine vorherige Frage existiert
     */
    public Map<String, Object> findPreviousQuestion(UUID sessionId, UUID themaId) {
        return findPreviousQuestion(sessionId, themaId, null);
    }
    
    /**
     * Findet die vorherige beantwortete Frage VOR einer bestimmten Frage.
     * @param sessionId UUID der Session
     * @param themaId UUID des Themas
     * @param excludedQuestionId Optional: Die aktuell angezeigte Frage (wird übersprungen)
     * @return Map mit Frage-Details oder null wenn keine vorherige Frage existiert
     */
    public Map<String, Object> findPreviousQuestion(UUID sessionId, UUID themaId, @Nullable UUID excludedQuestionId) {
        // Wenn excludedQuestionId gegeben ist, müssen wir filtern
        String excludeCondition = excludedQuestionId != null 
            ? "AND qh.question_id != ?" 
            : "";
        
        String sql = """
                -- Recursive CTE für hierarchische Fragenreihenfolge (identisch zu findNextQuestion)
                WITH RECURSIVE question_hierarchy AS (
                  -- Basis: Root-Fragen (ohne Parent)
                  SELECT 
                    qn.id as node_id,
                    qn.question_id,
                    qn.order_index,
                    qn.parent_node_id,
                    0 as depth,
                    LPAD(qn.order_index::TEXT, 4, '0') as sort_path
                  FROM public.question_node qn
                  WHERE qn.thema_id = ? 
                    AND qn.parent_node_id IS NULL
                  
                  UNION ALL
                  
                  -- Rekursion: Kinder der bereits gefundenen Nodes
                  SELECT 
                    child.id,
                    child.question_id,
                    child.order_index,
                    child.parent_node_id,
                    qh.depth + 1,
                    qh.sort_path || '.' || LPAD(child.order_index::TEXT, 4, '0')
                  FROM public.question_node child
                  INNER JOIN question_hierarchy qh ON child.parent_node_id = qh.node_id
                  WHERE child.thema_id = ?
                ),
                answered_questions AS (
                  -- Alle beantworteten Fragen mit Zeitstempel
                  SELECT 
                    a.question_id,
                    a.answered_at
                  FROM public.answer a
                  WHERE a.session_id = ?
                )
                SELECT 
                  qh.question_id,
                  qh.order_index,
                  q.text AS question_text,
                  q.options,
                  q.scoring_schema,
                  qt.input_type,
                  qt.name AS question_type_name,
                  aq.answered_at
                FROM question_hierarchy qh
                JOIN public.question q ON q.id = qh.question_id
                JOIN public.question_type qt ON qt.id = q.type_id
                JOIN answered_questions aq ON aq.question_id = qh.question_id
                WHERE 1=1
                """ + excludeCondition + """
                -- Nur beantwortete Fragen (via JOIN mit answered_questions)
                ORDER BY qh.sort_path DESC  -- Reverse: Letzte Frage zuerst
                LIMIT 1
                """;
        
        return jdbcTemplate.query(
                sql,
                ps -> { 
                    ps.setObject(1, themaId);   // Root-Fragen Filter
                    ps.setObject(2, themaId);   // Kinder Filter (Rekursion)
                    ps.setObject(3, sessionId); // Beantwortete Fragen Filter
                    if (excludedQuestionId != null) {
                        ps.setObject(4, excludedQuestionId); // Exclude current question
                    }
                },
                rs -> {
                    if (!rs.next()) return null;
                    
                    Map<String, Object> result = new java.util.HashMap<>();
                    result.put("questionId", UUID.fromString(rs.getString("question_id")));
                    result.put("index", rs.getInt("order_index"));
                    result.put("text", rs.getString("question_text"));
                    result.put("inputType", rs.getString("input_type"));
                    result.put("questionTypeName", rs.getString("question_type_name"));
                    
                    // Options als JSON String
                    String options = rs.getString("options");
                    result.put("options", options);
                    
                    // Scoring Schema als JSON String
                    String scoringSchema = rs.getString("scoring_schema");
                    result.put("scoringSchema", scoringSchema);
                    
                    // Bereits beantwortet
                    result.put("answered", true);
                    
                    // Timestamp der Antwort
                    java.sql.Timestamp timestamp = rs.getTimestamp("answered_at");
                    if (timestamp != null) {
                        result.put("answeredAt", timestamp.toLocalDateTime());
                    }
                    
                    return result;
                }
        );
    }

    /**
     * Holt alle beantworteten Fragen einer Session mit Details
     * Sortiert nach answered_at (chronologisch)
     * 
     * @param sessionId UUID der Session
     * @return List von Maps mit Frage-Details und Antworten
     */
    public java.util.List<Map<String, Object>> getAnsweredQuestionsWithDetails(UUID sessionId) {
        return jdbcTemplate.query(
                """
                SELECT 
                  q.id as question_id,
                  q.text as question_text,
                  q.options,
                  qt.input_type,
                  qt.name as question_type_name,
                  q.scoring_schema,
                  a.value as answer_value,
                  a.score,
                  a.answered_at,
                  qn.order_index,
                  qn.is_required
                FROM public.answer a
                JOIN public.question q ON q.id = a.question_id
                JOIN public.question_type qt ON qt.id = q.type_id
                JOIN public.question_node qn ON qn.question_id = q.id
                JOIN public.assessment_session s ON s.id = a.session_id AND qn.thema_id = s.thema_id
                WHERE a.session_id = ?
                ORDER BY a.answered_at ASC
                """,
                ps -> ps.setObject(1, sessionId),
                (rs, rowNum) -> {
                    Map<String, Object> result = new java.util.HashMap<>();
                    result.put("questionId", UUID.fromString(rs.getString("question_id")));
                    result.put("questionText", rs.getString("question_text"));
                    result.put("options", rs.getString("options")); // JSON String
                    result.put("inputType", rs.getString("input_type"));
                    result.put("questionTypeName", rs.getString("question_type_name"));
                    result.put("scoringSchema", rs.getString("scoring_schema"));
                    result.put("answerValue", rs.getString("answer_value")); // JSONB String
                    result.put("score", rs.getBigDecimal("score"));
                    result.put("answeredAt", rs.getTimestamp("answered_at").toLocalDateTime());
                    result.put("orderIndex", rs.getInt("order_index"));
                    result.put("isRequired", rs.getBoolean("is_required"));
                    return result;
                }
        );
    }
    
    /**
     * Berechnet max_possible_score NUR für required=true Fragen eines Themas
     */
    public java.math.BigDecimal calculateMaxPossibleScoreForRequiredQuestions(UUID themaId) {
        return jdbcTemplate.query(
                """
                SELECT 
                    q.id,
                    qt.input_type,
                    q.scoring_schema
                FROM public.question_node qn
                JOIN public.question q ON q.id = qn.question_id
                JOIN public.question_type qt ON qt.id = q.type_id
                WHERE qn.thema_id = ? AND qn.is_required = true
                ORDER BY qn.order_index
                """,
                ps -> ps.setObject(1, themaId),
                rs -> {
                    java.math.BigDecimal total = java.math.BigDecimal.ZERO;
                    while (rs.next()) {
                        String inputType = rs.getString("input_type");
                        String scoringSchemaJson = rs.getString("scoring_schema");
                        
                        // Berechne max Score für diese Frage
                        java.math.BigDecimal maxForQuestion = calculateMaxForSingleQuestion(inputType, scoringSchemaJson);
                        total = total.add(maxForQuestion);
                    }
                    return total;
                }
        );
    }
    
    /**
     * Helper: Berechnet max Score für eine einzelne Frage basierend auf inputType und scoringSchema
     */
    private java.math.BigDecimal calculateMaxForSingleQuestion(String inputType, String scoringSchemaJson) {
        // Für rating_scale: max = 5
        if ("rating_scale".equalsIgnoreCase(inputType) || "rating".equalsIgnoreCase(inputType)) {
            return java.math.BigDecimal.valueOf(5);
        }
        
        // Fallback wenn kein scoringSchema vorhanden
        if (scoringSchemaJson == null || scoringSchemaJson.isBlank()) {
            return java.math.BigDecimal.valueOf(5);
        }
        
        // Parse scoringSchema JSON und finde Maximum
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(scoringSchemaJson);
            
            double maxValue = 0.0;
            var iter = root.fields();
            while (iter.hasNext()) {
                var entry = iter.next();
                if (entry.getValue().isNumber()) {
                    double val = entry.getValue().asDouble(0.0);
                    if (val > maxValue) {
                        maxValue = val;
                    }
                }
            }
            return java.math.BigDecimal.valueOf(maxValue > 0 ? maxValue : 5.0);
        } catch (Exception e) {
            return java.math.BigDecimal.valueOf(5);
        }
    }

    /**
     * Berechnet max_possible_score für ein Thema:
     * - Auto-Scoring: Summe aller max Punkte aus scoring_schema
     * - Manual Scoring: 5 Punkte pro Frage
     * 
     * @param themaId UUID des Themas
     * @return max_possible_score als BigDecimal
     * @deprecated Use calculateMaxPossibleScoreForRequiredQuestions instead
     */
    @Deprecated
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