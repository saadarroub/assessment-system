package com.assessment.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * Time series data for a single theme.
 * Contains aggregated average scores over time.
 */
public class ThemeTimeSeriesDto {
    private UUID themeId;
    private String themeName;
    private String themeColor;
    private List<ThemeTimePointDto> data;

    public ThemeTimeSeriesDto() {}

    public ThemeTimeSeriesDto(UUID themeId, String themeName, 
                               String themeColor, List<ThemeTimePointDto> data) {
        this.themeId = themeId;
        this.themeName = themeName;
        this.themeColor = themeColor;
        this.data = data;
    }

    // Getters and Setters
    public UUID getThemeId() { return themeId; }
    public void setThemeId(UUID themeId) { this.themeId = themeId; }

    public String getThemeName() { return themeName; }
    public void setThemeName(String themeName) { this.themeName = themeName; }

    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }

    public List<ThemeTimePointDto> getData() { return data; }
    public void setData(List<ThemeTimePointDto> data) { this.data = data; }
}
