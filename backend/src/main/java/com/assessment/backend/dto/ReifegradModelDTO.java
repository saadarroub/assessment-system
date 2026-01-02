package com.assessment.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO für ReifegradModel (Request und Response).
 */
public class ReifegradModelDTO {

    private UUID id;

    @NotBlank(message = "Name ist erforderlich")
    @Size(max = 255, message = "Name darf maximal 255 Zeichen haben")
    private String name;

    @Size(max = 2000, message = "Beschreibung darf maximal 2000 Zeichen haben")
    private String description;

    @NotEmpty(message = "Mindestens ein Intervall ist erforderlich")
    @Valid
    private List<ReifegradIntervalDTO> intervals;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReifegradModelDTO() {}

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

    public List<ReifegradIntervalDTO> getIntervals() {
        return intervals;
    }

    public void setIntervals(List<ReifegradIntervalDTO> intervals) {
        this.intervals = intervals;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
