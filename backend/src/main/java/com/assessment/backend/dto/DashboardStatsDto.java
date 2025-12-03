package com.assessment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Long totalCompanies;
    private Long totalCatalogs;
    private Long totalThemes;
    private Long totalWorkers;
    private Long totalAssignments;
    private Long activeAssignments;
    private Long completedAssignments;
    private Long totalSessions;
    private Long completedSessions;
}
