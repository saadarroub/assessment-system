package com.assessment.backend.service;

import com.assessment.backend.entity.Worker;
import com.assessment.backend.entity.WorkerCatalog;
import com.assessment.backend.repository.WorkerRepository;
import com.assessment.backend.repository.WorkerCatalogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkerService {

    private static final Logger logger = LoggerFactory.getLogger(WorkerService.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private WorkerCatalogRepository workerCatalogRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public Optional<Worker> getWorkerById(UUID id) {
        return workerRepository.findById(id);
    }

    public List<Worker> getWorkersByCompanyId(UUID companyId) {
        return workerRepository.findByCompanyId(companyId);
    }

    public List<Worker> getWorkersByWorkSpace(String workSpaceRef) {
        return workerRepository.findByWorkSpaceRef(workSpaceRef);
    }

    public Optional<Worker> getWorkerByEmail(String email) {
        return workerRepository.findByEmail(email);
    }

    public Worker createWorker(Worker worker) {
        Worker saved = workerRepository.save(worker);
        String details = String.format("Name: %s, Email: %s", saved.getName(), saved.getEmail());
        auditLogService.log("CREATE", "worker", saved.getId(), details, null);
        return saved;
    }

    public Worker updateWorker(UUID id, Worker workerDetails) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        
        worker.setName(workerDetails.getName());
        worker.setWorkSpaceRef(workerDetails.getWorkSpaceRef());
        worker.setCompanyId(workerDetails.getCompanyId());
        worker.setEmail(workerDetails.getEmail());
        
        Worker updated = workerRepository.save(worker);
        String details = String.format("Name: %s, Email: %s", updated.getName(), updated.getEmail());
        auditLogService.log("UPDATE", "worker", updated.getId(), details, null);
        return updated;
    }

    public void deleteWorker(UUID id) {
        Worker worker = workerRepository.findById(id).orElse(null);
        String details = worker != null ? String.format("Deleted worker: %s (%s)", worker.getName(), worker.getEmail()) : "Worker ID: " + id;
        auditLogService.log("DELETE", "worker", id, details, null);
        workerRepository.deleteById(id);
    }

    @Transactional
    public Worker toggleWorkerStatus(UUID id) {
        logger.info("Toggling worker status for worker ID: {}", id);
        
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        
        String currentStatus = worker.getStatus() != null ? worker.getStatus() : "active";
        String newStatus = "active".equals(currentStatus) ? "inactive" : "active";
        
        logger.info("Changing worker {} status from '{}' to '{}'", worker.getName(), currentStatus, newStatus);
        
        worker.setStatus(newStatus);
        Worker updated = workerRepository.save(worker);
        entityManager.flush(); // Force immediate database update
        
        logger.info("Worker status saved to database");
        
        // Log worker status change
        String details = String.format("Status changed from '%s' to '%s' for worker: %s (%s)", 
            currentStatus, newStatus, worker.getName(), worker.getEmail());
        auditLogService.log("STATUS_CHANGE", "worker", id, details, null);
        
        // Cascade status to assignments
        if ("inactive".equals(newStatus)) {
            // Get all assignments for this worker
            List<WorkerCatalog> allAssignments = workerCatalogRepository.findByWorkerId(id);
            logger.info("Found {} total assignments for worker", allAssignments.size());
            
            // Log all statuses
            for (WorkerCatalog a : allAssignments) {
                logger.info("Assignment {} has status: {}", a.getId(), a.getStatus());
            }
            
            // Block all active assignments
            List<WorkerCatalog> activeAssignments = allAssignments.stream()
                .filter(wc -> {
                    String status = wc.getStatus();
                    boolean shouldBlock = "active".equals(status) || 
                                         "verified".equals(status) || 
                                         "started".equals(status) ||
                                         "assigned".equals(status) ||
                                         "in_progress".equals(status);
                    if (shouldBlock) {
                        logger.info("Will block assignment {} with status {}", wc.getId(), status);
                    }
                    return shouldBlock;
                })
                .collect(Collectors.toList());
            
            logger.info("Found {} active assignments to block", activeAssignments.size());
            
            for (WorkerCatalog assignment : activeAssignments) {
                String oldStatus = assignment.getStatus();
                assignment.setStatus("blocked");
                workerCatalogRepository.save(assignment);
                logger.info("Blocked assignment {} (previous status: {})", assignment.getId(), oldStatus);
                
                String assignmentDetails = String.format("Assignment blocked due to worker deactivation. Previous status: %s, Catalog: %s",
                    oldStatus, assignment.getCatalog() != null ? assignment.getCatalog().getTitle() : "Unknown");
                auditLogService.log("STATUS_CHANGE", "worker_catalog", assignment.getId(), assignmentDetails, null);
            }
            
            entityManager.flush(); // Force immediate database update for all assignments
            logger.info("All {} assignments blocked and flushed to database", activeAssignments.size());
            details += String.format(" - %d assignments blocked", activeAssignments.size());
        } else {
            // Restore blocked assignments
            List<WorkerCatalog> blockedAssignments = workerCatalogRepository.findByWorkerId(id).stream()
                .filter(wc -> "blocked".equals(wc.getStatus()))
                .collect(Collectors.toList());
            
            logger.info("Found {} blocked assignments to restore", blockedAssignments.size());
            
            for (WorkerCatalog assignment : blockedAssignments) {
                assignment.setStatus("verified");
                workerCatalogRepository.save(assignment);
                logger.info("Restored assignment {}", assignment.getId());
                
                String assignmentDetails = String.format("Assignment restored due to worker reactivation. Catalog: %s",
                    assignment.getCatalog() != null ? assignment.getCatalog().getTitle() : "Unknown");
                auditLogService.log("STATUS_CHANGE", "worker_catalog", assignment.getId(), assignmentDetails, null);
            }
            
            entityManager.flush(); // Force immediate database update for all assignments
            logger.info("All {} assignments restored and flushed to database", blockedAssignments.size());
            details += String.format(" - %d assignments restored", blockedAssignments.size());
        }
        
        logger.info("Worker status toggle completed successfully");
        return updated;
    }

    public int getWorkerAssignmentCount(UUID workerId) {
        List<WorkerCatalog> assignments = workerCatalogRepository.findByWorkerId(workerId);
        return (int) assignments.stream()
            .filter(wc -> "active".equals(wc.getStatus()) || 
                         "verified".equals(wc.getStatus()) || 
                         "in_progress".equals(wc.getStatus()))
            .count();
    }

    public List<Worker> getActiveWorkersByCompanyId(UUID companyId) {
        return workerRepository.findByCompanyId(companyId).stream()
            .filter(w -> "active".equals(w.getStatus()))
            .collect(Collectors.toList());
    }
}

