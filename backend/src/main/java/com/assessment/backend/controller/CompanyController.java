package com.assessment.backend.controller;

import com.assessment.backend.dto.CompanyResponseDTO;
import com.assessment.backend.dto.CreateCompanyDTO;
import com.assessment.backend.dto.UpdateCompanyDTO;
import com.assessment.backend.service.CompanyService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable UUID id) {
        return companyService.getCompanyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CompanyResponseDTO>> searchCompanies(@RequestParam String name) {
        return ResponseEntity.ok(companyService.searchCompaniesByName(name));
    }

    @PostMapping
    public ResponseEntity<CompanyResponseDTO> createCompany(@Valid @RequestBody CreateCompanyDTO dto) {
        CompanyResponseDTO created = companyService.createCompany(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateCompanyDTO dto) {
        CompanyResponseDTO updated = companyService.updateCompany(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CompanyResponseDTO> updateCompanyStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        CompanyResponseDTO updated = companyService.updateCompanyStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}

