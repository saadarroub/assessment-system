package com.assessment.backend.dto;

import java.util.UUID;

/**
 * DTO für Worker-Score in einem Catalog (für Tabelle im Admin Panel)
 */
public class WorkerCatalogScoreDTO {
    
    private UUID workerId;
    private String workerName;
    private String workerEmail;
    private Double percentageScore; // 0-100%
    private Long completedThemas;
    private Long totalThemas;
    private String status; // completed, in_progress, assigned
    
    public WorkerCatalogScoreDTO() {}
    
    public WorkerCatalogScoreDTO(UUID workerId, String workerName, String workerEmail,
                                  Double percentageScore, Long completedThemas, Long totalThemas,
                                  String status) {
        this.workerId = workerId;
        this.workerName = workerName;
        this.workerEmail = workerEmail;
        this.percentageScore = percentageScore;
        this.completedThemas = completedThemas;
        this.totalThemas = totalThemas;
        this.status = status;
    }
    
    // Getters and Setters
    public UUID getWorkerId() {
        return workerId;
    }
    
    public void setWorkerId(UUID workerId) {
        this.workerId = workerId;
    }
    
    public String getWorkerName() {
        return workerName;
    }
    
    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }
    
    public String getWorkerEmail() {
        return workerEmail;
    }
    
    public void setWorkerEmail(String workerEmail) {
        this.workerEmail = workerEmail;
    }
    
    public Double getPercentageScore() {
        return percentageScore;
    }
    
    public void setPercentageScore(Double percentageScore) {
        this.percentageScore = percentageScore;
    }
    
    public Long getCompletedThemas() {
        return completedThemas;
    }
    
    public void setCompletedThemas(Long completedThemas) {
        this.completedThemas = completedThemas;
    }
    
    public Long getTotalThemas() {
        return totalThemas;
    }
    
    public void setTotalThemas(Long totalThemas) {
        this.totalThemas = totalThemas;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
