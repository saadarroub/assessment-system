package com.assessment.backend.util;

import com.assessment.backend.entity.AssessmentSession;
import com.assessment.backend.entity.WorkerCatalog;
import com.assessment.backend.service.ThemaCatalogService;
import com.assessment.backend.service.WorkerCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public final class AccessGuardUtil {

    private AccessGuardUtil() {}

    public static ResponseEntity<?> guardAssignment(WorkerCatalog a) {
        if (a == null) return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
        
        // Check if worker is inactive
        if (a.getWorker() != null && 
            a.getWorker().getStatus() != null && 
            "inactive".equals(a.getWorker().getStatus())) {
            return new ResponseEntity<>(Map.of("error", "Worker-Konto ist inaktiv"), HttpStatus.FORBIDDEN);
        }
        
        String status = a.getStatus() != null ? a.getStatus().toLowerCase() : "";
        if ("assigned".equals(status)) {
            return new ResponseEntity<>(Map.of("error", "Access code not verified yet"), HttpStatus.UNAUTHORIZED);
        }
        if ("blocked".equals(status)) {
            return new ResponseEntity<>(Map.of("error", "Zugriff wurde blockiert"), HttpStatus.FORBIDDEN);
        }
        if ("revoked".equals(status) || "expired".equals(status)) {
            return new ResponseEntity<>(Map.of("error", "Access has been revoked"), HttpStatus.FORBIDDEN);
        }
        if ("completed".equals(status)) {
            return new ResponseEntity<>(Map.of("error", "Katalog wurde bereits abgeschlossen"), HttpStatus.FORBIDDEN);
        }
        if (a.getExpiresAt() != null && LocalDateTime.now().isAfter(a.getExpiresAt())) {
            return new ResponseEntity<>(Map.of("error", "Access expired"), HttpStatus.FORBIDDEN);
        }
        return null;
    }

    public static ResponseEntity<?> guardSessionOwnership(WorkerCatalog assignment,
                                                          AssessmentSession session,
                                                          ThemaCatalogService themaCatalogService) {
        if (session == null) {
            return new ResponseEntity<>(Map.of("error", "Session not found"), HttpStatus.NOT_FOUND);
        }
        if (assignment.getWorker() != null && session.getWorkerId() != null &&
                !assignment.getWorker().getId().equals(session.getWorkerId())) {
            return new ResponseEntity<>(Map.of("error", "Session does not belong to worker"), HttpStatus.FORBIDDEN);
        }
        if (session.getThemaId() != null && assignment.getCatalog() != null) {
            boolean allowed = themaCatalogService.existsThemaInCatalog(session.getThemaId(), assignment.getCatalog().getId());
            if (!allowed) {
                return new ResponseEntity<>(Map.of("error", "Session thema not in assigned catalog"), HttpStatus.FORBIDDEN);
            }
        }
        return null;
    }

    public static boolean themaInAssignedCatalog(UUID themaId, WorkerCatalog assignment, ThemaCatalogService themaCatalogService) {
        UUID catalogId = assignment.getCatalog() != null ? assignment.getCatalog().getId() : null;
        if (catalogId == null || themaId == null) return false;
        return themaCatalogService.existsThemaInCatalog(themaId, catalogId);
    }

    public static UUID parseUuidOrNull(String raw) {
        try { return UUID.fromString(raw); } catch (Exception e) { return null; }
    }

    public static void touchLastAccess(WorkerCatalogService workerCatalogService, UUID assignmentId) {
        try {
            workerCatalogService.touchLastAccess(assignmentId);
        } catch (Exception ignore) {}
    }
}