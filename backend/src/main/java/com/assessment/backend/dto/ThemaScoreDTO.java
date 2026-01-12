package com.assessment.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO für Thema-Score (Admin Panel)
 */
public class ThemaScoreDTO {
    
    private UUID themaId;
    private String themaName;
    private BigDecimal totalScore;
    private BigDecimal maxPossibleScore;
    private Double percentageScore; // 0-100%
    private Long completedSessions;
    private Long totalSessions;
    private UUID sessionId; // ID der besten completed Session
    
    public ThemaScoreDTO() {}
    
    public ThemaScoreDTO(UUID themaId, String themaName, BigDecimal totalScore, 
                         BigDecimal maxPossibleScore, Double percentageScore,
                         Long completedSessions, Long totalSessions) {
        this.themaId = themaId;
        this.themaName = themaName;
        this.totalScore = totalScore;
        this.maxPossibleScore = maxPossibleScore;
        this.percentageScore = percentageScore;
        this.completedSessions = completedSessions;
        this.totalSessions = totalSessions;
    }
    
    public ThemaScoreDTO(UUID themaId, String themaName, BigDecimal totalScore, 
                         BigDecimal maxPossibleScore, Double percentageScore,
                         Long completedSessions, Long totalSessions, UUID sessionId) {
        this.themaId = themaId;
        this.themaName = themaName;
        this.totalScore = totalScore;
        this.maxPossibleScore = maxPossibleScore;
        this.percentageScore = percentageScore;
        this.completedSessions = completedSessions;
        this.totalSessions = totalSessions;
        this.sessionId = sessionId;
    }
    
    // Getters and Setters
    public UUID getThemaId() {
        return themaId;
    }
    
    public void setThemaId(UUID themaId) {
        this.themaId = themaId;
    }
    
    public String getThemaName() {
        return themaName;
    }
    
    public void setThemaName(String themaName) {
        this.themaName = themaName;
    }
    
    public BigDecimal getTotalScore() {
        return totalScore;
    }
    
    public void setTotalScore(BigDecimal totalScore) {
        this.totalScore = totalScore;
    }
    
    public BigDecimal getMaxPossibleScore() {
        return maxPossibleScore;
    }
    
    public void setMaxPossibleScore(BigDecimal maxPossibleScore) {
        this.maxPossibleScore = maxPossibleScore;
    }
    
    public Double getPercentageScore() {
        return percentageScore;
    }
    
    public void setPercentageScore(Double percentageScore) {
        this.percentageScore = percentageScore;
    }
    
    public Long getCompletedSessions() {
        return completedSessions;
    }
    
    public void setCompletedSessions(Long completedSessions) {
        this.completedSessions = completedSessions;
    }
    
    public Long getTotalSessions() {
        return totalSessions;
    }
    
    public void setTotalSessions(Long totalSessions) {
        this.totalSessions = totalSessions;
    }
    
    public UUID getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }
}
