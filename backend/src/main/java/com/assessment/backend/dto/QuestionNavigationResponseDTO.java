package com.assessment.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO für Question Navigation (Next & Previous Endpoints)
 * Enthält Frage-Details + optional die aktuelle Antwort (bei Previous)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionNavigationResponseDTO {
    
    private UUID questionId;
    
    @JsonProperty("index")
    private Integer orderIndex;
    
    private String text;
    
    private String inputType;
    
    private String questionTypeName;
    
    // JSON String (wird vom Frontend geparsed)
    private String options;
    
    private String scoringSchema;
    
    private Boolean answered;
    
    // Nur für Previous: Die gespeicherte Antwort
    private AnswerData currentAnswer;
    
    /**
     * Nested class für Antwort-Daten
     */
    public static class AnswerData {
        private UUID answerId;
        private Object value;           // Der gespeicherte Wert (String, Integer, Array, etc.)
        private BigDecimal score;
        private LocalDateTime answeredAt;
        
        public AnswerData() {}
        
        public AnswerData(UUID answerId, Object value, BigDecimal score, LocalDateTime answeredAt) {
            this.answerId = answerId;
            this.value = value;
            this.score = score;
            this.answeredAt = answeredAt;
        }
        
        // Getters and Setters
        public UUID getAnswerId() {
            return answerId;
        }
        
        public void setAnswerId(UUID answerId) {
            this.answerId = answerId;
        }
        
        public Object getValue() {
            return value;
        }
        
        public void setValue(Object value) {
            this.value = value;
        }
        
        public BigDecimal getScore() {
            return score;
        }
        
        public void setScore(BigDecimal score) {
            this.score = score;
        }
        
        public LocalDateTime getAnsweredAt() {
            return answeredAt;
        }
        
        public void setAnsweredAt(LocalDateTime answeredAt) {
            this.answeredAt = answeredAt;
        }
    }
    
    // Constructors
    public QuestionNavigationResponseDTO() {}
    
    // Getters and Setters
    public UUID getQuestionId() {
        return questionId;
    }
    
    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
    }
    
    public Integer getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public String getInputType() {
        return inputType;
    }
    
    public void setInputType(String inputType) {
        this.inputType = inputType;
    }
    
    public String getQuestionTypeName() {
        return questionTypeName;
    }
    
    public void setQuestionTypeName(String questionTypeName) {
        this.questionTypeName = questionTypeName;
    }
    
    public String getOptions() {
        return options;
    }
    
    public void setOptions(String options) {
        this.options = options;
    }
    
    public String getScoringSchema() {
        return scoringSchema;
    }
    
    public void setScoringSchema(String scoringSchema) {
        this.scoringSchema = scoringSchema;
    }
    
    public Boolean getAnswered() {
        return answered;
    }
    
    public void setAnswered(Boolean answered) {
        this.answered = answered;
    }
    
    public AnswerData getCurrentAnswer() {
        return currentAnswer;
    }
    
    public void setCurrentAnswer(AnswerData currentAnswer) {
        this.currentAnswer = currentAnswer;
    }
}
