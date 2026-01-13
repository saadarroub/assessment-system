package com.assessment.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class QuestionConditionDTO {

  private UUID id;
  private UUID sourceQuestionId;
  private UUID targetNodeId;
  private String target;
  private String operator;
  private String expectedValue;
  private UUID sessionId;
  private LocalDateTime createdAt;

  // Konstruktoren
  public QuestionConditionDTO() {}

  public QuestionConditionDTO(UUID id, UUID sourceQuestionId, UUID targetNodeId, String operator,
                              String expectedValue, LocalDateTime createdAt) {
    this.id = id;
    this.sourceQuestionId = sourceQuestionId;
    this.targetNodeId = targetNodeId;
    this.operator = operator;
    this.expectedValue = expectedValue;
    this.createdAt = createdAt;
  }

  // Getter und Setter
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getSourceQuestionId() {
    return sourceQuestionId;
  }

  public void setSourceQuestionId(UUID sourceQuestionId) {
    this.sourceQuestionId = sourceQuestionId;
  }

  public UUID getTargetNodeId() {
    return targetNodeId;
  }

  public void setTargetNodeId(UUID targetNodeId) {
    this.targetNodeId = targetNodeId;
  }

  public String getOperator() {
    return operator;
  }

  public void setOperator(String operator) {
    this.operator = operator;
  }

  public String getExpectedValue() {
    return expectedValue;
  }

  public void setExpectedValue(String expectedValue) {
    this.expectedValue = expectedValue;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}