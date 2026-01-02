package com.assessment.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * Time series data for a single session
 */
public class SessionTimeSeriesDto {
    private UUID sessionId;
    private String sessionLabel;
    private String themeColor;
    private List<SessionTimePointDto> data;

    public SessionTimeSeriesDto() {}

    public SessionTimeSeriesDto(UUID sessionId, String sessionLabel, String themeColor, List<SessionTimePointDto> data) {
        this.sessionId = sessionId;
        this.sessionLabel = sessionLabel;
        this.themeColor = themeColor;
        this.data = data;
    }

    // Getters and Setters
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getSessionLabel() { return sessionLabel; }
    public void setSessionLabel(String sessionLabel) { this.sessionLabel = sessionLabel; }

    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }

    public List<SessionTimePointDto> getData() { return data; }
    public void setData(List<SessionTimePointDto> data) { this.data = data; }
}
