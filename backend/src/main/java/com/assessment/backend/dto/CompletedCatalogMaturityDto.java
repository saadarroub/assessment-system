package com.assessment.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO für abgeschlossene Kataloge mit Reifegradmodell-Informationen
 * Zeigt aggregierte Scores aus allen Sessions eines Katalogs
 */
public class CompletedCatalogMaturityDto {
    private UUID assignmentId;  // WorkerCatalog ID
    private String workerName;
    private String companyName;
    private String catalogTitle;
    private BigDecimal avgScore;      // Durchschnittlicher Score
    private BigDecimal totalMaxScore; // Max möglicher Score
    private Double percentage;
    private LocalDateTime completedAt;
    private int sessionCount;         // Anzahl der Sessions
    
    // Reifegradmodell-Infos
    private UUID reifegradModelId;
    private String reifegradModelName;
    private List<IntervalDto> intervals;
    private String currentIntervalName;
    private Integer currentIntervalIndex; // Index des aktuellen Intervalls
    private String currentIntervalColor;  // Farbe des aktuellen Intervalls
    
    // Innere Klasse für Intervalle
    public static class IntervalDto {
        private String name;
        private int start;
        private int end;
        private String color; // Hex-Farbe
        
        public IntervalDto() {}
        
        public IntervalDto(String name, int start, int end) {
            this.name = name;
            this.start = start;
            this.end = end;
        }
        
        public IntervalDto(String name, int start, int end, String color) {
            this.name = name;
            this.start = start;
            this.end = end;
            this.color = color;
        }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getStart() { return start; }
        public void setStart(int start) { this.start = start; }
        public int getEnd() { return end; }
        public void setEnd(int end) { this.end = end; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
    
    // Getters and Setters
    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }
    
    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getCatalogTitle() { return catalogTitle; }
    public void setCatalogTitle(String catalogTitle) { this.catalogTitle = catalogTitle; }
    
    public BigDecimal getAvgScore() { return avgScore; }
    public void setAvgScore(BigDecimal avgScore) { this.avgScore = avgScore; }
    
    public BigDecimal getTotalMaxScore() { return totalMaxScore; }
    public void setTotalMaxScore(BigDecimal totalMaxScore) { this.totalMaxScore = totalMaxScore; }
    
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public int getSessionCount() { return sessionCount; }
    public void setSessionCount(int sessionCount) { this.sessionCount = sessionCount; }
    
    public UUID getReifegradModelId() { return reifegradModelId; }
    public void setReifegradModelId(UUID reifegradModelId) { this.reifegradModelId = reifegradModelId; }
    
    public String getReifegradModelName() { return reifegradModelName; }
    public void setReifegradModelName(String reifegradModelName) { this.reifegradModelName = reifegradModelName; }
    
    public List<IntervalDto> getIntervals() { return intervals; }
    public void setIntervals(List<IntervalDto> intervals) { this.intervals = intervals; }
    
    public String getCurrentIntervalName() { return currentIntervalName; }
    public void setCurrentIntervalName(String currentIntervalName) { this.currentIntervalName = currentIntervalName; }
    
    public Integer getCurrentIntervalIndex() { return currentIntervalIndex; }
    public void setCurrentIntervalIndex(Integer currentIntervalIndex) { this.currentIntervalIndex = currentIntervalIndex; }
    
    public String getCurrentIntervalColor() { return currentIntervalColor; }
    public void setCurrentIntervalColor(String currentIntervalColor) { this.currentIntervalColor = currentIntervalColor; }
}
