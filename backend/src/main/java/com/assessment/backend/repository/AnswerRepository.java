package com.assessment.backend.repository;

import com.assessment.backend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    long countBySessionId(UUID sessionId);

    Optional<Answer> findBySessionIdAndQuestionId(UUID sessionId, UUID questionId);
}