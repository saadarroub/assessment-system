package com.assessment.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO für Timeline-Ansicht aller Fragen einer Session
 * Sortiert nach Antwort-Reihenfolge (answered_at)
 * Mit Kategorisierung für Frontend-Farben
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SessionQuestionsTimelineDTO {
    
    private UUID sessionId;
    private String status;
    private UUID workerId;
    private String workerName;
    private UUID themaId;
    private String themaName;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    
    // Session Scores
    private BigDecimal totalScore;
    private BigDecimal maxPossibleScore;
    private Double percentageScore;
    
    // Alle Fragen in chronologischer Reihenfolge
    private List<QuestionTimeline> questions;
    
    // Statistiken
    private Integer totalQuestions;
    private Integer answeredCount;
    private Integer skippedCount;
    private Integer automaticCount;
    private Integer manualCount;
    
    /**
     * Nested class für einzelne Frage mit Status
     */
    public static class QuestionTimeline {
        private UUID questionId;
        private String questionText;
        private String inputType;
        private Integer orderIndex;
        private Boolean isRequired;
        
        // Antwort-Informationen
        private Object answeredValue;
        private BigDecimal score;
        private BigDecimal maxScore;
        private LocalDateTime answeredAt;
        
        // Status für Frontend-Farben
        private String status;  // "automatic", "manual", "skipped"
        
        public QuestionTimeline() {}
        
        // Getters and Setters
        public UUID getQuestionId() {
            return questionId;
        }
        
        public void setQuestionId(UUID questionId) {
            this.questionId = questionId;
        }
        
        public String getQuestionText() {
            return questionText;
        }
        
        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }
        
        public String getInputType() {
            return inputType;
        }
        
        public void setInputType(String inputType) {
            this.inputType = inputType;
        }
        
        public Integer getOrderIndex() {
            return orderIndex;
        }
        
        public void setOrderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
        }
        
        public Boolean getIsRequired() {
            return isRequired;
        }
        
        public void setIsRequired(Boolean isRequired) {
            this.isRequired = isRequired;
        }
        
        public Object getAnsweredValue() {
            return answeredValue;
        }
        
        public void setAnsweredValue(Object answeredValue) {
            this.answeredValue = answeredValue;
        }
        
        public BigDecimal getScore() {
            return score;
        }
        
        public void setScore(BigDecimal score) {
            this.score = score;
        }
        
        public BigDecimal getMaxScore() {
            return maxScore;
        }
        
        public void setMaxScore(BigDecimal maxScore) {
            this.maxScore = maxScore;
        }
        
        public LocalDateTime getAnsweredAt() {
            return answeredAt;
        }
        
        public void setAnsweredAt(LocalDateTime answeredAt) {
            this.answeredAt = answeredAt;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
    }
    
    // Constructors
    public SessionQuestionsTimelineDTO() {}
    
    // Getters and Setters
    public UUID getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
    
    public List<QuestionTimeline> getQuestions() {
        return questions;
    }
    
    public void setQuestions(List<QuestionTimeline> questions) {
        this.questions = questions;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public Integer getAnsweredCount() {
        return answeredCount;
    }
    
    public void setAnsweredCount(Integer answeredCount) {
        this.answeredCount = answeredCount;
    }
    
    public Integer getSkippedCount() {
        return skippedCount;
    }
    
    public void setSkippedCount(Integer skippedCount) {
        this.skippedCount = skippedCount;
    }
    
    public Integer getAutomaticCount() {
        return automaticCount;
    }
    
    public void setAutomaticCount(Integer automaticCount) {
        this.automaticCount = automaticCount;
    }
    
    public Integer getManualCount() {
        return manualCount;
    }
    
    public void setManualCount(Integer manualCount) {
        this.manualCount = manualCount;
    }
}
