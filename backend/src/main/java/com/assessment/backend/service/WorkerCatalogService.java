package com.assessment.backend.service;

import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Company;
import com.assessment.backend.entity.User;
import com.assessment.backend.entity.Worker;
import com.assessment.backend.entity.WorkerCatalog;
import com.assessment.backend.repository.WorkerCatalogRepository;
import com.assessment.backend.repository.WorkerRepository;
import com.assessment.backend.repository.CatalogRepository;
import com.assessment.backend.repository.CompanyRepository;
import com.assessment.backend.util.AccessCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkerCatalogService {

    @Autowired
    private WorkerCatalogRepository repository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private com.assessment.backend.repository.AssessmentSessionRepository assessmentSessionRepository;

    @Autowired
    private com.assessment.backend.repository.ThemaCatalogRepository themaCatalogRepository;

    private static final int MAX_CODE_GENERATION_ATTEMPTS = 10;

    // ===== ASSIGNMENT CREATION WITH CODE/TOKEN GENERATION =====

    /**
     * Weist einen Katalog einem Worker zu und generiert eindeutige Codes/Tokens
     */
    @Transactional
    public WorkerCatalog assignCatalogToWorker(UUID workerId, UUID catalogId,
                                               LocalDateTime expiresAt,
                                               UUID assignedById,
                                               String notes) {

        // 1. Validierung
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workerId));

        // Check if worker is active
        if (worker.getStatus() != null && "inactive".equals(worker.getStatus())) {
            throw new RuntimeException("Worker ist inaktiv und kann nicht zugewiesen werden");
        }

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + catalogId));

        Company company = worker.getCompany();
        if (company == null) {
            throw new RuntimeException("Worker has no company assigned");
        }

        // 2. Prüfen ob bereits zugewiesen
        Optional<WorkerCatalog> existing = repository
                .findByWorkerIdAndCatalogId(workerId, catalogId);

        if (existing.isPresent()) {
            throw new RuntimeException("Catalog already assigned to this worker");
        }

        // 3. WorkerCatalog erstellen
        WorkerCatalog assignment = new WorkerCatalog();
        assignment.setWorker(worker);
        assignment.setCatalog(catalog);
        assignment.setCompany(company);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setExpiresAt(expiresAt);
        assignment.setStatus("assigned");
        assignment.setNotes(notes);

        // 4. Access Code generieren (mit Kollisionsprüfung)
        String accessCode = generateUniqueAccessCode();
        assignment.setAccessCode(accessCode);

        // 5. Access Token generieren (mit Kollisionsprüfung)
        String accessToken = generateUniqueAccessToken();
        assignment.setAccessToken(accessToken);

        // 6. assignedBy setzen (optional, wenn User-Management vorhanden)
        // if (assignedById != null) {
        //     User assignedBy = userRepository.findById(assignedById).orElse(null);
        //     assignment.setAssignedBy(assignedBy);
        // }

        // 7. Speichern
        WorkerCatalog saved = repository.save(assignment);
        auditLogService.log("ASSIGN_CATALOG", "worker_catalog", saved.getId(), null);
        return saved;
    }

    /**
     * Bulk-Zuweisung: Katalog an mehrere Worker zuweisen
     */
    @Transactional
    public List<WorkerCatalog> assignCatalogToMultipleWorkers(List<UUID> workerIds,
                                                              UUID catalogId,
                                                              LocalDateTime expiresAt,
                                                              UUID assignedById,
                                                              String notes) {
        List<WorkerCatalog> assignments = new ArrayList<>();

        for (UUID workerId : workerIds) {
            try {
                WorkerCatalog assignment = assignCatalogToWorker(
                    workerId, catalogId, expiresAt, assignedById, notes
                );
                assignments.add(assignment);
            } catch (RuntimeException e) {
                // Log error und weiter mit nächstem Worker
                System.err.println("Failed to assign catalog to worker " + workerId + ": " + e.getMessage());
            }
        }

        return assignments;
    }

    /**
     * Generiert einen eindeutigen Access Code mit Kollisionsprüfung
     */
    private String generateUniqueAccessCode() {
        for (int attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
            String code = AccessCodeGenerator.generateAccessCode();

            // Prüfen ob Code bereits existiert
            Optional<WorkerCatalog> existing = repository.findByAccessCode(code);
            if (existing.isEmpty()) {
                return code;
            }
        }

        throw new RuntimeException("Failed to generate unique access code after " +
                                   MAX_CODE_GENERATION_ATTEMPTS + " attempts");
    }

    /**
     * Generiert einen eindeutigen Access Token mit Kollisionsprüfung
     */
    private String generateUniqueAccessToken() {
        for (int attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
            String token = AccessCodeGenerator.generateAccessToken();

            // Prüfen ob Token bereits existiert
            Optional<WorkerCatalog> existing = repository.findByAccessToken(token);
            if (existing.isEmpty()) {
                return token;
            }
        }

        throw new RuntimeException("Failed to generate unique access token after " +
                                   MAX_CODE_GENERATION_ATTEMPTS + " attempts");
    }

    // ===== EXISTING METHODS =====

    public List<WorkerCatalog> getAllAssignments() {
        return repository.findAll();
    }

    public Optional<WorkerCatalog> getAssignmentById(UUID id) {
        return repository.findById(id);
    }

    public List<WorkerCatalog> getAssignmentsByWorker(UUID workerId) {
        return repository.findByWorkerId(workerId);
    }

    public List<WorkerCatalog> getAssignmentsByCatalog(UUID catalogId) {
        return repository.findByCatalogId(catalogId);
    }

    public List<WorkerCatalog> getAssignmentsByCompany(UUID companyId) {
        return repository.findByCompanyId(companyId);
    }

    public List<WorkerCatalog> getAssignmentsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public Optional<WorkerCatalog> findByAccessCode(String accessCode) {
        return repository.findByAccessCode(accessCode);
    }

    public Optional<WorkerCatalog> findByAccessToken(String token) {
        return repository.findByAccessToken(token);
    }

    public WorkerCatalog createAssignment(WorkerCatalog assignment) {
        return repository.save(assignment);
    }

    @Transactional
    public WorkerCatalog updateAssignment(UUID id, WorkerCatalog patch) {
        WorkerCatalog existing = repository.findById(id).orElseThrow();
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getFirstAccessAt() != null) existing.setFirstAccessAt(patch.getFirstAccessAt());
        if (patch.getLastAccessAt() != null) existing.setLastAccessAt(patch.getLastAccessAt());
        if (patch.getExpiresAt() != null) existing.setExpiresAt(patch.getExpiresAt());
        if (patch.getAccessCode() != null) existing.setAccessCode(patch.getAccessCode());
        repository.flush();
        return existing;
    }

    @Transactional
    public WorkerCatalog markVerified(UUID assignmentId) {
        WorkerCatalog assignment = repository.findById(assignmentId).orElseThrow();
        
        LocalDateTime now = LocalDateTime.now();
        if (assignment.getFirstAccessAt() == null) {
            assignment.setFirstAccessAt(now);
            assignment.setStatus("started");
        } else {
            assignment.setStatus("in_progress");
        }
        assignment.setLastAccessAt(now);
        
        WorkerCatalog saved = repository.save(assignment);
        repository.flush();
        return saved;
    }

    public void deleteAssignment(UUID id) {
        auditLogService.log("DELETE", "worker_catalog", id, null);
        repository.deleteById(id);
    }

    @Transactional
    public void touchLastAccess(UUID assignmentId) {
        WorkerCatalog a = repository.findById(assignmentId).orElseThrow();
        a.setLastAccessAt(LocalDateTime.now());
        // Status NICHT ändern!
        repository.save(a);
        repository.flush();
    }

    public Optional<WorkerCatalog> findByWorkerIdAndCatalogId(UUID workerId, UUID catalogId) {
        return repository.findByWorkerIdAndCatalogId(workerId, catalogId);
    }

    public List<WorkerCatalog> findByWorkerId(UUID workerId) {
        return repository.findByWorkerId(workerId);
    }

    public List<WorkerCatalog> findByCatalogId(UUID catalogId) {
        return repository.findByCatalogId(catalogId);
    }

    public List<WorkerCatalog> findByCompanyId(UUID companyId) {
        return repository.findByCompanyId(companyId);
    }

    public List<WorkerCatalog> findByStatus(String status) {
        return repository.findByStatus(status);
    }

    /**
     * Prüft ob alle Themen des zugewiesenen Katalogs abgeschlossen sind
     * Wird nach jedem Session-Complete aufgerufen
     */
    @Transactional
    public void checkAndCompleteAssignment(UUID assignmentId) {
        WorkerCatalog assignment = repository.findById(assignmentId).orElse(null);
        if (assignment == null || "completed".equals(assignment.getStatus())) {
            return; // Bereits completed oder nicht gefunden
        }

        UUID workerId = assignment.getWorker().getId();
        UUID catalogId = assignment.getCatalog().getId();

        // Alle Thema-IDs des zugewiesenen Katalogs holen
        List<UUID> themaIds = themaCatalogRepository.findThemasByCatalogId(catalogId)
            .stream()
            .map(thema -> thema.getId())
            .collect(Collectors.toList());

        if (themaIds.isEmpty()) {
            return; // Katalog hat keine Themen
        }

        // Alle Sessions für diese spezifischen Themen zählen
        Long totalSessions = assessmentSessionRepository.countByWorkerIdAndThemaIdIn(workerId, themaIds);
        if (totalSessions == 0) {
            return; // Keine Sessions vorhanden
        }

        // Completed Sessions für diese Themen zählen
        Long completedSessions = assessmentSessionRepository
            .countByWorkerIdAndThemaIdInAndStatus(workerId, themaIds, "completed");

        // Wenn alle Sessions für ALLE Themen des Katalogs completed sind, Assignment auf completed setzen
        if (completedSessions.equals(totalSessions) && completedSessions >= themaIds.size()) {
            assignment.setStatus("completed");
            assignment.setCompletedAt(LocalDateTime.now());
            repository.save(assignment);
        }
    }

    /**
     * Setzt Status auf "in_progress" wenn erste erforderliche Antwort gespeichert wird
     * Wird nach jedem Speichern einer Antwort aufgerufen (nur wenn Status="started")
     */
    @Transactional
    public void advanceToInProgressIfNeeded(UUID assignmentId) {
        WorkerCatalog assignment = repository.findById(assignmentId).orElse(null);
        if (assignment == null) {
            return;
        }

        // Nur von "started" zu "in_progress" wechseln
        if ("started".equals(assignment.getStatus())) {
            assignment.setStatus("in_progress");
            assignment.setLastAccessAt(LocalDateTime.now());
            repository.save(assignment);
        }
    }

}