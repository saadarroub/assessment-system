package com.assessment.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.UUID;

/**
 * DTO für Question mit automatischer JSON-Konvertierung
 * Erlaubt direkte JSON-Objekte für options und scoringSchema
 */
public class QuestionDTO {
    
    private UUID id;
    
    private String text;
    
    @JsonProperty("questionType")
    private QuestionTypeRef questionType;
    
    // ⬅️ Als Object statt Map - akzeptiert sowohl Arrays als auch Objekte!
    // Arrays für: multiple_choice, multiple_select, dropdown, ordering
    // Objects für: rating_scale (optional)
    private Object options;
    
    @JsonProperty("scoringSchema")
    private Object scoringSchema;
    
    // Nested class für QuestionType Referenz
    public static class QuestionTypeRef {
        private UUID id;
        
        public QuestionTypeRef() {}
        
        public QuestionTypeRef(UUID id) {
            this.id = id;
        }
        
        public UUID getId() {
            return id;
        }
        
        public void setId(UUID id) {
            this.id = id;
        }
    }
    
    // Constructors
    public QuestionDTO() {}
    
    public QuestionDTO(String text, QuestionTypeRef questionType, 
                       Object options, Object scoringSchema) {
        this.text = text;
        this.questionType = questionType;
        this.options = options;
        this.scoringSchema = scoringSchema;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public QuestionTypeRef getQuestionType() {
        return questionType;
    }
    
    public void setQuestionType(QuestionTypeRef questionType) {
        this.questionType = questionType;
    }
    
    public Object getOptions() {
        return options;
    }
    
    public void setOptions(Object options) {
        this.options = options;
    }
    
    public Object getScoringSchema() {
        return scoringSchema;
    }
    
    public void setScoringSchema(Object scoringSchema) {
        this.scoringSchema = scoringSchema;
    }
}
