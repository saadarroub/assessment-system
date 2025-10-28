package com.assessment.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO für Catalog-Score (Admin Panel)
 */
public class CatalogScoreDTO {
    
    private UUID catalogId;
    private String catalogTitle;
    private BigDecimal totalScore;
    private BigDecimal maxPossibleScore;
    private Double percentageScore; // 0-100%
    private Long completedSessions;
    private Long totalSessions;
    private List<ThemaScoreDTO> themaScores; // Scores pro Thema
    private List<WorkerCatalogScoreDTO> workerScores; // Worker die diesen Catalog bearbeiten
    
    public CatalogScoreDTO() {}
    
    public CatalogScoreDTO(UUID catalogId, String catalogTitle, BigDecimal totalScore,
                           BigDecimal maxPossibleScore, Double percentageScore,
                           Long completedSessions, Long totalSessions,
                           List<ThemaScoreDTO> themaScores,
                           List<WorkerCatalogScoreDTO> workerScores) {
        this.catalogId = catalogId;
        this.catalogTitle = catalogTitle;
        this.totalScore = totalScore;
        this.maxPossibleScore = maxPossibleScore;
        this.percentageScore = percentageScore;
        this.completedSessions = completedSessions;
        this.totalSessions = totalSessions;
        this.themaScores = themaScores;
        this.workerScores = workerScores;
    }
    
    // Getters and Setters
    public UUID getCatalogId() {
        return catalogId;
    }
    
    public void setCatalogId(UUID catalogId) {
        this.catalogId = catalogId;
    }
    
    public String getCatalogTitle() {
        return catalogTitle;
    }
    
    public void setCatalogTitle(String catalogTitle) {
        this.catalogTitle = catalogTitle;
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
    
    public List<ThemaScoreDTO> getThemaScores() {
        return themaScores;
    }
    
    public void setThemaScores(List<ThemaScoreDTO> themaScores) {
        this.themaScores = themaScores;
    }
    
    public List<WorkerCatalogScoreDTO> getWorkerScores() {
        return workerScores;
    }
    
    public void setWorkerScores(List<WorkerCatalogScoreDTO> workerScores) {
        this.workerScores = workerScores;
    }
}
