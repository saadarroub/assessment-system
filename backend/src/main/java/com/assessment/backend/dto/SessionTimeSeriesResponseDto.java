package com.assessment.backend.dto;

import java.util.List;

/**
 * Response containing time series for one or two sessions
 */
public class SessionTimeSeriesResponseDto {
    private List<SessionTimeSeriesDto> series;
    private Double averagePercent;

    public SessionTimeSeriesResponseDto() {}

    public SessionTimeSeriesResponseDto(List<SessionTimeSeriesDto> series, Double averagePercent) {
        this.series = series;
        this.averagePercent = averagePercent;
    }

    // Getters and Setters
    public List<SessionTimeSeriesDto> getSeries() { return series; }
    public void setSeries(List<SessionTimeSeriesDto> series) { this.series = series; }

    public Double getAveragePercent() { return averagePercent; }
    public void setAveragePercent(Double averagePercent) { this.averagePercent = averagePercent; }
}
