package com.assessment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusDistributionDto {
    private Map<String, Long> assignmentsByStatus;
    private Map<String, Long> sessionsByStatus;
}
