package com.assessment.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * Enhanced LoginResponseDTO - jetzt mit expiresAt und roles
 * 
 * WICHTIG:
 * - accessToken: JWT Access Token (15 Minuten gültig)
 * - expiresAt: Unix timestamp wann Token abläuft
 * - refreshToken wird NICHT mitgeschickt (ist in httpOnly Cookie)
 */
public class EnhancedLoginResponseDTO {
    private UUID id;
    private String username;
    private String email;
    private String accessToken;
    private long expiresAt; // Unix timestamp in milliseconds
    private List<String> roles;
    private List<String> permissions;

    public EnhancedLoginResponseDTO() {
    }

    public EnhancedLoginResponseDTO(UUID id, String username, String email,
                                     String accessToken, long expiresAt,
                                     List<String> roles, List<String> permissions) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.accessToken = accessToken;
        this.expiresAt = expiresAt;
        this.roles = roles;
        this.permissions = permissions;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(long expiresAt) {
        this.expiresAt = expiresAt;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }
}
