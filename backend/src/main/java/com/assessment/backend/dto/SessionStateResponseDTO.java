package com.assessment.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

/**
 * DTO für Session State Endpoint
 * Gibt Fortschritt und Status einer Assessment-Session zurück
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SessionStateResponseDTO {
    
    private String status;
    private Long answeredCount;
    private Integer totalCount;
    private Integer progressPercent;  // 0-100 ohne Nachkommastellen
    private UUID themaId;
    
    // Constructors
    public SessionStateResponseDTO() {}
    
    public SessionStateResponseDTO(String status, Long answeredCount, Integer totalCount, Integer progressPercent, UUID themaId) {
        this.status = status;
        this.answeredCount = answeredCount;
        this.totalCount = totalCount;
        this.progressPercent = progressPercent;
        this.themaId = themaId;
    }
    
    // Getters and Setters
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getAnsweredCount() {
        return answeredCount;
    }
    
    public void setAnsweredCount(Long answeredCount) {
        this.answeredCount = answeredCount;
    }
    
    public Integer getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
    
    public Integer getProgressPercent() {
        return progressPercent;
    }
    
    public void setProgressPercent(Integer progressPercent) {
        this.progressPercent = progressPercent;
    }
    
    public UUID getThemaId() {
        return themaId;
    }
    
    public void setThemaId(UUID themaId) {
        this.themaId = themaId;
    }
}
