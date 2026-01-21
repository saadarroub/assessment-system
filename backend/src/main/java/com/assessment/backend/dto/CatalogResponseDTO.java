package com.assessment.backend.dto;


import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO für die Catalog-Response, enthält Reifegradmodell-Info.
 */
public class CatalogResponseDTO {

    private UUID id;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Reifegradmodell-Info (vereinfacht, um Lazy-Loading-Probleme zu vermeiden)
    private UUID reifegradModelId;
    private String reifegradModelName;

    public CatalogResponseDTO() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public UUID getReifegradModelId() {
        return reifegradModelId;
    }

    public void setReifegradModelId(UUID reifegradModelId) {
        this.reifegradModelId = reifegradModelId;
    }

    public String getReifegradModelName() {
        return reifegradModelName;
    }

    public void setReifegradModelName(String reifegradModelName) {
        this.reifegradModelName = reifegradModelName;
    }
}
