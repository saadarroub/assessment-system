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

@Service
public class WorkerCatalogService {

    @Autowired
    private WorkerCatalogRepository workerCatalogRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private CompanyRepository companyRepository;

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

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + catalogId));

        Company company = worker.getCompany();
        if (company == null) {
            throw new RuntimeException("Worker has no company assigned");
        }

        // 2. Prüfen ob bereits zugewiesen
        Optional<WorkerCatalog> existing = workerCatalogRepository
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
        return workerCatalogRepository.save(assignment);
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
            Optional<WorkerCatalog> existing = workerCatalogRepository.findByAccessCode(code);
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
            Optional<WorkerCatalog> existing = workerCatalogRepository.findByAccessToken(token);
            if (existing.isEmpty()) {
                return token;
            }
        }

        throw new RuntimeException("Failed to generate unique access token after " +
                                   MAX_CODE_GENERATION_ATTEMPTS + " attempts");
    }

    // ===== EXISTING METHODS =====

    public List<WorkerCatalog> getAllAssignments() {
        return workerCatalogRepository.findAll();
    }

    public Optional<WorkerCatalog> getAssignmentById(UUID id) {
        return workerCatalogRepository.findById(id);
    }

    public List<WorkerCatalog> getAssignmentsByWorker(UUID workerId) {
        return workerCatalogRepository.findByWorkerId(workerId);
    }

    public List<WorkerCatalog> getAssignmentsByCatalog(UUID catalogId) {
        return workerCatalogRepository.findByCatalogId(catalogId);
    }

    public List<WorkerCatalog> getAssignmentsByCompany(UUID companyId) {
        return workerCatalogRepository.findByCompanyId(companyId);
    }

    public List<WorkerCatalog> getAssignmentsByStatus(String status) {
        return workerCatalogRepository.findByStatus(status);
    }

    public Optional<WorkerCatalog> findByAccessCode(String accessCode) {
        return workerCatalogRepository.findByAccessCode(accessCode);
    }

    public Optional<WorkerCatalog> findByAccessToken(String accessToken) {
        return workerCatalogRepository.findByAccessToken(accessToken);
    }

    public WorkerCatalog createAssignment(WorkerCatalog assignment) {
        return workerCatalogRepository.save(assignment);
    }

    public WorkerCatalog updateAssignment(UUID id, WorkerCatalog assignmentDetails) {
        WorkerCatalog assignment = workerCatalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

        if (assignmentDetails.getStatus() != null) {
            assignment.setStatus(assignmentDetails.getStatus());
        }
        if (assignmentDetails.getExpiresAt() != null) {
            assignment.setExpiresAt(assignmentDetails.getExpiresAt());
        }
        if (assignmentDetails.getFirstAccessAt() != null) {
            assignment.setFirstAccessAt(assignmentDetails.getFirstAccessAt());
        }
        if (assignmentDetails.getLastAccessAt() != null) {
            assignment.setLastAccessAt(assignmentDetails.getLastAccessAt());
        }
        if (assignmentDetails.getCompletedAt() != null) {
            assignment.setCompletedAt(assignmentDetails.getCompletedAt());
        }
        if (assignmentDetails.getNotes() != null) {
            assignment.setNotes(assignmentDetails.getNotes());
        }

        return workerCatalogRepository.save(assignment);
    }

    public void deleteAssignment(UUID id) {
        workerCatalogRepository.deleteById(id);
    }
}