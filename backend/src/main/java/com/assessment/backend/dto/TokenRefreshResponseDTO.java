package com.assessment.backend.dto;

/**
 * TokenRefreshResponseDTO - Response für /api/auth/refresh Endpoint
 * 
 * Enthält nur den neuen Access Token + Expiry-Timestamp
 * Refresh Token bleibt in httpOnly Cookie
 */
public class TokenRefreshResponseDTO {
    private String accessToken;
    private long expiresAt; // Unix timestamp in milliseconds

    public TokenRefreshResponseDTO() {
    }

    public TokenRefreshResponseDTO(String accessToken, long expiresAt) {
        this.accessToken = accessToken;
        this.expiresAt = expiresAt;
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
}
