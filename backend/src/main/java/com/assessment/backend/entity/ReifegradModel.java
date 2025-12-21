package com.assessment.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reifegrad_models")
public class ReifegradModel {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @OneToMany(
            mappedBy = "model",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    private List<ReifegradInterval> intervals = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ReifegradModel() {}

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDescription() { return description; }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public List<ReifegradInterval> getIntervals() { return intervals; }

    public void setIntervals(List<ReifegradInterval> intervals) {
        this.intervals = intervals;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void addInterval(ReifegradInterval interval) {
        intervals.add(interval);
        interval.setModel(this);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeInterval(ReifegradInterval interval) {
        intervals.remove(interval);
        interval.setModel(null);
        this.updatedAt = LocalDateTime.now();
    }
}
