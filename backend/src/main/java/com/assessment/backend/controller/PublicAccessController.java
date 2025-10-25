package com.assessment.backend.controller;

import com.assessment.backend.entity.WorkerCatalog;
import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.entity.ThemaCatalog;
import com.assessment.backend.service.WorkerCatalogService;
import com.assessment.backend.service.CatalogService;
import com.assessment.backend.service.ThemaCatalogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
            
            if (code == null || code.isEmpty()) {
                return new ResponseEntity<>(
                    Map.of("error", "Access code is required"), 
                    HttpStatus.BAD_REQUEST
                );
            }

            Optional<WorkerCatalog> assignmentOpt = workerCatalogService.findByAccessToken(accessToken);
            
            if (assignmentOpt.isEmpty()) {
                return new ResponseEntity<>(
                    Map.of("error", "Invalid access link"), 
                    HttpStatus.NOT_FOUND
                );
            }

            WorkerCatalog assignment = assignmentOpt.get();

            // Prüfen ob abgelaufen
            if (assignment.getExpiresAt() != null && 
                LocalDateTime.now().isAfter(assignment.getExpiresAt())) {
                return new ResponseEntity<>(
                    Map.of("error", "Access expired"), 
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

            // CODE VERIFIZIERUNG (case-insensitive)
            if (!code.trim().equalsIgnoreCase(assignment.getAccessCode())) {
                return new ResponseEntity<>(
                    Map.of("error", "Invalid access code"), 
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Code ist korrekt → Status aktualisieren
            WorkerCatalog updateData = new WorkerCatalog();
            
            if (assignment.getFirstAccessAt() == null) {
                updateData.setFirstAccessAt(LocalDateTime.now());
                updateData.setStatus("started");
            } else {
                updateData.setStatus("in_progress");
            }
            updateData.setLastAccessAt(LocalDateTime.now());

            WorkerCatalog updated = workerCatalogService.updateAssignment(assignment.getId(), updateData);

            // Erfolgreiche Verifizierung → Session-Token zurückgeben
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Access code verified");
            response.put("assignmentId", updated.getId());
            response.put("catalogId", updated.getCatalog().getId());
            response.put("workerId", updated.getWorker().getId());
            response.put("status", updated.getStatus());
            response.put("sessionToken", accessToken);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
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

            // Prüfen ob abgelaufen
            if (assignment.getExpiresAt() != null && 
                LocalDateTime.now().isAfter(assignment.getExpiresAt())) {
                return new ResponseEntity<>(
                    Map.of("error", "Access expired"), 
                    HttpStatus.FORBIDDEN
                );
            }

            // FIX: Themas über ThemaCatalog-Service laden - nutze catalogId
            Catalog catalog = assignment.getCatalog();
            List<ThemaCatalog> themaCatalogs = themaCatalogService.getThemaCatalogsByCatalogId(catalog.getId());
            List<Thema> themas = themaCatalogs.stream()
                    .map(ThemaCatalog::getThema)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("catalog", catalog);
            response.put("themas", themas);
            response.put("assignment", Map.of(
                "id", assignment.getId(),
                "status", assignment.getStatus(),
                "firstAccessAt", assignment.getFirstAccessAt(),
                "lastAccessAt", assignment.getLastAccessAt(),
                "expiresAt", assignment.getExpiresAt()
            ));

            // Last access aktualisieren
            WorkerCatalog updateData = new WorkerCatalog();
            updateData.setLastAccessAt(LocalDateTime.now());
            workerCatalogService.updateAssignment(assignment.getId(), updateData);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
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
}