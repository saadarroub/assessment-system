package com.assessment.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RoleSummaryDTO {
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private List<String> permissions;

    public RoleSummaryDTO() {}

    public RoleSummaryDTO(UUID id, String name, String description, LocalDateTime createdAt, List<String> permissions) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.permissions = permissions;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
}
