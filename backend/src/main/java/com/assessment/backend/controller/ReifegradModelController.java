package com.assessment.backend.controller;

import com.assessment.backend.dto.ReifegradModelDTO;
import com.assessment.backend.service.ReifegradModelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<List<ReifegradModelDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReifegradModelDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ReifegradModelDTO> create(@Valid @RequestBody ReifegradModelDTO dto) {
        ReifegradModelDTO created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReifegradModelDTO> update(@PathVariable UUID id, @Valid @RequestBody ReifegradModelDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
