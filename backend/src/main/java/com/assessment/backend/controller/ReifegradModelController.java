package com.assessment.backend.controller;

import com.assessment.backend.dto.ReifegradModelDTO;
import com.assessment.backend.service.ReifegradModelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAuthority('reifegradmodels.view')")
    public ResponseEntity<List<ReifegradModelDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('reifegradmodels.view')")
    public ResponseEntity<ReifegradModelDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('reifegradmodels.create')")
    public ResponseEntity<ReifegradModelDTO> create(@Valid @RequestBody ReifegradModelDTO dto) {
        ReifegradModelDTO created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('reifegradmodels.edit')")
    public ResponseEntity<ReifegradModelDTO> update(@PathVariable UUID id, @Valid @RequestBody ReifegradModelDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('reifegradmodels.delete')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
