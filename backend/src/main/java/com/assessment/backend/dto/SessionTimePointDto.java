package com.assessment.backend.dto;

import java.time.LocalDate;

/**
 * A single data point in the session time series
 */
public class SessionTimePointDto {
    private LocalDate date;
    private Double scorePercent;
    private Integer questionCount;
    private Integer answerCount;

    public SessionTimePointDto() {}

    public SessionTimePointDto(LocalDate date, Double scorePercent, Integer questionCount, Integer answerCount) {
        this.date = date;
        this.scorePercent = scorePercent;
        this.questionCount = questionCount;
        this.answerCount = answerCount;
    }

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Double getScorePercent() { return scorePercent; }
    public void setScorePercent(Double scorePercent) { this.scorePercent = scorePercent; }

    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }

    public Integer getAnswerCount() { return answerCount; }
    public void setAnswerCount(Integer answerCount) { this.answerCount = answerCount; }
}
