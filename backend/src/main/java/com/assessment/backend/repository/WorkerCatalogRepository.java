package com.assessment.backend.repository;

import com.assessment.backend.entity.WorkerCatalog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkerCatalogRepository extends JpaRepository<WorkerCatalog, UUID> {
    
    Optional<WorkerCatalog> findByAccessToken(String accessToken);
    
    Optional<WorkerCatalog> findByAccessCode(String accessCode);
    
    Optional<WorkerCatalog> findByWorkerIdAndCatalogId(UUID workerId, UUID catalogId);
    
    List<WorkerCatalog> findByWorkerId(UUID workerId);
    
    List<WorkerCatalog> findByCatalogId(UUID catalogId);
    
    List<WorkerCatalog> findByCompanyId(UUID companyId);
    
    List<WorkerCatalog> findByStatus(String status);
}