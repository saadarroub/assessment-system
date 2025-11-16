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
    
    // Constructors
    public SaveAnswerResponseDTO() {}
    
    public SaveAnswerResponseDTO(Boolean saved, UUID answerId, BigDecimal score, Long answeredCount) {
        this.saved = saved;
        this.answerId = answerId;
        this.score = score;
        this.answeredCount = answeredCount;
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
}
