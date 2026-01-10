package com.assessment.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for completed session selection in analytics
 */
public class CompletedSessionOptionDto {
    private UUID id;
    private String themeName;
    private String catalogName;
    private String companyName;
    private String workerName;
    private LocalDateTime completedAt;
    private Double scorePercent;

    public CompletedSessionOptionDto() {}

    public CompletedSessionOptionDto(UUID id, String themeName, String catalogName, 
                                      String companyName, String workerName, 
                                      LocalDateTime completedAt, Double scorePercent) {
        this.id = id;
        this.themeName = themeName;
        this.catalogName = catalogName;
        this.companyName = companyName;
        this.workerName = workerName;
        this.completedAt = completedAt;
        this.scorePercent = scorePercent;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getThemeName() { return themeName; }
    public void setThemeName(String themeName) { this.themeName = themeName; }

    public String getCatalogName() { return catalogName; }
    public void setCatalogName(String catalogName) { this.catalogName = catalogName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Double getScorePercent() { return scorePercent; }
    public void setScorePercent(Double scorePercent) { this.scorePercent = scorePercent; }
}
