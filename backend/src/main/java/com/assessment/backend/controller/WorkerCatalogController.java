package com.assessment.backend.controller;

import com.assessment.backend.entity.WorkerCatalog;
import com.assessment.backend.service.WorkerCatalogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/worker-catalog")
@CrossOrigin(origins = "*")
public class WorkerCatalogController {

    @Autowired
    private WorkerCatalogService workerCatalogService;

    // ===== ASSIGNMENT CREATION =====

    /**
     * POST /api/worker-catalog/assign
     * Weist einen Katalog einem Worker zu
     * Body: { "workerId": "uuid", "catalogId": "uuid", "expiresAt": "2025-12-31T23:59:59", "notes": "..." }
     */
    @PostMapping("/assign")
    public ResponseEntity<?> assignCatalogToWorker(@RequestBody Map<String, Object> request) {
        try {
            UUID workerId = UUID.fromString((String) request.get("workerId"));
            UUID catalogId = UUID.fromString((String) request.get("catalogId"));
            
            LocalDateTime expiresAt = null;
            if (request.containsKey("expiresAt") && request.get("expiresAt") != null) {
                expiresAt = LocalDateTime.parse((String) request.get("expiresAt"));
            }
            
            UUID assignedById = null;
            if (request.containsKey("assignedById") && request.get("assignedById") != null) {
                assignedById = UUID.fromString((String) request.get("assignedById"));
            }
            
            String notes = (String) request.get("notes");

            WorkerCatalog assignment = workerCatalogService.assignCatalogToWorker(
                workerId, catalogId, expiresAt, assignedById, notes
            );

            return new ResponseEntity<>(assignment, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /api/worker-catalog/assign/bulk
     * Weist einen Katalog mehreren Workern zu
     * Body: { "workerIds": ["uuid1", "uuid2"], "catalogId": "uuid", "expiresAt": "...", "notes": "..." }
     */
    @PostMapping("/assign/bulk")
    public ResponseEntity<?> assignCatalogToMultipleWorkers(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> workerIdStrings = (List<String>) request.get("workerIds");
            List<UUID> workerIds = workerIdStrings.stream()
                    .map(UUID::fromString)
                    .toList();
            
            UUID catalogId = UUID.fromString((String) request.get("catalogId"));
            
            LocalDateTime expiresAt = null;
            if (request.containsKey("expiresAt") && request.get("expiresAt") != null) {
                expiresAt = LocalDateTime.parse((String) request.get("expiresAt"));
            }
            
            UUID assignedById = null;
            if (request.containsKey("assignedById") && request.get("assignedById") != null) {
                assignedById = UUID.fromString((String) request.get("assignedById"));
            }
            
            String notes = (String) request.get("notes");

            List<WorkerCatalog> assignments = workerCatalogService.assignCatalogToMultipleWorkers(
                workerIds, catalogId, expiresAt, assignedById, notes
            );

            return new ResponseEntity<>(Map.of(
                "success", assignments.size(),
                "total", workerIds.size(),
                "assignments", assignments
            ), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== READ OPERATIONS =====

    /**
     * GET /api/worker-catalog
     * Alle Zuweisungen abrufen
     */
    @GetMapping
    public ResponseEntity<List<WorkerCatalog>> getAllAssignments() {
        try {
            List<WorkerCatalog> assignments = workerCatalogService.getAllAssignments();
            if (assignments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(assignments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/worker-catalog/{id}
     * Einzelne Zuweisung nach ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkerCatalog> getAssignmentById(@PathVariable("id") UUID id) {
        Optional<WorkerCatalog> assignment = workerCatalogService.getAssignmentById(id);
        return assignment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET /api/worker-catalog/worker/{workerId}
     * Alle Zuweisungen eines Workers
     */
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkerCatalog>> getAssignmentsByWorker(
            @PathVariable("workerId") UUID workerId,
            @RequestParam(required = false) String status) {
        try {
            List<WorkerCatalog> assignments;
            if (status != null && !status.isEmpty()) {
                assignments = workerCatalogService.getAssignmentsByWorker(workerId).stream()
                        .filter(a -> status.equals(a.getStatus()))
                        .toList();
            } else {
                assignments = workerCatalogService.getAssignmentsByWorker(workerId);
            }
            
            if (assignments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(assignments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/worker-catalog/catalog/{catalogId}
     * Alle Zuweisungen eines Katalogs
     */
    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<List<WorkerCatalog>> getAssignmentsByCatalog(
            @PathVariable("catalogId") UUID catalogId) {
        try {
            List<WorkerCatalog> assignments = workerCatalogService.getAssignmentsByCatalog(catalogId);
            if (assignments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(assignments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/worker-catalog/company/{companyId}
     * Alle Zuweisungen einer Firma
     */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<WorkerCatalog>> getAssignmentsByCompany(
            @PathVariable("companyId") UUID companyId,
            @RequestParam(required = false) String status) {
        try {
            List<WorkerCatalog> assignments;
            if (status != null && !status.isEmpty()) {
                assignments = workerCatalogService.getAssignmentsByCompany(companyId).stream()
                        .filter(a -> status.equals(a.getStatus()))
                        .toList();
            } else {
                assignments = workerCatalogService.getAssignmentsByCompany(companyId);
            }
            
            if (assignments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(assignments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/worker-catalog/status/{status}
     * Alle Zuweisungen nach Status filtern
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkerCatalog>> getAssignmentsByStatus(
            @PathVariable("status") String status) {
        try {
            List<WorkerCatalog> assignments = workerCatalogService.getAssignmentsByStatus(status);
            if (assignments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(assignments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/worker-catalog/code/{accessCode}
     * Zuweisung per Access Code finden (für Login)
     */
    @GetMapping("/code/{accessCode}")
    public ResponseEntity<WorkerCatalog> getAssignmentByAccessCode(
            @PathVariable("accessCode") String accessCode) {
        Optional<WorkerCatalog> assignment = workerCatalogService.findByAccessCode(accessCode);
        return assignment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET /api/worker-catalog/token/{accessToken}
     * Zuweisung per Access Token finden (für E-Mail-Link)
     */
    @GetMapping("/token/{accessToken}")
    public ResponseEntity<WorkerCatalog> getAssignmentByAccessToken(
            @PathVariable("accessToken") String accessToken) {
        Optional<WorkerCatalog> assignment = workerCatalogService.findByAccessToken(accessToken);
        return assignment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // ===== UPDATE OPERATIONS =====

    /**
     * PATCH /api/worker-catalog/{id}/status
     * Status einer Zuweisung ändern
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || status.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Status is required"), HttpStatus.BAD_REQUEST);
            }

            WorkerCatalog assignment = new WorkerCatalog();
            assignment.setStatus(status);
            
            // Timestamps setzen basierend auf Status
            if ("started".equals(status) || "in_progress".equals(status)) {
                assignment.setFirstAccessAt(LocalDateTime.now());
                assignment.setLastAccessAt(LocalDateTime.now());
            } else if ("completed".equals(status)) {
                assignment.setCompletedAt(LocalDateTime.now());
                assignment.setLastAccessAt(LocalDateTime.now());
            }

            WorkerCatalog updated = workerCatalogService.updateAssignment(id, assignment);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PATCH /api/worker-catalog/{id}/expires
     * Ablaufdatum einer Zuweisung ändern
     */
    @PatchMapping("/{id}/expires")
    public ResponseEntity<?> updateExpiresAt(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> request) {
        try {
            String expiresAtStr = request.get("expiresAt");
            if (expiresAtStr == null || expiresAtStr.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "expiresAt is required"), HttpStatus.BAD_REQUEST);
            }

            LocalDateTime expiresAt = LocalDateTime.parse(expiresAtStr);
            
            WorkerCatalog assignment = new WorkerCatalog();
            assignment.setExpiresAt(expiresAt);

            WorkerCatalog updated = workerCatalogService.updateAssignment(id, assignment);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /api/worker-catalog/{id}
     * Vollständiges Update einer Zuweisung
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAssignment(
            @PathVariable("id") UUID id,
            @RequestBody WorkerCatalog assignmentDetails) {
        try {
            WorkerCatalog updated = workerCatalogService.updateAssignment(id, assignmentDetails);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== DELETE OPERATIONS =====

    /**
     * DELETE /api/worker-catalog/{id}
     * Einzelne Zuweisung löschen
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteAssignment(@PathVariable("id") UUID id) {
        try {
            workerCatalogService.deleteAssignment(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /api/worker-catalog/worker/{workerId}
     * Alle Zuweisungen eines Workers löschen
     */
    @DeleteMapping("/worker/{workerId}")
    public ResponseEntity<?> deleteAllWorkerAssignments(@PathVariable("workerId") UUID workerId) {
        try {
            List<WorkerCatalog> assignments = workerCatalogService.getAssignmentsByWorker(workerId);
            for (WorkerCatalog assignment : assignments) {
                workerCatalogService.deleteAssignment(assignment.getId());
            }
            return new ResponseEntity<>(Map.of("deleted", assignments.size()), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}