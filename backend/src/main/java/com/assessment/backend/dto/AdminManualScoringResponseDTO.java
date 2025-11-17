package com.assessment.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO für Admin Manual Scoring - Session Review mit kategorisierten Fragen
 * Zeigt alle Fragen einer Session kategorisiert nach:
 * - Automatisch bewertete Fragen (score bereits berechnet)
 * - Manuell zu bewertende Fragen (Admin muss score vergeben)
 * - Übersprungene Fragen (nicht beantwortet)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminManualScoringResponseDTO {
    
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
    
    // Kategorisierte Fragen
    private List<QuestionForScoring> automatischBewerteteFragen;
    private List<QuestionForScoring> manuellZuBewertendeFragen;
    private List<QuestionForScoring> uebersprungeneFragen;
    
    // Zähler
    private Integer automatischBewertetAnzahl;
    private Integer manuellZuBewertenAnzahl;
    private Integer uebersprungenAnzahl;
    private Integer totalQuestions;
    
    /**
     * Nested class für einzelne Frage mit Antwort
     */
    public static class QuestionForScoring {
        private UUID questionId;
        private String questionText;
        private String inputType;
        private Object answeredValue;
        private BigDecimal score;          // Aktueller Score (bei manuellen = 0 oder vom Admin vergeben)
        private BigDecimal maxScore;       // Maximale Punkte für diese Frage
        private LocalDateTime answeredAt;
        private Integer orderIndex;
        private Boolean isRequired;
        
        public QuestionForScoring() {}
        
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
    }
    
    // Constructors
    public AdminManualScoringResponseDTO() {}
    
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
    
    public List<QuestionForScoring> getAutomatischBewerteteFragen() {
        return automatischBewerteteFragen;
    }
    
    public void setAutomatischBewerteteFragen(List<QuestionForScoring> automatischBewerteteFragen) {
        this.automatischBewerteteFragen = automatischBewerteteFragen;
    }
    
    public List<QuestionForScoring> getManuellZuBewertendeFragen() {
        return manuellZuBewertendeFragen;
    }
    
    public void setManuellZuBewertendeFragen(List<QuestionForScoring> manuellZuBewertendeFragen) {
        this.manuellZuBewertendeFragen = manuellZuBewertendeFragen;
    }
    
    public List<QuestionForScoring> getUebersprungeneFragen() {
        return uebersprungeneFragen;
    }
    
    public void setUebersprungeneFragen(List<QuestionForScoring> uebersprungeneFragen) {
        this.uebersprungeneFragen = uebersprungeneFragen;
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
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
}
