package com.assessment.backend.repository;

import com.assessment.backend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    long countBySessionId(UUID sessionId);

    Optional<Answer> findBySessionIdAndQuestionId(UUID sessionId, UUID questionId);
    
    List<Answer> findAllBySessionId(UUID sessionId);
    
    // Find all answers for multiple sessions (for theme analytics)
    List<Answer> findAllBySessionIdIn(Collection<UUID> sessionIds);
}