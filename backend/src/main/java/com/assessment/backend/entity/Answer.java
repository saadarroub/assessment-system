package com.assessment.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "answer")
public class Answer {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    // jsonb in DB; hier als String (valides JSON) persistiert
    @Column(name = "value", columnDefinition = "jsonb")
    private String value;

    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "question_id")
    private UUID questionId;

    @Column(name = "score")
    private BigDecimal score = BigDecimal.ZERO;

    @PrePersist
    public void prePersist() {
        if (answeredAt == null) {
            answeredAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        answeredAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LocalDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(LocalDateTime answeredAt) { this.answeredAt = answeredAt; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public UUID getQuestionId() { return questionId; }
    public void setQuestionId(UUID questionId) { this.questionId = questionId; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }
}