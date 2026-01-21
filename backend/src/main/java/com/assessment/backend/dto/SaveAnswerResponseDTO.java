package com.assessment.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO für Save Answer Endpoint Response
 * Bestätigt das Speichern einer Antwort mit Score und Progress
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SaveAnswerResponseDTO {
    
    private Boolean saved;
    private UUID answerId;
    private BigDecimal score;
    private Long answeredCount;
    private BigDecimal maxPossibleScore;  // Dynamisch aktualisierter Max-Score
    private Integer totalQuestions;       // Dynamisch aktualisierte Gesamtanzahl
    private UUID nextQuestionId;          // Nächste Frage (kann durch Condition abweichen)
    private UUID nextNodeId;              // Node-ID der nächsten Frage
    
    // Constructors
    public SaveAnswerResponseDTO() {}
    
    public SaveAnswerResponseDTO(Boolean saved, UUID answerId, BigDecimal score, Long answeredCount) {
        this.saved = saved;
        this.answerId = answerId;
        this.score = score;
        this.answeredCount = answeredCount;
    }
    
    public SaveAnswerResponseDTO(Boolean saved, UUID answerId, BigDecimal score, Long answeredCount, 
                                  BigDecimal maxPossibleScore, Integer totalQuestions) {
        this.saved = saved;
        this.answerId = answerId;
        this.score = score;
        this.answeredCount = answeredCount;
        this.maxPossibleScore = maxPossibleScore;
        this.totalQuestions = totalQuestions;
    }
    
    // Getters and Setters
    public Boolean getSaved() {
        return saved;
    }
    
    public void setSaved(Boolean saved) {
        this.saved = saved;
    }
    
    public UUID getAnswerId() {
        return answerId;
    }
    
    public void setAnswerId(UUID answerId) {
        this.answerId = answerId;
    }
    
    public BigDecimal getScore() {
        return score;
    }
    
    public void setScore(BigDecimal score) {
        this.score = score;
    }
    
    public Long getAnsweredCount() {
        return answeredCount;
    }
    
    public void setAnsweredCount(Long answeredCount) {
        this.answeredCount = answeredCount;
    }
    
    public BigDecimal getMaxPossibleScore() {
        return maxPossibleScore;
    }
    
    public void setMaxPossibleScore(BigDecimal maxPossibleScore) {
        this.maxPossibleScore = maxPossibleScore;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public UUID getNextQuestionId() {
        return nextQuestionId;
    }
    
    public void setNextQuestionId(UUID nextQuestionId) {
        this.nextQuestionId = nextQuestionId;
    }
    
    public UUID getNextNodeId() {
        return nextNodeId;
    }
    
    public void setNextNodeId(UUID nextNodeId) {
        this.nextNodeId = nextNodeId;
    }
}
