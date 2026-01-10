package com.assessment.backend.entity;

import com.assessment.backend.util.JsonbType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Reifegradmodell-Entity.
 * Die Intervalle werden als JSONB-Array gespeichert (flexibel, beliebig viele Intervalle).
 * Format: [{"name":"Initial","start":0,"end":30},{"name":"Optimiert","start":31,"end":100}]
 */
@Entity
@Table(name = "reifegrad_models")
public class ReifegradModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    /**
     * Intervalle als JSONB-Array.
     * Jedes Intervall hat: name (String), start (int), end (int).
     */
    @Type(JsonbType.class)
    @Column(name = "intervals_json", columnDefinition = "jsonb")
    private String intervalsJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ReifegradModel() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIntervalsJson() {
        return intervalsJson;
    }

    public void setIntervalsJson(String intervalsJson) {
        this.intervalsJson = intervalsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
