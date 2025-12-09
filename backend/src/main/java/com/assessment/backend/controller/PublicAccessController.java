package com.assessment.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.assessment.backend.dto.SaveAnswerResponseDTO;
import com.assessment.backend.dto.SessionStateResponseDTO;
import com.assessment.backend.dto.SessionSummaryResponseDTO;
import com.assessment.backend.entity.Answer;
import com.assessment.backend.entity.AssessmentSession;
import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.entity.ThemaCatalog;
import com.assessment.backend.entity.WorkerCatalog;
import com.assessment.backend.service.AnswerService;
import com.assessment.backend.service.AssessmentSessionService;
import com.assessment.backend.service.AutoScoringService;
import com.assessment.backend.service.CatalogService;
import com.assessment.backend.service.ThemaCatalogService;
import com.assessment.backend.service.WorkerCatalogService;
import com.assessment.backend.util.AccessGuardUtil;
import com.assessment.backend.util.PublicQueryUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/public/access")
@CrossOrigin(origins = "*")
public class PublicAccessController {

    // Typen die manuelle Bewertung benötigen (score wird auf 0 gesetzt)
    private static final Set<String> MANUAL_REVIEW_TYPES = Set.of(
        "text_input", 
        "number_input", 
        "date_input", 
        "ordering"
    );

    @Autowired
    private WorkerCatalogService workerCatalogService;

    @Autowired
    private CatalogService catalogService;

    @Autowired
    private ThemaCatalogService themaCatalogService;

    @Autowired
    private AssessmentSessionService assessmentSessionService;

    @Autowired
    private AnswerService answerService;

    @Autowired
    private PublicQueryUtil publicQueryUtil;

    @Autowired
    private AutoScoringService autoScoringService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.assessment.backend.repository.ThemaRepository themaRepository;

    /**
     * Hilfsmethode: Ermittelt den input_type einer Frage
     */
    private String getQuestionInputType(UUID questionId) {
        return publicQueryUtil.getQuestionInputType(questionId);
    }

    /**
     * Hilfsmethode: Normalisiert den input_type (analog zu AutoScoringService)
     */
    private String normalizeInputType(String inputType) {
        String s = inputType == null ? "" : inputType.toLowerCase();
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

    /**
     * Hilfsmethode: Validiert Rating-Wert (muss Integer 0-5 sein)
     * @return Integer-Wert wenn gültig, sonst null
     */
    private Integer validateRatingValue(Object value) {
        if (value == null) return null;
        
        try {
            int intValue;
            if (value instanceof Number) {
                double d = ((Number) value).doubleValue();
                // Prüfen ob ganzzahlig
                if (d != Math.floor(d)) return null;
                intValue = (int) d;
            } else if (value instanceof String) {
                intValue = Integer.parseInt(((String) value).trim());
            } else if (value instanceof Map) {
                // Falls als Objekt mit "value" oder "rating" Feld gesendet
                Map<?, ?> map = (Map<?, ?>) value;
                Object innerValue = map.get("value");
                if (innerValue == null) innerValue = map.get("rating");
                if (innerValue == null) return null;
                return validateRatingValue(innerValue);
            } else {
                return null;
            }
            
            // Validierung: 0-6
            if (intValue < 0 || intValue > 6) return null;
            return intValue;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * GET /public/access/{accessToken}/meta
     * Gibt Katalog-Metadaten ohne Code-Verifizierung zurück
     * (Für die Landing-Page mit Code-Eingabe)
     */
    @GetMapping("/{accessToken}/meta")
    public ResponseEntity<?> getAccessMeta(@PathVariable("accessToken") String accessToken) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(
                    Map.of("error", "Invalid or expired access link"), 
                    HttpStatus.NOT_FOUND
                );
            }

            WorkerCatalog assignment = assignmentOpt.get();

            // Prüfen ob abgelaufen
            if (assignment.getExpiresAt() != null && 
                LocalDateTime.now().isAfter(assignment.getExpiresAt())) {
                return new ResponseEntity<>(
                    Map.of(
                        "error", "Access expired",
                        "expiresAt", assignment.getExpiresAt().toString()
                    ), 
                    HttpStatus.FORBIDDEN
                );
            }

            // Prüfen ob revoked
            if ("revoked".equals(assignment.getStatus()) || "expired".equals(assignment.getStatus())) {
                return new ResponseEntity<>(
                    Map.of("error", "Access has been revoked"), 
                    HttpStatus.FORBIDDEN
                );
            }

            // TODO : name des workers mit zurückgeben 
            // Meta-Informationen zurückgeben
            Map<String, Object> meta = new HashMap<>();
            meta.put("catalogTitle", assignment.getCatalog().getTitle());
            meta.put("catalogDescription", assignment.getCatalog().getDescription());
            meta.put("companyName", assignment.getCompany().getName());
            meta.put("workerRef", assignment.getWorker().getWorkSpaceRef());
            meta.put("status", assignment.getStatus());
            meta.put("expiresAt", assignment.getExpiresAt());
            meta.put("requiresCode", true);

            return new ResponseEntity<>(meta, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST /public/access/{accessToken}/verify
     * Verifiziert den Access Code und gibt JWT-Token zurück
     * Body: { "code": "ERC78X" }
     */
    @PostMapping("/{accessToken}/verify")
    public ResponseEntity<?> verifyAccessCode(
            @PathVariable("accessToken") String accessToken,
            @RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            if (code == null || code.isBlank()) {
                return new ResponseEntity<>(Map.of("error", "Access code is required"), HttpStatus.BAD_REQUEST);
            }

            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();

            if (assignment.getExpiresAt() != null && LocalDateTime.now().isAfter(assignment.getExpiresAt())) {
                return new ResponseEntity<>(Map.of("error", "Access expired"), HttpStatus.FORBIDDEN);
            }
            String status = assignment.getStatus() != null ? assignment.getStatus().toLowerCase() : "";
            if ("revoked".equals(status) || "expired".equals(status)) {
                return new ResponseEntity<>(Map.of("error", "Access has been revoked"), HttpStatus.FORBIDDEN);
            }

            if (!code.trim().equalsIgnoreCase(assignment.getAccessCode())) {
                return new ResponseEntity<>(Map.of("error", "Invalid access code"), HttpStatus.UNAUTHORIZED);
            }

            // Update + Flush
            WorkerCatalog updated = workerCatalogService.markVerified(assignment.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Access code verified");
            response.put("assignmentId", updated.getId());
            response.put("catalogId", updated.getCatalog().getId());
            response.put("workerId", updated.getWorker() != null ? updated.getWorker().getId() : null);
            response.put("status", updated.getStatus());
            response.put("firstAccessAt", updated.getFirstAccessAt());
            response.put("lastAccessAt", updated.getLastAccessAt());
            response.put("sessionToken", accessToken);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /public/access/{accessToken}/catalog
     * Gibt den Katalog mit allen Themas zurück (nach erfolgreicher Code-Verifizierung)
     */
    @GetMapping("/{accessToken}/catalog")
    public ResponseEntity<?> getCatalogContent(@PathVariable("accessToken") String accessToken) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }

            WorkerCatalog assignment = assignmentOpt.get();
            
            // Guard MUSS zuerst kommen, bevor touchLastAccess
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            Catalog catalog = assignment.getCatalog();
            List<ThemaCatalog> themaCatalogs = themaCatalogService.getThemaCatalogsByCatalogId(catalog.getId());

            List<Map<String, Object>> themas = themaCatalogs.stream().map(tc -> {
                Thema t = tc.getThema();
                Map<String, Object> m = new HashMap<>();
                m.put("id", t.getId());
                m.put("name", t.getName());
                m.put("description", t.getDescription());
                return m;
            }).collect(Collectors.toList());

            // Erst NACH Guard: touchLastAccess
            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            return new ResponseEntity<>(Map.of(
                "catalog", Map.of(
                    "id", catalog.getId(),
                    "title", catalog.getTitle(),
                    "description", catalog.getDescription()
                ),
                "themas", themas
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /public/access/{accessToken}/thema/{themaId}/questions
     * Gibt den Question-Baum für ein Thema zurück
     */
    @GetMapping("/{accessToken}/thema/{themaId}/questions")
    public ResponseEntity<?> getThemaQuestions(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("themaId") String themaId) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(
                    Map.of("error", "Invalid access link"), 
                    HttpStatus.NOT_FOUND
                );
            }

            WorkerCatalog assignment = assignmentOpt.get();

            // Prüfen ob Code bereits verifiziert wurde
            if ("assigned".equals(assignment.getStatus())) {
                return new ResponseEntity<>(
                    Map.of("error", "Access code not verified yet"), 
                    HttpStatus.UNAUTHORIZED
                );
            }

            // TODO: Hier QuestionNodes für das Thema laden
            // questionNodeService.getRootNodesByThemaIdWithDetails(themaId)

            return new ResponseEntity<>(
                Map.of("message", "Questions endpoint - to be implemented"),
                HttpStatus.OK
            );

        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /public/access/{accessToken}/themas
     * Übersicht aller Themas im zugewiesenen Katalog inkl. Progress
     */
    @GetMapping("/{accessToken}/themas")
    public ResponseEntity<?> listThemas(@PathVariable("accessToken") String accessToken) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            Catalog catalog = assignment.getCatalog();
            List<ThemaCatalog> themaCatalogs = themaCatalogService.getThemaCatalogsByCatalogId(catalog.getId());

            UUID workerId = assignment.getWorker() != null ? assignment.getWorker().getId() : null;

            List<Map<String, Object>> themas = themaCatalogs.stream().map(tc -> {
                Thema t = tc.getThema();
                UUID themaId = t.getId();

                AssessmentSession session = (workerId != null)
                        ? assessmentSessionService.findLatest(workerId, themaId)
                        : null;

                int totalQuestions = publicQueryUtil.countQuestionsByThema(themaId);
                long answered = (session != null) ? answerService.countAnswered(session.getId()) : 0L;

                Map<String, Object> next = null;
                if (session != null && !"completed".equals(session.getStatus())) {
                    next = publicQueryUtil.findNextQuestion(session.getId(), themaId);
                }

                Map<String, Object> m = new HashMap<>();
                m.put("themaId", themaId);
                m.put("name", t.getName());
                m.put("totalQuestions", totalQuestions);
                m.put("answered", answered);
                m.put("sessionStatus", session != null ? session.getStatus() : null);
                m.put("resumeIndex", next != null ? next.get("index") : null);
                m.put("totalScore", session != null ? session.getTotalScore() : null);
                m.put("sessionId", session != null ? session.getId() : null);
                return m;
            }).collect(Collectors.toList());

            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            return new ResponseEntity<>(Map.of(
                "themas", themas,
                "assignment", Map.of(
                    "id", assignment.getId(),
                    "status", assignment.getStatus(),
                    "firstAccessAt", assignment.getFirstAccessAt(),
                    "lastAccessAt", LocalDateTime.now(),
                    "expiresAt", assignment.getExpiresAt()
                ),
                "catalog", Map.of(
                    "id", catalog.getId(),
                    "title", catalog.getTitle()
                )
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /public/access/{accessToken}/themas/{themaId}/start
     * Session je Thema starten/fortsetzen und erste offene Frage zurückgeben
     */
    @PostMapping("/{accessToken}/themas/{themaId}/start")
    public ResponseEntity<?> startThema(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("themaId") String themaId) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            UUID themaUuid = AccessGuardUtil.parseUuidOrNull(themaId);
            if (themaUuid == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid themaId format"), HttpStatus.BAD_REQUEST);
            }

            boolean allowed = AccessGuardUtil.themaInAssignedCatalog(themaUuid, assignment, themaCatalogService);
            if (!allowed) {
                return new ResponseEntity<>(Map.of("error", "Thema not part of assigned catalog"), HttpStatus.FORBIDDEN);
            }

            UUID workerId = assignment.getWorker() != null ? assignment.getWorker().getId() : null;
            UUID companyId = assignment.getCompany() != null ? assignment.getCompany().getId() : null;

            AssessmentSession session = assessmentSessionService.getOrCreate(companyId, workerId, themaUuid);
            session = assessmentSessionService.advanceToInProgress(session.getId());

            Map<String, Object> next = publicQueryUtil.findNextQuestion(session.getId(), themaUuid);

            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            Map<String, Object> payload = new HashMap<>();
            payload.put("sessionId", session.getId());
            payload.put("status", session.getStatus());
            payload.put("themaId", session.getThemaId());
            payload.put("firstOrNextQuestion", next); // {questionId, index} oder null
            return new ResponseEntity<>(payload, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /public/access/{accessToken}/sessions/{sessionId}/state
     * Status + Fortschritt einer Session
     */
    @GetMapping("/{accessToken}/sessions/{sessionId}/state")
    public ResponseEntity<?> getSessionState(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("sessionId") String sessionId) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            UUID sessionUuid = AccessGuardUtil.parseUuidOrNull(sessionId);
            if (sessionUuid == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid sessionId format"), HttpStatus.BAD_REQUEST);
            }

            AssessmentSession session = assessmentSessionService.get(sessionUuid);
            ResponseEntity<?> ownDenied = AccessGuardUtil.guardSessionOwnership(assignment, session, themaCatalogService);
            if (ownDenied != null) return ownDenied;

            long answered = answerService.countAnswered(session.getId());
            int total = publicQueryUtil.countQuestionsByThema(session.getThemaId());
            
            // Berechne Progress-Prozent (0-100, ohne Nachkommastellen)
            int progressPercent = total > 0 ? (int) Math.round((answered * 100.0) / total) : 0;

            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            SessionStateResponseDTO response = new SessionStateResponseDTO(
                session.getStatus(),
                answered,
                total,
                progressPercent,
                session.getThemaId()
            );

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /public/access/{accessToken}/sessions/{sessionId}/next
     * Liefert die nächste unbeantwortete Frage (id + order_index)
     */
    @GetMapping("/{accessToken}/sessions/{sessionId}/next")
    public ResponseEntity<?> nextQuestion(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("sessionId") String sessionId) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            UUID sessionUuid = AccessGuardUtil.parseUuidOrNull(sessionId);
            if (sessionUuid == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid sessionId format"), HttpStatus.BAD_REQUEST);
            }

            AssessmentSession session = assessmentSessionService.get(sessionUuid);
            ResponseEntity<?> ownDenied = AccessGuardUtil.guardSessionOwnership(assignment, session, themaCatalogService);
            if (ownDenied != null) return ownDenied;

            var next = publicQueryUtil.findNextQuestion(session.getId(), session.getThemaId());
            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            if (next == null) return new ResponseEntity<>(Map.of("done", true), HttpStatus.NO_CONTENT);
            return new ResponseEntity<>(next, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /public/access/{accessToken}/sessions/{sessionId}/previous
     * Liefert die vorherige (letzte beantwortete) Frage MIT gespeicherter Antwort
     * 
     * @param currentQuestionId Optional: Die aktuell angezeigte Frage (wird übersprungen)
     * Wenn nicht angegeben, wird die absolut letzte beantwortete Frage zurückgegeben
     */
    @GetMapping("/{accessToken}/sessions/{sessionId}/previous")
    public ResponseEntity<?> previousQuestion(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("sessionId") String sessionId,
            @RequestParam(required = false) String currentQuestionId) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            UUID sessionUuid = AccessGuardUtil.parseUuidOrNull(sessionId);
            if (sessionUuid == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid sessionId format"), HttpStatus.BAD_REQUEST);
            }

            AssessmentSession session = assessmentSessionService.get(sessionUuid);
            ResponseEntity<?> ownDenied = AccessGuardUtil.guardSessionOwnership(assignment, session, themaCatalogService);
            if (ownDenied != null) return ownDenied;

            // Parse optional currentQuestionId
            UUID excludedQuestionId = null;
            if (currentQuestionId != null && !currentQuestionId.isBlank()) {
                excludedQuestionId = AccessGuardUtil.parseUuidOrNull(currentQuestionId);
            }

            // Finde vorherige Frage (optional excluding current)
            Map<String, Object> previous = publicQueryUtil.findPreviousQuestion(
                session.getId(), 
                session.getThemaId(), 
                excludedQuestionId
            );
            
            if (previous == null) {
                // Keine vorherige Frage vorhanden
                return new ResponseEntity<>(Map.of("atStart", true), HttpStatus.NO_CONTENT);
            }

            // Hole die gespeicherte Antwort
            UUID questionId = (UUID) previous.get("questionId");
            Answer answer = answerService.getAnswer(session.getId(), questionId);
            
            if (answer != null) {
                // Baue currentAnswer Objekt
                Map<String, Object> currentAnswer = new HashMap<>();
                currentAnswer.put("answerId", answer.getId());
                
                // Parse value (JSONB String -> Object)
                try {
                    Object parsedValue = objectMapper.readValue(answer.getValue(), Object.class);
                    currentAnswer.put("value", parsedValue);
                } catch (Exception e) {
                    // Fallback: als String zurückgeben
                    currentAnswer.put("value", answer.getValue());
                }
                
                currentAnswer.put("score", answer.getScore());
                currentAnswer.put("answeredAt", answer.getAnsweredAt());
                
                previous.put("currentAnswer", currentAnswer);
            }

            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            return new ResponseEntity<>(previous, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /public/access/{accessToken}/sessions/{sessionId}/summary
     * Gibt Übersicht aller beantworteten Fragen mit Scores zurück
     * Für finales Review vor dem Abschließen der Session
     */
    @GetMapping("/{accessToken}/sessions/{sessionId}/summary")
    public ResponseEntity<?> getSessionSummary(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("sessionId") String sessionId) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            UUID sessionUuid = AccessGuardUtil.parseUuidOrNull(sessionId);
            if (sessionUuid == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid sessionId format"), HttpStatus.BAD_REQUEST);
            }

            AssessmentSession session = assessmentSessionService.get(sessionUuid);
            ResponseEntity<?> ownDenied = AccessGuardUtil.guardSessionOwnership(assignment, session, themaCatalogService);
            if (ownDenied != null) return ownDenied;

            // Hole alle beantworteten Fragen
            List<Map<String, Object>> answeredQuestionsData = publicQueryUtil.getAnsweredQuestionsWithDetails(sessionUuid);
            
            // Baue DTO
            SessionSummaryResponseDTO summary = new SessionSummaryResponseDTO();
            summary.setSessionId(session.getId());
            summary.setStatus(session.getStatus());
            summary.setThemaId(session.getThemaId());
            
            // Thema Name
            themaRepository.findById(session.getThemaId()).ifPresent(thema -> 
                summary.setThemaName(thema.getName())
            );
            
            // Progress
            int totalQuestions = publicQueryUtil.countQuestionsByThema(session.getThemaId());
            int answeredCount = answeredQuestionsData.size();
            int progressPercent = totalQuestions > 0 ? (int) Math.round((answeredCount * 100.0) / totalQuestions) : 0;
            
            summary.setAnsweredCount(answeredCount);
            summary.setTotalQuestions(totalQuestions);
            summary.setProgressPercent(progressPercent);
            
            // Scores: TotalScore aus Session
            summary.setTotalScore(session.getTotalScore());
            
            
            // MaxPossibleScore = Alle required Fragen + beantwortete optionale Fragen (NUR wenn isScorable=true)
            // 1. Basis: Alle required=true Fragen (isScorable wird in calculateMaxPossibleScoreForRequiredQuestions geprüft)
            BigDecimal maxPossibleScore = publicQueryUtil.calculateMaxPossibleScoreForRequiredQuestions(session.getThemaId());
            
            // 2. Addiere MaxScore für beantwortete optionale Fragen (required=false) - NUR wenn isScorable=true
            for (Map<String, Object> data : answeredQuestionsData) {
                Boolean isRequired = (Boolean) data.get("isRequired");
                Boolean isScorable = (Boolean) data.get("isScorable");
                String answerValueJson = (String) data.get("answerValue");
                
                // Nur optionale Fragen (required=false) die beantwortet wurden (value != null) UND bewertbar sind
                boolean notScorable = (isScorable != null && !isScorable);
                if (!notScorable && isRequired != null && !isRequired && answerValueJson != null && !"null".equals(answerValueJson)) {
                    String scoringSchemaJson = (String) data.get("scoringSchema");
                    BigDecimal maxScore = calculateMaxScoreForQuestion(
                        (String) data.get("inputType"), 
                        scoringSchemaJson
                    );
                    maxPossibleScore = maxPossibleScore.add(maxScore);
                }
            }
            summary.setMaxPossibleScore(maxPossibleScore);
            
            List<SessionSummaryResponseDTO.AnsweredQuestionSummary> answeredQuestions = new ArrayList<>();
            int autoCount = 0;
            int manualCount = 0;
            int skippedCount = 0;
            
            for (Map<String, Object> data : answeredQuestionsData) {
                SessionSummaryResponseDTO.AnsweredQuestionSummary q = new SessionSummaryResponseDTO.AnsweredQuestionSummary();
                q.setQuestionId((UUID) data.get("questionId"));
                q.setQuestionText((String) data.get("questionText"));
                // QuestionTypeName (z.B. "Multiple Choice", "Text Input")
            q.setQuestionTypeName((String) data.get("questionTypeName"));
            
            // Options (JSON String)
            q.setOptions((String) data.get("options"));
                // InputType normalisieren für korrekte Kategorisierung
                String rawInputType = (String) data.get("inputType");
                String normalizedInputType = normalizeInputType(rawInputType);
                q.setInputType(normalizedInputType);
                
                q.setScore((BigDecimal) data.get("score"));
                q.setAnsweredAt((LocalDateTime) data.get("answeredAt"));
                q.setOrderIndex((Integer) data.get("orderIndex"));
                q.setIsRequired((Boolean) data.get("isRequired"));
                
                // Parse answer value (JSONB String -> Object)
                String answerValueJson = (String) data.get("answerValue");
                Object parsedValue = null;
                try {
                    parsedValue = objectMapper.readValue(answerValueJson, Object.class);
                    q.setAnsweredValue(parsedValue);
                } catch (Exception e) {
                    q.setAnsweredValue(answerValueJson); // Fallback
                }
                
                // Prüfe isScorable ZUERST
                Boolean isScorable = (Boolean) data.get("isScorable");
                boolean notScorable = (isScorable != null && !isScorable);
                
                // Berechne maxScore für diese Frage (aus scoring_schema)
                // Wenn nicht bewertbar → maxScore = 0
                String scoringSchemaJson = (String) data.get("scoringSchema");
                BigDecimal maxScore;
                if (notScorable) {
                    maxScore = BigDecimal.ZERO; // Nicht bewertbar = kein MaxScore
                } else {
                    maxScore = calculateMaxScoreForQuestion(
                        normalizedInputType, 
                        scoringSchemaJson
                    );
                }
                q.setMaxScore(maxScore);
                
                // Setze Flags für Frontend
                boolean isSkipped = (answerValueJson == null || "null".equals(answerValueJson));
                boolean isManualReview = MANUAL_REVIEW_TYPES.contains(normalizedInputType) && !notScorable;
                boolean isAutoScored = !isSkipped && !isManualReview && !notScorable;
                
                q.setIsSkipped(isSkipped || notScorable);  // Nicht-bewertbare als "skipped" markieren
                q.setIsManualReview(isManualReview);
                q.setIsAutoScored(isAutoScored);
                
                if (isSkipped) {
                    skippedCount++;
                } else if (isManualReview) {
                    manualCount++;
                } else {
                    autoCount++;
                }
                
                answeredQuestions.add(q);
            }
            
            summary.setAnsweredQuestions(answeredQuestions);
            summary.setAutomatischBewertetAnzahl(autoCount);
            summary.setManuellZuBewertenAnzahl(manualCount);
            summary.setUebersprungenAnzahl(skippedCount);
            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            return new ResponseEntity<>(summary, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * Hilfsmethode: Berechnet max mögliche Punkte für eine einzelne Frage
     */
    private BigDecimal calculateMaxScoreForQuestion(String inputType, String scoringSchemaJson) {
        String normalized = normalizeInputType(inputType);
        
        if ("rating_scale".equals(normalized)) {
            return BigDecimal.valueOf(5);
        }
        
        if (scoringSchemaJson == null || scoringSchemaJson.isBlank()) {
            return BigDecimal.valueOf(5); // Fallback
        }
        
        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(scoringSchemaJson);
            
            if ("multiple_select".equals(normalized)) {
                // Summe aller positiven Werte
                double sum = 0.0;
                var iter = root.fields();
                while (iter.hasNext()) {
                    var entry = iter.next();
                    if (entry.getValue().isNumber()) {
                        double val = entry.getValue().asDouble(0.0);
                        if (val > 0) sum += val;
                    }
                }
                return BigDecimal.valueOf(sum);
            } else {
                // Maximum Wert
                double max = 0.0;
                var iter = root.fields();
                while (iter.hasNext()) {
                    var entry = iter.next();
                    if (entry.getValue().isNumber()) {
                        double val = entry.getValue().asDouble(0.0);
                        if (val > max) max = val;
                    }
                }
                return BigDecimal.valueOf(max);
            }
        } catch (Exception e) {
            return BigDecimal.valueOf(5); // Fallback
        }
    }

    /**
     * PUT /public/access/{accessToken}/sessions/{sessionId}/answers/{questionId}
     * Antwort speichern (inkl. Normalisierung + Auto-Scoring)
     */
    @PutMapping("/{accessToken}/sessions/{sessionId}/answers/{questionId}")
    public ResponseEntity<?> saveAnswer(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("sessionId") String sessionId,
            @PathVariable("questionId") String questionId,
            @RequestBody Map<String, Object> body) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            UUID sessionUuid = AccessGuardUtil.parseUuidOrNull(sessionId);
            UUID questionUuid = AccessGuardUtil.parseUuidOrNull(questionId);
            if (sessionUuid == null || questionUuid == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid id format"), HttpStatus.BAD_REQUEST);
            }

            AssessmentSession session = assessmentSessionService.get(sessionUuid);
            ResponseEntity<?> ownDenied = AccessGuardUtil.guardSessionOwnership(assignment, session, themaCatalogService);
            if (ownDenied != null) return ownDenied;

            if ("completed".equals(session.getStatus())) {
                return new ResponseEntity<>(Map.of("error", "Session already completed"), HttpStatus.CONFLICT);
            }

            // Frage gehört zum Thema?
            boolean inThema = publicQueryUtil.questionBelongsToThema(questionUuid, session.getThemaId());
            if (!inThema) {
                return new ResponseEntity<>(Map.of("error", "Question not in session thema"), HttpStatus.FORBIDDEN);
            }

            if (body == null || !body.containsKey("value")) {
                return new ResponseEntity<>(Map.of("error", "Missing value"), HttpStatus.BAD_REQUEST);
            }

            Object value = body.get("value");

            // Fragetyp ermitteln
            String inputType = getQuestionInputType(questionUuid);
            if (inputType == null) {
                return new ResponseEntity<>(Map.of("error", "Question type not found"), HttpStatus.NOT_FOUND);
            }

            // Typ normalisieren (wie in AutoScoringService)
            String normalizedType = normalizeInputType(inputType);
            
            // Prüfe ob Frage bewertbar ist (is_scorable)
            boolean isScorable = publicQueryUtil.isQuestionScorable(questionUuid);
            
            // Spezialfall: Skip (value ist null) - nur bei optionalen Fragen erlaubt
            if (value == null) {
                // Prüfe ob Frage required ist
                boolean isRequired = publicQueryUtil.isQuestionRequired(questionUuid, session.getThemaId());
                if (isRequired) {
                    return new ResponseEntity<>(
                        Map.of("error", "Required question cannot be skipped. Please provide an answer."),
                        HttpStatus.BAD_REQUEST
                    );
                }
                
                // Speichere Answer mit null value und null score (nur bei optionalen Fragen)
                var saved = answerService.upsert(session.getId(), questionUuid, null, null);
                assessmentSessionService.recalculateTotals(session.getId());

                long answered = answerService.countAnswered(session.getId());
                AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

                SaveAnswerResponseDTO response = new SaveAnswerResponseDTO(
                    true,
                    saved.getId(),
                    null, // kein Score bei Skip
                    answered
                );

                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            
            // Manuelle Review-Typen: Score = 0.0 (später von Admin bewertet), NULL wenn nicht bewertbar
            if (MANUAL_REVIEW_TYPES.contains(inputType)) {
                // Wenn nicht bewertbar → Score = NULL (wird ignoriert)
                BigDecimal scoreToSave = isScorable ? BigDecimal.ZERO : null;
                var saved = answerService.upsert(session.getId(), questionUuid, value, scoreToSave);
                assessmentSessionService.recalculateTotals(session.getId());

                long answered = answerService.countAnswered(session.getId());
                
                // Status auf in_progress setzen wenn erste erforderliche Antwort
                workerCatalogService.advanceToInProgressIfNeeded(assignment.getId());
                
                AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

                SaveAnswerResponseDTO response = new SaveAnswerResponseDTO(
                    true,
                    saved.getId(),
                    scoreToSave,
                    answered
                );

                return new ResponseEntity<>(response, HttpStatus.OK);
            }

            // Rating-Scala: Spezielle Validierung
            if ("rating_scale".equals(normalizedType)) {
                Integer ratingValue = validateRatingValue(value);
                if (ratingValue == null) {
                    return new ResponseEntity<>(
                        Map.of("error", "Invalid rating value. Must be an integer between 0 and 5."),
                        HttpStatus.BAD_REQUEST
                    );
                }
                // Für Rating: value bleibt unverändert, score = der Integer-Wert (NULL wenn nicht bewertbar)
                BigDecimal score = isScorable ? BigDecimal.valueOf(ratingValue) : null;
                var saved = answerService.upsert(session.getId(), questionUuid, value, score);
                assessmentSessionService.recalculateTotals(session.getId());

                long answered = answerService.countAnswered(session.getId());
                
                // Status auf in_progress setzen wenn erste erforderliche Antwort
                workerCatalogService.advanceToInProgressIfNeeded(assignment.getId());
                
                AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

                SaveAnswerResponseDTO response = new SaveAnswerResponseDTO(
                    true,
                    saved.getId(),
                    saved.getScore(),
                    answered
                );

                return new ResponseEntity<>(response, HttpStatus.OK);
            }

            // Für alle anderen Typen: Auto-Scoring verwenden (NULL wenn nicht bewertbar)
            BigDecimal score = isScorable ? autoScoringService.autoScore(questionUuid, value) : null;

            var saved = answerService.upsert(session.getId(), questionUuid, value, score);

            // Totals aktualisieren
            assessmentSessionService.recalculateTotals(session.getId());

            long answered = answerService.countAnswered(session.getId());
            
            // Status auf in_progress setzen wenn erste erforderliche Antwort
            workerCatalogService.advanceToInProgressIfNeeded(assignment.getId());
            
            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            SaveAnswerResponseDTO response = new SaveAnswerResponseDTO(
                true,
                saved.getId(),
                saved.getScore(),
                answered
            );

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /public/access/{accessToken}/sessions/{sessionId}/complete
     * Session abschließen
     */
    @PostMapping("/{accessToken}/sessions/{sessionId}/complete")
    public ResponseEntity<?> completeSession(
            @PathVariable("accessToken") String accessToken,
            @PathVariable("sessionId") String sessionId) {
        try {
            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Invalid access link"), HttpStatus.NOT_FOUND);
            }
            WorkerCatalog assignment = assignmentOpt.get();
            ResponseEntity<?> denied = AccessGuardUtil.guardAssignment(assignment);
            if (denied != null) return denied;

            UUID sessionUuid = AccessGuardUtil.parseUuidOrNull(sessionId);
            if (sessionUuid == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid sessionId format"), HttpStatus.BAD_REQUEST);
            }

            AssessmentSession session = assessmentSessionService.get(sessionUuid);
            ResponseEntity<?> ownDenied = AccessGuardUtil.guardSessionOwnership(assignment, session, themaCatalogService);
            if (ownDenied != null) return ownDenied;

            session = assessmentSessionService.complete(session.getId());

            // Prüfen ob alle Themen des Katalogs abgeschlossen sind und ggf. Assignment-Status aktualisieren
            workerCatalogService.checkAndCompleteAssignment(assignment.getId());

            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            return new ResponseEntity<>(Map.of(
                "completed", true,
                "sessionId", session.getId(),
                "status", session.getStatus(),
                "totalScore", session.getTotalScore(),
                "maxPossibleScore", session.getMaxPossibleScore()
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}