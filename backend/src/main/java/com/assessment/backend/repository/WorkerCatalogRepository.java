package com.assessment.backend.repository;

import com.assessment.backend.entity.WorkerCatalog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
    
    // Dashboard queries
    List<WorkerCatalog> findTop10ByOrderByAssignedAtDesc();
    
    List<WorkerCatalog> findByStatusOrderByAssignedAtDesc(String status, Pageable pageable);
    
    Long countByStatus(String status);
    
    @Query("SELECT COUNT(wc) FROM WorkerCatalog wc WHERE wc.status IN ('assigned', 'in_progress')")
    Long countActiveAssignments();
    
    @Query("SELECT c.name, COUNT(wc) FROM WorkerCatalog wc JOIN wc.company c GROUP BY c.name ORDER BY COUNT(wc) DESC")
    List<Object[]> findTopCompaniesByAssignmentCount(Pageable pageable);
    
    @Query("SELECT comp.name, cat.title, COUNT(wc) " +
           "FROM WorkerCatalog wc " +
           "JOIN wc.company comp " +
           "JOIN wc.catalog cat " +
           "GROUP BY comp.name, cat.title " +
           "ORDER BY comp.name, COUNT(wc) DESC")
    List<Object[]> findCompanyHierarchy();

    // Abgeschlossene Kataloge für Reifegrad-Analyse
    List<WorkerCatalog> findByStatusOrderByCompletedAtDesc(String status, Pageable pageable);
}