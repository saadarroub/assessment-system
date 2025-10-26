package com.assessment.backend.controller;

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
import com.assessment.backend.service.ValueNormalizationService;
import com.assessment.backend.service.WorkerCatalogService;
import com.assessment.backend.util.AccessGuardUtil;
import com.assessment.backend.util.PublicQueryUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public/access")
@CrossOrigin(origins = "*")
public class PublicAccessController {

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
    private ValueNormalizationService valueNormalizationService;

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

            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            return new ResponseEntity<>(Map.of(
                "status", session.getStatus(),
                "answeredCount", answered,
                "totalCount", total,
                "themaId", session.getThemaId()
            ), HttpStatus.OK);
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

            // 1) Normalisieren (z. B. rating_scale → {rating, normalized, min, max, step})
            Object normalizedValue = valueNormalizationService.normalizeForQuestion(questionUuid, value);

            // 2) Auto-Scoring (für manuelle Typen liefert null → Score bleibt unverändert/0)
            BigDecimal score = autoScoringService.autoScore(questionUuid, normalizedValue);

            var saved = answerService.upsert(session.getId(), questionUuid, normalizedValue, score);

            // 3) Totals aktualisieren
            assessmentSessionService.recalculateTotals(session.getId());

            long answered = answerService.countAnswered(session.getId());
            AccessGuardUtil.touchLastAccess(workerCatalogService, assignment.getId());

            return new ResponseEntity<>(Map.of(
                "saved", true,
                "answerId", saved.getId(),
                "score", saved.getScore(),
                "answeredCount", answered
            ), HttpStatus.OK);
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