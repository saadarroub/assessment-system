package com.assessment.backend.dto;

import java.math.BigDecimal;

/**
 * DTO für Admin Request: Score für manuelle Frage aktualisieren
 */
public class UpdateManualScoreRequestDTO {
    
    private BigDecimal score;
    
    public UpdateManualScoreRequestDTO() {}
    
    public BigDecimal getScore() {
        return score;
    }
    
    public void setScore(BigDecimal score) {
        this.score = score;
    }
}
