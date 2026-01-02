package com.assessment.backend.service;

import com.assessment.backend.entity.Worker;
import com.assessment.backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class WorkerService {

    @Autowired
    private WorkerRepository workerRepository;

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
}

