package com.assessment.backend.entity;


import java.time.LocalDateTime;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "question_condition")
public class QuestionCondition {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name ="source_question_id")
  private UUID sourceQuestionId;

  @Column(name = "target_node_id")
  private UUID targetNodeId;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String operator;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String expectedValue;

  @Column(name = "session_id")
  private UUID sessionId;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "source_question_id", insertable = false, updatable = false)
  private Question question;

  //Getter

  public UUID getId() {return id;}

  public UUID getSourceQuestionId() {
    return sourceQuestionId;
  }

  public UUID getTargetNodeId() {
    return targetNodeId;
  }

  public String getOperator() {
    return operator;
  }

  public String getExpectedValue() {
    return expectedValue;
  }

  public UUID getSessionId() {
    return sessionId;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public Question getQuestion() {
    return question;
  }

  //Setter

  public void setTargetNodeId(UUID targetNodeId) {
    this.targetNodeId = targetNodeId;
  }

  public void setExpectedValue(String expectedValue) {
    this.expectedValue = expectedValue;
  }

  public void setSessionId(UUID sessionId) {
    this.sessionId = sessionId;
  }

  public void setQuestion(Question question) {
    this.question = question;
  }

  public void setSourceQuestionId(UUID sourceQuestionId) { this.sourceQuestionId = sourceQuestionId; }

  public void setOperator(String operator) {this.operator = operator;}
}
