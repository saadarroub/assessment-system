package com.assessment.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * Top and bottom questions for a session
 */
public class SessionQuestionExtremesDto {
    private UUID sessionId;
    private String sessionLabel;
    private List<QuestionScoreExtremeDto> worstQuestions;
    private List<QuestionScoreExtremeDto> bestQuestions;

    public SessionQuestionExtremesDto() {}

    public SessionQuestionExtremesDto(UUID sessionId, String sessionLabel,
                                       List<QuestionScoreExtremeDto> worstQuestions,
                                       List<QuestionScoreExtremeDto> bestQuestions) {
        this.sessionId = sessionId;
        this.sessionLabel = sessionLabel;
        this.worstQuestions = worstQuestions;
        this.bestQuestions = bestQuestions;
    }

    // Getters and Setters
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getSessionLabel() { return sessionLabel; }
    public void setSessionLabel(String sessionLabel) { this.sessionLabel = sessionLabel; }

    public List<QuestionScoreExtremeDto> getWorstQuestions() { return worstQuestions; }
    public void setWorstQuestions(List<QuestionScoreExtremeDto> worstQuestions) { this.worstQuestions = worstQuestions; }

    public List<QuestionScoreExtremeDto> getBestQuestions() { return bestQuestions; }
    public void setBestQuestions(List<QuestionScoreExtremeDto> bestQuestions) { this.bestQuestions = bestQuestions; }
}
