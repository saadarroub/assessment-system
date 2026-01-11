package com.assessment.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.assessment.backend.dto.AdminManualScoringResponseDTO;
import com.assessment.backend.dto.CatalogScoreDTO;
import com.assessment.backend.dto.OverallScoreDTO;
import com.assessment.backend.dto.SessionQuestionsTimelineDTO;
import com.assessment.backend.dto.ThemaScoreDTO;
import com.assessment.backend.dto.UpdateManualScoreRequestDTO;
import com.assessment.backend.entity.Answer;
import com.assessment.backend.entity.AssessmentSession;
import com.assessment.backend.repository.AnswerRepository;
import com.assessment.backend.repository.AssessmentSessionRepository;
import com.assessment.backend.service.AssessmentSessionService;
import com.assessment.backend.service.ScoringService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Controller für Score-Abfrage im Admin Panel (Firmen-basiert)
 * Alle Endpunkte sind nur für Admins zugänglich
 * Scores werden als Prozentsatz (0-100%) zurückgegeben
 * Nur completed Sessions werden berücksichtigt
 */
@RestController
@RequestMapping("/api/scoring")
@CrossOrigin(origins = "*")
public class ScoringController {

    // Typen die manuelle Bewertung benötigen (gleich wie in PublicAccessController)
    private static final Set<String> MANUAL_REVIEW_TYPES = Set.of(
        "text", 
        "number", 
        "date", 
        "order"
    );

    @Autowired
    private ScoringService scoringService;

    @Autowired
    private AssessmentSessionRepository assessmentSessionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private AssessmentSessionService assessmentSessionService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * GET /api/scoring/company/{companyId}/overall
     * Gesamtübersicht aller Scores für eine Firma
     * 
     * Response:
     * {
     *   "companyId": "uuid",
     *   "companyName": "Example GmbH",
     *   "averagePercentageScore": 75.5,
     *   "totalCompletedSessions": 150,
     *   "totalSessions": 200,
     *   "totalWorkers": 50,
     *   "totalCatalogs": 5,
     *   "catalogScores": [...]
     * }
     */
    @GetMapping("/company/{companyId}/overall")
    
    public ResponseEntity<?> getCompanyOverallScore(@PathVariable("companyId") String companyId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            OverallScoreDTO dto = scoringService.getCompanyOverallScore(companyUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Company not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid company ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/company/{companyId}/catalog/{catalogId}
     * Score für einen Catalog einer Firma (ohne Worker-Liste)
     * 
     * Response:
     * {
     *   "catalogId": "uuid",
     *   "catalogTitle": "Java Basics",
     *   "totalScore": 450.5,
     *   "maxPossibleScore": 600.0,
     *   "percentageScore": 75.08,
     *   "completedSessions": 30,
     *   "totalSessions": 40,
     *   "themaScores": [...],
     *   "workerScores": []
     * }
     */
    @GetMapping("/company/{companyId}/catalog/{catalogId}")
    
    public ResponseEntity<?> getCompanyCatalogScore(
            @PathVariable("companyId") String companyId,
            @PathVariable("catalogId") String catalogId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            UUID catalogUuid = UUID.fromString(catalogId);
            
            CatalogScoreDTO dto = scoringService.getCompanyCatalogScore(companyUuid, catalogUuid, false);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Catalog not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/company/{companyId}/catalog/{catalogId}/workers
     * Score für einen Catalog einer Firma (mit Worker-Liste)
     * 
     * Response:
     * {
     *   "catalogId": "uuid",
     *   "catalogTitle": "Java Basics",
     *   "totalScore": 450.5,
     *   "maxPossibleScore": 600.0,
     *   "percentageScore": 75.08,
     *   "completedSessions": 30,
     *   "totalSessions": 40,
     *   "themaScores": [...],
     *   "workerScores": [
     *     {
     *       "workerId": "uuid",
     *       "workerName": "Max Mustermann",
     *       "workerEmail": "max@example.com",
     *       "percentageScore": 88.5,
     *       "completedThemas": 3,
     *       "totalThemas": 3,
     *       "status": "completed"
     *     }
     *   ]
     * }
     */
    @GetMapping("/company/{companyId}/catalog/{catalogId}/workers")
    
    public ResponseEntity<?> getCompanyCatalogScoreWithWorkers(
            @PathVariable("companyId") String companyId,
            @PathVariable("catalogId") String catalogId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            UUID catalogUuid = UUID.fromString(catalogId);
            
            CatalogScoreDTO dto = scoringService.getCompanyCatalogScore(companyUuid, catalogUuid, true);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Catalog not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/company/{companyId}/thema/{themaId}
     * Score für ein Thema einer Firma
     * 
     * Response:
     * {
     *   "themaId": "uuid",
     *   "themaName": "OOP Concepts",
     *   "totalScore": 280.5,
     *   "maxPossibleScore": 400.0,
     *   "percentageScore": 70.13,
     *   "completedSessions": 15,
     *   "totalSessions": 20
     * }
     */
    @GetMapping("/company/{companyId}/thema/{themaId}")
    
    public ResponseEntity<?> getCompanyThemaScore(
            @PathVariable("companyId") String companyId,
            @PathVariable("themaId") String themaId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            UUID themaUuid = UUID.fromString(themaId);
            
            ThemaScoreDTO dto = scoringService.getCompanyThemaScore(companyUuid, themaUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Thema not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/worker/{workerId}/thema/{themaId}
     * Score für einen Worker in einem Thema
     * 
     * Response:
     * {
     *   "themaId": "uuid",
     *   "themaName": "OOP Concepts",
     *   "totalScore": 35.5,
     *   "maxPossibleScore": 40.0,
     *   "percentageScore": 88.75,
     *   "completedSessions": 1,
     *   "totalSessions": 2
     * }
     */
    @GetMapping("/worker/{workerId}/thema/{themaId}")
    
    public ResponseEntity<?> getWorkerThemaScore(
            @PathVariable("workerId") String workerId,
            @PathVariable("themaId") String themaId) {
        try {
            UUID workerUuid = UUID.fromString(workerId);
            UUID themaUuid = UUID.fromString(themaId);
            
            ThemaScoreDTO dto = scoringService.getWorkerThemaScore(workerUuid, themaUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Thema not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/worker/{workerId}/catalog/{catalogId}
     * Score für einen Worker in einem Catalog
     * 
     * Response:
     * {
     *   "catalogId": "uuid",
     *   "catalogTitle": "Java Basics",
     *   "totalScore": 115.5,
     *   "maxPossibleScore": 120.0,
     *   "percentageScore": 96.25,
     *   "completedSessions": 3,
     *   "totalSessions": 3,
     *   "themaScores": [...],
     *   "workerScores": []
     * }
     */
    @GetMapping("/worker/{workerId}/catalog/{catalogId}")
    
    public ResponseEntity<?> getWorkerCatalogScore(
            @PathVariable("workerId") String workerId,
            @PathVariable("catalogId") String catalogId) {
        try {
            UUID workerUuid = UUID.fromString(workerId);
            UUID catalogUuid = UUID.fromString(catalogId);
            
            CatalogScoreDTO dto = scoringService.getWorkerCatalogScore(workerUuid, catalogUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Catalog not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/admin/sessions/{sessionId}/questions-timeline
     * Holt alle Fragen einer Session in chronologischer Antwort-Reihenfolge
     * Mit Status-Markierung für Frontend-Farben
     * 
     * Response:
     * {
     *   "sessionId": "uuid",
     *   "status": "completed",
     *   "totalScore": 45.5,
     *   "maxPossibleScore": 60.0,
     *   "questions": [
     *     {
     *       "questionId": "uuid",
     *       "questionText": "Was ist OOP?",
     *       "inputType": "text_input",
     *       "answeredValue": "Object Oriented Programming",
     *       "score": 0.0,
     *       "maxScore": 10.0,
     *       "answeredAt": "2025-11-17T10:30:00",
     *       "status": "manual"  // "automatic", "manual", "skipped"
     *     }
     *   ],
     *   "totalQuestions": 8,
     *   "answeredCount": 7,
     *   "skippedCount": 1,
     *   "automaticCount": 5,
     *   "manualCount": 2
     * }
     */
    @GetMapping("/admin/sessions/{sessionId}/questions-timeline")
    public ResponseEntity<?> getSessionQuestionsTimeline(@PathVariable("sessionId") String sessionId) {
        try {
            UUID sessionUuid = UUID.fromString(sessionId);
            
            // 1. Session laden
            AssessmentSession session = assessmentSessionRepository.findById(sessionUuid)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            // 2. Response DTO erstellen
            SessionQuestionsTimelineDTO response = new SessionQuestionsTimelineDTO();
            response.setSessionId(session.getId());
            response.setStatus(session.getStatus());
            response.setWorkerId(session.getWorkerId());
            response.setThemaId(session.getThemaId());
            response.setCreatedAt(session.getCreatedAt());
            response.setCompletedAt(session.getCompletedAt());
            response.setTotalScore(session.getTotalScore());
            response.setMaxPossibleScore(session.getMaxPossibleScore());
            
            // Prozentsatz berechnen
            if (session.getMaxPossibleScore() != null && session.getMaxPossibleScore().compareTo(BigDecimal.ZERO) > 0) {
                double percentage = session.getTotalScore()
                        .divide(session.getMaxPossibleScore(), 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                response.setPercentageScore(percentage);
            }
           
           // 3. Worker Name holen
            String workerName = jdbcTemplate.queryForObject(
                "SELECT name FROM worker WHERE id = ?",
                String.class,
                session.getWorkerId()
            );
            response.setWorkerName(workerName);
            
            // 4. Thema Name holen
            String themaName = jdbcTemplate.queryForObject(
                "SELECT name FROM thema WHERE id = ?",
                String.class,
                session.getThemaId()
            );
            response.setThemaName(themaName); 
         
            
            // 5. Alle Fragen mit Antworten holen - SORTIERT NACH answered_at
            String sql = """
                SELECT 
                    q.id as question_id,
                    q.text as question_text,
                    qt.input_type,
                    qn.order_index,
                    qn.is_required,
                    q.is_scorable,
                    a.value::text as answer_value,
                    a.score,
                    a.answered_at,
                    q.scoring_schema::text as scoring_schema
                FROM question_node qn
                JOIN question q ON qn.question_id = q.id
                JOIN question_type qt ON q.type_id = qt.id
                LEFT JOIN answer a ON a.question_id = q.id AND a.session_id = ?
                WHERE qn.thema_id = ?
                ORDER BY 
                    CASE WHEN a.answered_at IS NULL THEN 1 ELSE 0 END,
                    a.answered_at ASC,
                    qn.order_index ASC
            """;
            
            List<Map<String, Object>> questionsData = jdbcTemplate.queryForList(sql, sessionUuid, session.getThemaId());
            
            // 6. Fragen in Timeline-Format konvertieren und kategorisieren
            List<SessionQuestionsTimelineDTO.QuestionTimeline> timeline = new ArrayList<>();
            int skippedCount = 0;
            int automaticCount = 0;
            int manualCount = 0;
            int answeredCount = 0;
            
            for (Map<String, Object> data : questionsData) {
                SessionQuestionsTimelineDTO.QuestionTimeline q = new SessionQuestionsTimelineDTO.QuestionTimeline();
                
                q.setQuestionId((UUID) data.get("question_id"));
                q.setQuestionText((String) data.get("question_text"));
                q.setInputType((String) data.get("input_type"));
                q.setOrderIndex((Integer) data.get("order_index"));
                q.setIsRequired((Boolean) data.get("is_required"));
                
                String answerValueJson = (String) data.get("answer_value");
                BigDecimal score = (BigDecimal) data.get("score");
                LocalDateTime answeredAt = data.get("answered_at") != null ? 
                    ((java.sql.Timestamp) data.get("answered_at")).toLocalDateTime() : null;
                
                q.setAnsweredAt(answeredAt);
                q.setScore(score); // null = noch nicht bewertet, Wert = bewertet
                
                // Antwort-Wert parsen
                if (answerValueJson != null && !"null".equals(answerValueJson)) {
                    try {
                        q.setAnsweredValue(objectMapper.readValue(answerValueJson, Object.class));
                    } catch (Exception e) {
                        q.setAnsweredValue(answerValueJson);
                    }
                }
                
                // Status für Frontend bestimmen (ZUERST prüfen ob bewertbar)
                Boolean isScorable = (Boolean) data.get("is_scorable");
                boolean notScorable = (isScorable != null && !isScorable);
                
                // Max Score berechnen - wenn nicht bewertbar → 0
                String scoringSchemaJson = (String) data.get("scoring_schema");
                BigDecimal maxScore;
                if (notScorable) {
                    maxScore = BigDecimal.ZERO; // Nicht bewertbar = kein MaxScore
                } else {
                    maxScore = calculateMaxScoreForQuestion(q.getInputType(), scoringSchemaJson);
                }
                q.setMaxScore(maxScore);
                
                if (answerValueJson == null || "null".equals(answerValueJson) || notScorable) {
                    q.setStatus(notScorable ? "not_scorable" : "skipped");
                    skippedCount++;
                } else if (MANUAL_REVIEW_TYPES.contains(q.getInputType())) {
                    q.setStatus("manual");
                    manualCount++;
                    answeredCount++;
                } else {
                    q.setStatus("automatic");
                    automaticCount++;
                    answeredCount++;
                }
                
                timeline.add(q);
            }
            
            // 7. Statistiken setzen
            response.setQuestions(timeline);
            response.setTotalQuestions(questionsData.size());
            response.setAnsweredCount(answeredCount);
            response.setSkippedCount(skippedCount);
            response.setAutomaticCount(automaticCount);
            response.setManualCount(manualCount);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid session ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/admin/sessions/{sessionId}/manual-scoring
     * Holt alle Fragen einer Session kategorisiert für Admin Manual Scoring
     * Zeigt automatisch bewertete, manuell zu bewertende und übersprungene Fragen
     * 
     * Response:
     * {
     *   "sessionId": "uuid",
     *   "status": "completed",
     *   "workerId": "uuid",
     *   "workerName": "Max Mustermann",
     *   "themaId": "uuid",
     *   "themaName": "OOP Concepts",
     *   "totalScore": 45.5,
     *   "maxPossibleScore": 60.0,
     *   "percentageScore": 75.83,
     *   "automatischBewerteteFragen": [...],
     *   "manuellZuBewertendeFragen": [...],
     *   "uebersprungeneFragen": [...],
     *   "automatischBewertetAnzahl": 5,
     *   "manuellZuBewertenAnzahl": 2,
     *   "uebersprungenAnzahl": 1,
     *   "totalQuestions": 8
     * }
     */
    @GetMapping("/admin/sessions/{sessionId}/manual-scoring")
    public ResponseEntity<?> getSessionForManualScoring(@PathVariable("sessionId") String sessionId) {
        try {
            UUID sessionUuid = UUID.fromString(sessionId);
            
            // 1. Session laden
            AssessmentSession session = assessmentSessionRepository.findById(sessionUuid)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            // 2. Response DTO erstellen
            AdminManualScoringResponseDTO response = new AdminManualScoringResponseDTO();
            response.setSessionId(session.getId());
            response.setStatus(session.getStatus());
            response.setWorkerId(session.getWorkerId());
            response.setThemaId(session.getThemaId());
            response.setCreatedAt(session.getCreatedAt());
            response.setCompletedAt(session.getCompletedAt());
            response.setTotalScore(session.getTotalScore());
            response.setMaxPossibleScore(session.getMaxPossibleScore());
            
            // Prozentsatz berechnen
            if (session.getMaxPossibleScore() != null && session.getMaxPossibleScore().compareTo(BigDecimal.ZERO) > 0) {
                double percentage = session.getTotalScore()
                        .divide(session.getMaxPossibleScore(), 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                response.setPercentageScore(percentage);
            }
            
            // 3. Worker Name holen
            String workerName = jdbcTemplate.queryForObject(
                "SELECT name FROM worker WHERE id = ?",
                String.class,
                session.getWorkerId()
            );
            response.setWorkerName(workerName);
            
            // 4. Thema Name holen
            String themaName = jdbcTemplate.queryForObject(
                "SELECT name FROM thema WHERE id = ?",
                String.class,
                session.getThemaId()
            );
            response.setThemaName(themaName);
            
            // 5. Alle Fragen der Session holen (mit Antworten)
            String sql = """
                SELECT 
                    q.id as question_id,
                    q.text as question_text,
                    qt.input_type,
                    qn.order_index,
                    qn.is_required,
                    q.is_scorable,
                    a.value::text as answer_value,
                    a.score,
                    a.answered_at,
                    q.scoring_schema::text as scoring_schema
                FROM question_node qn
                JOIN question q ON qn.question_id = q.id
                JOIN question_type qt ON q.type_id = qt.id
                LEFT JOIN answer a ON a.question_id = q.id AND a.session_id = ?
                WHERE qn.thema_id = ?
                ORDER BY qn.order_index ASC
            """;
            
            List<Map<String, Object>> questionsData = jdbcTemplate.queryForList(sql, sessionUuid, session.getThemaId());
            
            // 6. Fragen kategorisieren
            List<AdminManualScoringResponseDTO.QuestionForScoring> automatischBewertet = new ArrayList<>();
            List<AdminManualScoringResponseDTO.QuestionForScoring> manuellZuBewerten = new ArrayList<>();
            List<AdminManualScoringResponseDTO.QuestionForScoring> uebersprungen = new ArrayList<>();
            
            for (Map<String, Object> data : questionsData) {
                AdminManualScoringResponseDTO.QuestionForScoring q = new AdminManualScoringResponseDTO.QuestionForScoring();
                
                q.setQuestionId((UUID) data.get("question_id"));
                q.setQuestionText((String) data.get("question_text"));
                q.setInputType((String) data.get("input_type"));
                q.setOrderIndex((Integer) data.get("order_index"));
                q.setIsRequired((Boolean) data.get("is_required"));
                
                String answerValueJson = (String) data.get("answer_value");
                BigDecimal score = (BigDecimal) data.get("score");
                LocalDateTime answeredAt = data.get("answered_at") != null ? 
                    ((java.sql.Timestamp) data.get("answered_at")).toLocalDateTime() : null;
                
                q.setAnsweredAt(answeredAt);
                q.setScore(score); // null = noch nicht bewertet, Wert = bewertet
                
                // Antwort-Wert parsen
                if (answerValueJson != null && !"null".equals(answerValueJson)) {
                    try {
                        q.setAnsweredValue(objectMapper.readValue(answerValueJson, Object.class));
                    } catch (Exception e) {
                        q.setAnsweredValue(answerValueJson);
                    }
                }
                
                // Kategorisierung (ZUERST prüfen ob bewertbar)
                Boolean isScorable = (Boolean) data.get("is_scorable");
                boolean notScorable = (isScorable != null && !isScorable);
                
                // Max Score berechnen - wenn nicht bewertbar → 0
                String scoringSchemaJson = (String) data.get("scoring_schema");
                BigDecimal maxScore;
                if (notScorable) {
                    maxScore = BigDecimal.ZERO; // Nicht bewertbar = kein MaxScore
                } else {
                    maxScore = calculateMaxScoreForQuestion(q.getInputType(), scoringSchemaJson);
                }
                q.setMaxScore(maxScore);
                
                if (notScorable || answerValueJson == null || "null".equals(answerValueJson)) {
                    // Übersprungen: value ist null ODER nicht bewertbar
                    uebersprungen.add(q);
                } else if (MANUAL_REVIEW_TYPES.contains(q.getInputType())) {
                    // Manuelle Bewertung: Nur wenn Score = null oder 0 (noch nicht bewertet)
                    // Wenn Score > 0, wurde bereits bewertet → automatischBewertet
                    if (score == null || score.compareTo(BigDecimal.ZERO) == 0) {
                        manuellZuBewerten.add(q);
                    } else {
                        automatischBewertet.add(q);
                    }
                } else {
                    // Automatisch bewertet
                    automatischBewertet.add(q);
                }
            }
            
            // 7. Listen und Zähler setzen
            response.setAutomatischBewerteteFragen(automatischBewertet);
            response.setManuellZuBewertendeFragen(manuellZuBewerten);
            response.setUebersprungeneFragen(uebersprungen);
            
            response.setAutomatischBewertetAnzahl(automatischBewertet.size());
            response.setManuellZuBewertenAnzahl(manuellZuBewerten.size());
            response.setUebersprungenAnzahl(uebersprungen.size());
            response.setTotalQuestions(questionsData.size());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid session ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * PUT /api/scoring/admin/sessions/{sessionId}/answers/{questionId}/score
     * Admin aktualisiert Score für eine manuelle Frage
     * Berechnet automatisch die Session Totals neu
     * 
     * Request Body:
     * {
     *   "score": 8.5
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "sessionId": "uuid",
     *   "questionId": "uuid",
     *   "newScore": 8.5,
     *   "totalScore": 53.5,
     *   "maxPossibleScore": 60.0,
     *   "percentageScore": 89.17
     * }
     */
    @PutMapping("/admin/sessions/{sessionId}/answers/{questionId}/score")
    @Transactional
    public ResponseEntity<?> updateManualScore(
            @PathVariable("sessionId") String sessionId,
            @PathVariable("questionId") String questionId,
            @RequestBody UpdateManualScoreRequestDTO request) {
        try {
            UUID sessionUuid = UUID.fromString(sessionId);
            UUID questionUuid = UUID.fromString(questionId);
            
            // 1. Validierung
            if (request.getScore() == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Score is required"), 
                    HttpStatus.BAD_REQUEST
                );
            }
            
            if (request.getScore().compareTo(BigDecimal.ZERO) < 0) {
                return new ResponseEntity<>(
                    Map.of("error", "Score must be non-negative"), 
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // 2. Session existiert?
            AssessmentSession session = assessmentSessionRepository.findById(sessionUuid)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            // 3. Answer existiert?
            Answer answer = answerRepository.findBySessionIdAndQuestionId(sessionUuid, questionUuid)
                    .orElseThrow(() -> new RuntimeException("Answer not found"));
            
            // 4. Score aktualisieren
            answer.setScore(request.getScore());
            answerRepository.saveAndFlush(answer);  // Flush to DB before recalculation
            
            // 5. Session Totals neu berechnen
            assessmentSessionService.recalculateTotals(sessionUuid);
            
            // 6. Aktualisierte Session laden
            session = assessmentSessionRepository.findById(sessionUuid).orElseThrow();
            
            // 7. Prozentsatz berechnen
            Double percentageScore = null;
            if (session.getMaxPossibleScore() != null && session.getMaxPossibleScore().compareTo(BigDecimal.ZERO) > 0) {
                percentageScore = session.getTotalScore()
                        .divide(session.getMaxPossibleScore(), 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }
            
            // 8. Response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sessionId", sessionUuid);
            response.put("questionId", questionUuid);
            response.put("newScore", request.getScore());
            response.put("totalScore", session.getTotalScore());
            response.put("maxPossibleScore", session.getMaxPossibleScore());
            response.put("percentageScore", percentageScore);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage()), 
                HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Hilfsmethode: Berechnet max mögliche Punkte für eine einzelne Frage
     * (Gleiche Logik wie in PublicAccessController)
     */
    private BigDecimal calculateMaxScoreForQuestion(String inputType, String scoringSchemaJson) {
        // Manual review types always get 6 points (0-6 scale)
        if (MANUAL_REVIEW_TYPES.contains(inputType)) {
            return BigDecimal.valueOf(6);
        }
        
        if (scoringSchemaJson == null || scoringSchemaJson.isBlank()) {
            return BigDecimal.ZERO;
        }

        try {
            var root = objectMapper.readTree(scoringSchemaJson);
            
            // 1. Single Choice (radio, dropdown)
            if ("radio".equals(inputType) || "dropdown".equals(inputType)) {
                BigDecimal max = BigDecimal.ZERO;
                var it = root.fields();
                while (it.hasNext()) {
                    var entry = it.next();
                    if (entry.getValue().isNumber()) {
                        BigDecimal val = BigDecimal.valueOf(entry.getValue().asDouble());
                        if (val.compareTo(max) > 0) {
                            max = val;
                        }
                    }
                }
                return max;
            }
            
            // 2. Multiple Choice (checkbox)
            if ("checkbox".equals(inputType)) {
                BigDecimal sum = BigDecimal.ZERO;
                var it = root.fields();
                while (it.hasNext()) {
                    var entry = it.next();
                    if (entry.getValue().isNumber()) {
                        BigDecimal val = BigDecimal.valueOf(entry.getValue().asDouble());
                        if (val.compareTo(BigDecimal.ZERO) > 0) {
                            sum = sum.add(val);
                        }
                    }
                }
                return sum;
            }
            
            // 3. Rating/Slider
            if ("rating".equals(inputType) || "slider".equals(inputType)) {
                if (root.has("maxPoints")) {
                    return BigDecimal.valueOf(root.get("maxPoints").asDouble());
                }
                return BigDecimal.ZERO;
            }
            
            // 4. Boolean (Ja/Nein)
            if ("boolean".equals(inputType)) {
                BigDecimal truePoints = root.has("true") ? 
                    BigDecimal.valueOf(root.get("true").asDouble()) : BigDecimal.ZERO;
                BigDecimal falsePoints = root.has("false") ? 
                    BigDecimal.valueOf(root.get("false").asDouble()) : BigDecimal.ZERO;
                return truePoints.max(falsePoints);
            }
            
            // Default
            return BigDecimal.ZERO;
            
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
