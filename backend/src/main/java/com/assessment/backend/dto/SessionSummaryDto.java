package com.assessment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionSummaryDto {
    private UUID id;
    private String workerName;
    private String themeName;
    private String companyName;
    private String status;
    private BigDecimal totalScore;
    private BigDecimal maxPossibleScore;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
