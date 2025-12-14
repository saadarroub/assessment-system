package com.assessment.backend.repository;

import com.assessment.backend.entity.AssessmentSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentSessionRepository extends JpaRepository<AssessmentSession, UUID> {

    Optional<AssessmentSession> findFirstByWorkerIdAndThemaIdAndStatusInOrderByCreatedAtDesc(
            UUID workerId, UUID themaId, Collection<String> statuses
    );

    Optional<AssessmentSession> findFirstByWorkerIdAndThemaIdOrderByCreatedAtDesc(
            UUID workerId, UUID themaId
    );
    
    // Dashboard queries
    List<AssessmentSession> findByStatusOrderByCompletedAtDesc(String status, Pageable pageable);
    
    Long countByStatus(String status);
    
    @Query("SELECT t.name, AVG((s.totalScore * 100.0) / NULLIF(s.maxPossibleScore, 0)) " +
           "FROM AssessmentSession s JOIN Thema t ON s.themaId = t.id " +
           "WHERE s.status = 'completed' AND s.maxPossibleScore > 0 " +
           "GROUP BY t.name ORDER BY AVG((s.totalScore * 100.0) / NULLIF(s.maxPossibleScore, 0)) DESC")
    List<Object[]> findAverageScoresByTheme(Pageable pageable);
    
    // Count completed sessions for a worker and thema
    Long countByWorkerIdAndThemaIdAndStatus(UUID workerId, UUID themaId, String status);
    
    // Count all sessions for a worker at a company
    Long countByWorkerIdAndCompanyId(UUID workerId, UUID companyId);
    
    // Count completed sessions for a worker at a company
    Long countByWorkerIdAndCompanyIdAndStatus(UUID workerId, UUID companyId, String status);
    
    // Count sessions for a worker with specific thema IDs (for catalog completion check)
    @Query("SELECT COUNT(s) FROM AssessmentSession s WHERE s.workerId = :workerId AND s.themaId IN :themaIds")
    Long countByWorkerIdAndThemaIdIn(UUID workerId, Collection<UUID> themaIds);
    
    // Count completed sessions for a worker with specific thema IDs
    @Query("SELECT COUNT(s) FROM AssessmentSession s WHERE s.workerId = :workerId AND s.themaId IN :themaIds AND s.status = :status")
    Long countByWorkerIdAndThemaIdInAndStatus(UUID workerId, Collection<UUID> themaIds, String status);
}