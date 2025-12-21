package com.assessment.backend.controller;

import com.assessment.backend.entity.ReifegradModel;
import com.assessment.backend.service.ReifegradModelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reifegrad-models")
@CrossOrigin(origins = "*")
public class ReifegradModelController {

    private final ReifegradModelService service;

    public ReifegradModelController(ReifegradModelService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReifegradModel> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ReifegradModel getById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    public ReifegradModel create(@RequestBody ReifegradModel model) {
        return service.create(model);
    }

    @PutMapping("/{id}")
    public ReifegradModel update(@PathVariable UUID id, @RequestBody ReifegradModel model) {
        return service.update(id, model);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
