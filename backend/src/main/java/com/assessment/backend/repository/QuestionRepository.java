package com.assessment.backend.repository;

import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    
    // Find all with QuestionType loaded
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.questionType")
    List<Question> findAllWithQuestionType();
    
    // Find by Question Type
    List<Question> findByQuestionType(QuestionType questionType);
    
    // Find by Question Type ID
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.questionType WHERE q.questionType.id = :questionTypeId")
    List<Question> findByQuestionTypeId(UUID questionTypeId);

    // Find by text containing (search)
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.questionType WHERE LOWER(q.text) LIKE LOWER(CONCAT('%', :text, '%'))")
    List<Question> findByTextContainingIgnoreCase(String text);
    
    // Find questions with options (JSONB not null)
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.questionType WHERE q.options IS NOT NULL AND q.options != ''")
    List<Question> findQuestionsWithOptions();
    
    // Find questions without options
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.questionType WHERE q.options IS NULL OR q.options = ''")
    List<Question> findQuestionsWithoutOptions();
    
    // Find questions with scoring schema
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.questionType WHERE q.scoringSchema IS NOT NULL AND q.scoringSchema != ''")
    List<Question> findQuestionsWithScoringSchema();
    
    // Count questions by type
    long countByQuestionTypeId(UUID questionTypeId);

  // Check if question with same text exists for type
    boolean existsByTextAndQuestionType_Id(String text, UUID questionTypeId);

}
