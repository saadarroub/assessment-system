package com.assessment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSummaryDto {
    private UUID id;
    private String workerName;
    private String workerEmail;
    private String catalogTitle;
    private String companyName;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
}
