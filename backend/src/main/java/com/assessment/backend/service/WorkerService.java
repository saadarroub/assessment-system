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
        return workerRepository.save(worker);
    }

    public Worker updateWorker(UUID id, Worker workerDetails) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        
        worker.setName(workerDetails.getName());
        worker.setWorkSpaceRef(workerDetails.getWorkSpaceRef());
        worker.setCompanyId(workerDetails.getCompanyId());
        worker.setEmail(workerDetails.getEmail());
        
        return workerRepository.save(worker);
    }

    public void deleteWorker(UUID id) {
        workerRepository.deleteById(id);
    }
}

