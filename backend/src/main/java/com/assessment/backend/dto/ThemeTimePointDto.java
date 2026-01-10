package com.assessment.backend.dto;

import java.time.LocalDateTime;

/**
 * A single data point in the theme time series.
 * Represents a single session completion with exact timestamp.
 */
public class ThemeTimePointDto {
    private LocalDateTime timestamp;
    private Double scorePercent;
    private String workerName;
    private String companyName;
    private Integer questionCount;

    public ThemeTimePointDto() {}

    public ThemeTimePointDto(LocalDateTime timestamp, Double scorePercent, 
                              String workerName, String companyName, Integer questionCount) {
        this.timestamp = timestamp;
        this.scorePercent = scorePercent;
        this.workerName = workerName;
        this.companyName = companyName;
        this.questionCount = questionCount;
    }

    // Getters and Setters
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Double getScorePercent() { return scorePercent; }
    public void setScorePercent(Double scorePercent) { this.scorePercent = scorePercent; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
}
