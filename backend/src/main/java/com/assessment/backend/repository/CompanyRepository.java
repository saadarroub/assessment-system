package com.assessment.backend.repository;

import com.assessment.backend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    
    List<Company> findByNameContainingIgnoreCase(String name);

    // Find by the status
    List<Company> findByStatus(String status);
}

