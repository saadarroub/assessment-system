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
}