package com.assessment.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_session")
public class AssessmentSession {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "status", nullable = false)
    private String status = "started"; // started|in_progress|completed|cancelled

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "worker_id")
    private UUID workerId;

    @Column(name = "thema_id")
    private UUID themaId;

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "total_score")
    private BigDecimal totalScore = BigDecimal.ZERO;

    @Column(name = "max_possible_score")
    private BigDecimal maxPossibleScore = BigDecimal.ZERO;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }

    public UUID getWorkerId() { return workerId; }
    public void setWorkerId(UUID workerId) { this.workerId = workerId; }

    public UUID getThemaId() { return themaId; }
    public void setThemaId(UUID themaId) { this.themaId = themaId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public BigDecimal getTotalScore() { return totalScore; }
    public void setTotalScore(BigDecimal totalScore) { this.totalScore = totalScore; }

    public BigDecimal getMaxPossibleScore() { return maxPossibleScore; }
    public void setMaxPossibleScore(BigDecimal maxPossibleScore) { this.maxPossibleScore = maxPossibleScore; }
}