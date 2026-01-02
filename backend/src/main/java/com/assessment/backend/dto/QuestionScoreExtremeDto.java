package com.assessment.backend.dto;

import java.util.UUID;

/**
 * A question with its average score statistics across all sessions
 */
public class QuestionScoreExtremeDto {
    private UUID id;
    private String questionText;
    private UUID themeId;
    private String themeName;
    private Double avgScorePercent;
    private Integer totalAnswers;
    private Integer correctAnswers;

    public QuestionScoreExtremeDto() {}

    public QuestionScoreExtremeDto(UUID id, String questionText, UUID themeId, String themeName,
                                    Double avgScorePercent, Integer totalAnswers, Integer correctAnswers) {
        this.id = id;
        this.questionText = questionText;
        this.themeId = themeId;
        this.themeName = themeName;
        this.avgScorePercent = avgScorePercent;
        this.totalAnswers = totalAnswers;
        this.correctAnswers = correctAnswers;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public UUID getThemeId() { return themeId; }
    public void setThemeId(UUID themeId) { this.themeId = themeId; }

    public String getThemeName() { return themeName; }
    public void setThemeName(String themeName) { this.themeName = themeName; }

    public Double getAvgScorePercent() { return avgScorePercent; }
    public void setAvgScorePercent(Double avgScorePercent) { this.avgScorePercent = avgScorePercent; }

    public Integer getTotalAnswers() { return totalAnswers; }
    public void setTotalAnswers(Integer totalAnswers) { this.totalAnswers = totalAnswers; }

    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }
}
