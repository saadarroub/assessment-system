package com.assessment.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * Top and bottom questions for a theme based on average score
 * across all sessions of that theme.
 */
public class ThemeQuestionExtremesDto {
    private UUID themeId;
    private String themeName;
    private List<QuestionScoreExtremeDto> worstQuestions;
    private List<QuestionScoreExtremeDto> bestQuestions;

    public ThemeQuestionExtremesDto() {}

    public ThemeQuestionExtremesDto(UUID themeId, String themeName,
                                     List<QuestionScoreExtremeDto> worstQuestions,
                                     List<QuestionScoreExtremeDto> bestQuestions) {
        this.themeId = themeId;
        this.themeName = themeName;
        this.worstQuestions = worstQuestions;
        this.bestQuestions = bestQuestions;
    }

    // Getters and Setters
    public UUID getThemeId() { return themeId; }
    public void setThemeId(UUID themeId) { this.themeId = themeId; }

    public String getThemeName() { return themeName; }
    public void setThemeName(String themeName) { this.themeName = themeName; }

    public List<QuestionScoreExtremeDto> getWorstQuestions() { return worstQuestions; }
    public void setWorstQuestions(List<QuestionScoreExtremeDto> worstQuestions) { this.worstQuestions = worstQuestions; }

    public List<QuestionScoreExtremeDto> getBestQuestions() { return bestQuestions; }
    public void setBestQuestions(List<QuestionScoreExtremeDto> bestQuestions) { this.bestQuestions = bestQuestions; }
}
