package com.assessment.backend.dto;

import java.util.UUID;

/**
 * DTO for theme/topic selection in analytics.
 * Aggregates data across all completed sessions of a theme.
 */
public class ThemeOptionDto {
    private UUID id;
    private String name;
    private String catalogName;
    private Integer totalSessions;
    private Double avgScorePercent;

    public ThemeOptionDto() {}

    public ThemeOptionDto(UUID id, String name, String catalogName, 
                          Integer totalSessions, Double avgScorePercent) {
        this.id = id;
        this.name = name;
        this.catalogName = catalogName;
        this.totalSessions = totalSessions;
        this.avgScorePercent = avgScorePercent;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCatalogName() { return catalogName; }
    public void setCatalogName(String catalogName) { this.catalogName = catalogName; }

    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }

    public Double getAvgScorePercent() { return avgScorePercent; }
    public void setAvgScorePercent(Double avgScorePercent) { this.avgScorePercent = avgScorePercent; }
}
