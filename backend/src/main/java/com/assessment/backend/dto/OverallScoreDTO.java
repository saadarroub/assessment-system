package com.assessment.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * DTO für Gesamtübersicht aller Scores einer Firma (Admin Panel Dashboard)
 */
public class OverallScoreDTO {
    
    private UUID companyId;
    private String companyName;
    private Double averagePercentageScore; // Durchschnitt aller Kataloge (0-100%)
    private Long totalCompletedSessions;
    private Long totalSessions;
    private Long totalWorkers;
    private Long totalCatalogs;
    private List<CatalogScoreDTO> catalogScores; // Scores pro Katalog
    
    public OverallScoreDTO() {}
    
    public OverallScoreDTO(UUID companyId, String companyName, Double averagePercentageScore, 
                           Long totalCompletedSessions, Long totalSessions, Long totalWorkers, 
                           Long totalCatalogs, List<CatalogScoreDTO> catalogScores) {
        this.companyId = companyId;
        this.companyName = companyName;
        this.averagePercentageScore = averagePercentageScore;
        this.totalCompletedSessions = totalCompletedSessions;
        this.totalSessions = totalSessions;
        this.totalWorkers = totalWorkers;
        this.totalCatalogs = totalCatalogs;
        this.catalogScores = catalogScores;
    }
    
    // Getters and Setters
    public UUID getCompanyId() {
        return companyId;
    }
    
    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public Double getAveragePercentageScore() {
        return averagePercentageScore;
    }
    
    public void setAveragePercentageScore(Double averagePercentageScore) {
        this.averagePercentageScore = averagePercentageScore;
    }
    
    public Long getTotalCompletedSessions() {
        return totalCompletedSessions;
    }
    
    public void setTotalCompletedSessions(Long totalCompletedSessions) {
        this.totalCompletedSessions = totalCompletedSessions;
    }
    
    public Long getTotalSessions() {
        return totalSessions;
    }
    
    public void setTotalSessions(Long totalSessions) {
        this.totalSessions = totalSessions;
    }
    
    public Long getTotalWorkers() {
        return totalWorkers;
    }
    
    public void setTotalWorkers(Long totalWorkers) {
        this.totalWorkers = totalWorkers;
    }
    
    public Long getTotalCatalogs() {
        return totalCatalogs;
    }
    
    public void setTotalCatalogs(Long totalCatalogs) {
        this.totalCatalogs = totalCatalogs;
    }
    
    public List<CatalogScoreDTO> getCatalogScores() {
        return catalogScores;
    }
    
    public void setCatalogScores(List<CatalogScoreDTO> catalogScores) {
        this.catalogScores = catalogScores;
    }
}
