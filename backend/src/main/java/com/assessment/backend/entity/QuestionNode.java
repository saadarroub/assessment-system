package com.assessment.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "question_node")
public class QuestionNode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)  // ⬅️ EAGER statt LAZY
    @JoinColumn(name = "thema_id", nullable = false)
    private Thema thema;

    @ManyToOne(fetch = FetchType.EAGER)  // ⬅️ EAGER statt LAZY
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.EAGER)  // ⬅️ EAGER statt LAZY
    @JoinColumn(name = "parent_node_id")
    private QuestionNode parentNode;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public QuestionNode() {
    }

    public QuestionNode(Thema thema, Question question, Integer orderIndex) {
        this.thema = thema;
        this.question = question;
        this.orderIndex = orderIndex;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Thema getThema() {
        return thema;
    }

    public void setThema(Thema thema) {
        this.thema = thema;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public QuestionNode getParentNode() {
        return parentNode;
    }

    public void setParentNode(QuestionNode parentNode) {
        this.parentNode = parentNode;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
