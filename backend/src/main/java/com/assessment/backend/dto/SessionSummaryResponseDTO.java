package com.assessment.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO für Session Summary - Übersicht aller beantworteten Fragen vor Complete
 * Zeigt alle Antworten mit Scores für finales Review
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SessionSummaryResponseDTO {
    
    private UUID sessionId;
    private String status;
    private UUID themaId;
    private String themaName;
    
    // Progress
    private Integer answeredCount;
    private Integer totalQuestions;
    private Integer progressPercent;
    
    // Scores
    private BigDecimal totalScore;
    private BigDecimal maxPossibleScore;
    
    // Alle beantworteten Fragen (chronologisch geordnet)
    private List<AnsweredQuestionSummary> answeredQuestions;
    
    // Zähler für Kategorien (für Frontend-Statistik)
    private Integer automatischBewertetAnzahl;
    private Integer manuellZuBewertenAnzahl;
    private Integer uebersprungenAnzahl;
    
    /**
     * Nested class für einzelne beantwortete Frage
     */
    public static class AnsweredQuestionSummary {
        private UUID questionId;
        private String questionText;
        private String questionTypeName;   // Name des Fragetyps (z.B. "Multiple Choice")
        private String inputType;
        private String options;            // JSON string der Optionen (für Multiple Choice, etc.)
        private Object answeredValue;      // Der gegebene Wert
        private BigDecimal score;          // Erhaltene Punkte
        private BigDecimal maxScore;       // Max mögliche Punkte für diese Frage
        private LocalDateTime answeredAt;
        private Integer orderIndex;
        private Boolean isRequired;        // Pflichtfrage ja/nein
        
        // Status Flags für Frontend
        private Boolean isManualReview;    // Benötigt manuelle Bewertung
        private Boolean isSkipped;         // Wurde übersprungen (null Antwort)
        private Boolean isAutoScored;      // Wurde automatisch bewertet
        
        public AnsweredQuestionSummary() {}
        
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
        
        public Boolean getIsManualReview() {
            return isManualReview;
        }
        
        public void setIsManualReview(Boolean isManualReview) {
            this.isManualReview = isManualReview;
        }
        
        public Boolean getIsSkipped() {
            return isSkipped;
        }
        
        public void setIsSkipped(Boolean isSkipped) {
            this.isSkipped = isSkipped;
        }
        
        public Boolean getIsAutoScored() {
            return isAutoScored;
        }
        
        public void setIsAutoScored(Boolean isAutoScored) {
            this.isAutoScored = isAutoScored;
        }
    }
    
    // Constructors
    public SessionSummaryResponseDTO() {}
    
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
    
    public Integer getAnsweredCount() {
        return answeredCount;
    }
    
    public void setAnsweredCount(Integer answeredCount) {
        this.answeredCount = answeredCount;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public Integer getProgressPercent() {
        return progressPercent;
    }
    
    public void setProgressPercent(Integer progressPercent) {
        this.progressPercent = progressPercent;
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
    
    public List<AnsweredQuestionSummary> getAnsweredQuestions() {
        return answeredQuestions;
    }
    
    public void setAnsweredQuestions(List<AnsweredQuestionSummary> answeredQuestions) {
        this.answeredQuestions = answeredQuestions;
    }

    public Integer getAutomatischBewertetAnzahl() {
        return automatischBewertetAnzahl;
    }

    public void setAutomatischBewertetAnzahl(Integer automatischBewertetAnzahl) {
        this.automatischBewertetAnzahl = automatischBewertetAnzahl;
    }

    public Integer getManuellZuBewertenAnzahl() {
        return manuellZuBewertenAnzahl;
    }

    public void setManuellZuBewertenAnzahl(Integer manuellZuBewertenAnzahl) {
        this.manuellZuBewertenAnzahl = manuellZuBewertenAnzahl;
    }

    public Integer getUebersprungenAnzahl() {
        return uebersprungenAnzahl;
    }

    public void setUebersprungenAnzahl(Integer uebersprungenAnzahl) {
        this.uebersprungenAnzahl = uebersprungenAnzahl;
    }
}
