package com.assessment.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.assessment.backend.entity.Thema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.assessment.backend.dto.CompanyResponseDTO;
import com.assessment.backend.dto.CreateCompanyDTO;
import com.assessment.backend.dto.UpdateCompanyDTO;
import com.assessment.backend.entity.Company;
import com.assessment.backend.repository.CompanyRepository;

@Service
public class  CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    // ========== Mapper Methods ==========
    
    private CompanyResponseDTO mapToDTO(Company company) {
        return new CompanyResponseDTO(
            company.getId(),
            company.getName(),
            company.getDescription(),
            company.getStatus(),
            company.getStreet(),
            company.getPostalCode(),
            company.getCity(),
            company.getCountry(),
            company.getWebsite(),
            company.getPhone(),
            company.getCreatedAt(),
            company.getUpdatedAt()
        );
    }

    private Company mapToEntity(CreateCompanyDTO dto) {
        return new Company(
            dto.getName(),
            dto.getDescription(),
            dto.getStreet(),
            dto.getPostalCode(),
            dto.getCity(),
            dto.getCountry() != null ? dto.getCountry() : "Deutschland",
            dto.getWebsite(),
            dto.getPhone()
        );
    }

    // ========== Service Methods ==========

    public List<CompanyResponseDTO> getAllCompanies() {
        return companyRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Optional<CompanyResponseDTO> getCompanyById(UUID id) {
        return companyRepository.findById(id)
                .map(this::mapToDTO);
    }

    public List<Company> getActiveStatus() { return companyRepository.findByStatus("active");}

    public List<Company> getInactiveStatus() { return companyRepository.findByStatus("inactive");}

  public Company changeStatus(UUID id) {
    Company company = companyRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));

    String currentStatus = company.getStatus();

    if (currentStatus.equals("active")) {

        company.setStatus("inactive");

    } else {

      company.setStatus("active");

    }

    return companyRepository.save(company);

  }

  //Update
  public List<Company> deactivateAll(){

    List<Company>companies = companyRepository.findByStatus("active");

    for(Company c : companies){

      c.setStatus("inactive");

    }

    return companyRepository.saveAll(companies);

  }

  public List<CompanyResponseDTO> searchCompaniesByName(String name) {
        return companyRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CompanyResponseDTO createCompany(CreateCompanyDTO dto) {
        Company company = mapToEntity(dto);
        Company saved = companyRepository.save(company);
        return mapToDTO(saved);
    }

    public CompanyResponseDTO updateCompany(UUID id, UpdateCompanyDTO dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
        
        // Nur Felder aktualisieren, die im DTO gesetzt sind
        if (dto.getName() != null) {
            company.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            company.setDescription(dto.getDescription());
        }
        if (dto.getStreet() != null) {
            company.setStreet(dto.getStreet());
        }
        if (dto.getPostalCode() != null) {
            company.setPostalCode(dto.getPostalCode());
        }
        if (dto.getCity() != null) {
            company.setCity(dto.getCity());
        }
        if (dto.getCountry() != null) {
            company.setCountry(dto.getCountry());
        }
        if (dto.getWebsite() != null) {
            company.setWebsite(dto.getWebsite());
        }
        if (dto.getPhone() != null) {
            company.setPhone(dto.getPhone());
        }
        
        Company updated = companyRepository.save(company);
        return mapToDTO(updated);
    }

    public void deleteCompany(UUID id) {
        companyRepository.deleteById(id);
    }

    // ========== Status Management ==========
    
    public CompanyResponseDTO updateCompanyStatus(UUID id, String status) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
        
        if (!"active".equals(status) && !"inactive".equals(status)) {
            throw new IllegalArgumentException("Status must be 'active' or 'inactive'");
        }
        
        company.setStatus(status);
        Company updated = companyRepository.save(company);
        return mapToDTO(updated);
    }
}

