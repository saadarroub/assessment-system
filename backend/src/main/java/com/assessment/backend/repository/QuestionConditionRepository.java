package com.assessment.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.assessment.backend.entity.Company;
import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionCondition;
import com.assessment.backend.entity.QuestionType;
import jdk.jfr.Registered;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionConditionRepository extends JpaRepository<QuestionCondition, UUID> {

  //Find a QuestionCondition Object with the sourceQuestionId and SessionId
  QuestionCondition findBySourceQuestionIdAndSessionId(UUID sourceQuestionId, UUID sessionId);

  //Find Question by SourceQuestionId
  @Query("SELECT q FROM Question q WHERE q.id = :sourceQuestionId")
  Question findQuestionBySourceQuestionId(@Param("sourceQuestionId") UUID sourceQuestionId);

  //Find Answer Value with QuestionID + SessionID
  @Query("SELECT a.value FROM Answer a WHERE a.questionId = :questionId AND a.sessionId = :sessionId")
  String findValueByQuestionIdAndSessionId(@Param("questionId") UUID questionId,
                                           @Param("sessionId") UUID sessionId);



}
