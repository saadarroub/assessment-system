package com.assessment.backend.dto;

import java.util.List;

/**
 * Response containing time series for one or two themes.
 */
public class ThemeTimeSeriesResponseDto {
    private List<ThemeTimeSeriesDto> series;
    private Double overallAveragePercent;

    public ThemeTimeSeriesResponseDto() {}

    public ThemeTimeSeriesResponseDto(List<ThemeTimeSeriesDto> series, Double overallAveragePercent) {
        this.series = series;
        this.overallAveragePercent = overallAveragePercent;
    }

    // Getters and Setters
    public List<ThemeTimeSeriesDto> getSeries() { return series; }
    public void setSeries(List<ThemeTimeSeriesDto> series) { this.series = series; }

    public Double getOverallAveragePercent() { return overallAveragePercent; }
    public void setOverallAveragePercent(Double overallAveragePercent) { this.overallAveragePercent = overallAveragePercent; }
}
