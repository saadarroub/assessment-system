package com.assessment.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogDTO {
    
    private UUID id;
    private String ts;  // ISO timestamp string for frontend
    private String actorName;
    private String actorEmail;
    private String action;
    private String resource;  // targetTable:targetId
    private String outcome;   // always "success" for now
    private String details;   // Additional info about the action

    public AuditLogDTO() {
    }

    public AuditLogDTO(UUID id, LocalDateTime timestamp, String actorName, String actorEmail, 
                       String action, String targetTable, UUID targetId, String details) {
        this.id = id;
        this.ts = timestamp != null ? timestamp.toString() : null;
        this.actorName = actorName != null ? actorName : "System";
        this.actorEmail = actorEmail != null ? actorEmail : "-";
        this.action = action;
        this.resource = targetTable + ":" + targetId;
        this.outcome = "success";
        this.details = details;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTs() {
        return ts;
    }

    public void setTs(String ts) {
        this.ts = ts;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
