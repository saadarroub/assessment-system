package com.assessment.backend.repository;

import com.assessment.backend.entity.WorkerCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkerCatalogRepository extends JpaRepository<WorkerCatalog, UUID> {
    
    // Find by worker
    List<WorkerCatalog> findByWorkerId(UUID workerId);
    
    // Find by catalog
    List<WorkerCatalog> findByCatalogId(UUID catalogId);
    
    // Find by company
    List<WorkerCatalog> findByCompanyId(UUID companyId);
    
    // Find by status
    List<WorkerCatalog> findByStatus(String status);
    
    // Find by worker and status
    List<WorkerCatalog> findByWorkerIdAndStatus(UUID workerId, String status);
    
    // Find by access code (for login)
    Optional<WorkerCatalog> findByAccessCode(String accessCode);
    
    // Find by access token (for email link)
    Optional<WorkerCatalog> findByAccessToken(String accessToken);
    
    // Check if assignment already exists
    Optional<WorkerCatalog> findByWorkerIdAndCatalogId(UUID workerId, UUID catalogId);
}