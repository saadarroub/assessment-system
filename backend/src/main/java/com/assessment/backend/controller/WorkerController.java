package com.assessment.backend.controller;

import com.assessment.backend.entity.Worker;
import com.assessment.backend.service.WorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    @GetMapping
    public ResponseEntity<List<Worker>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable UUID id) {
        return workerService.getWorkerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Worker>> getWorkersByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(workerService.getWorkersByCompanyId(companyId));
    }

    @GetMapping("/workspace/{workSpaceRef}")
    public ResponseEntity<List<Worker>> getWorkersByWorkSpace(@PathVariable String workSpaceRef) {
        return ResponseEntity.ok(workerService.getWorkersByWorkSpace(workSpaceRef));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('workers.create')")
    public ResponseEntity<Worker> createWorker(@RequestBody Worker worker) {
        Worker createdWorker = workerService.createWorker(worker);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWorker);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('workers.edit')")
    public ResponseEntity<Worker> updateWorker(@PathVariable UUID id, @RequestBody Worker worker) {
        Worker updatedWorker = workerService.updateWorker(id, worker);
        return ResponseEntity.ok(updatedWorker);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('workers.delete')")
    public ResponseEntity<Void> deleteWorker(@PathVariable UUID id) {
        workerService.deleteWorker(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status/change")
    public ResponseEntity<Worker> toggleWorkerStatus(@PathVariable UUID id) {
        try {
            Worker updated = workerService.toggleWorkerStatus(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/assignment-count")
    public ResponseEntity<Map<String, Integer>> getWorkerAssignmentCount(@PathVariable UUID id) {
        int count = workerService.getWorkerAssignmentCount(id);
        return ResponseEntity.ok(Map.of("count", count));
    }
}

