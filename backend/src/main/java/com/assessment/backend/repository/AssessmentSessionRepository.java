package com.assessment.backend.repository;

import com.assessment.backend.entity.AssessmentSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentSessionRepository extends JpaRepository<AssessmentSession, UUID> {

    Optional<AssessmentSession> findFirstByWorkerIdAndThemaIdAndStatusInOrderByCreatedAtDesc(
            UUID workerId, UUID themaId, Collection<String> statuses
    );

    Optional<AssessmentSession> findFirstByWorkerIdAndThemaIdOrderByCreatedAtDesc(
            UUID workerId, UUID themaId
    );
}