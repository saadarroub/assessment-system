package com.assessment.backend.controller;

import com.assessment.backend.dto.AssignmentSummaryDto;
import com.assessment.backend.dto.CompanyActivityDto;
import com.assessment.backend.dto.DashboardStatsDto;
import com.assessment.backend.dto.HierarchyNodeDto;
import com.assessment.backend.dto.SessionSummaryDto;
import com.assessment.backend.dto.StatusDistributionDto;
import com.assessment.backend.dto.ThemeScoreDto;
import com.assessment.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats/overview")
    public ResponseEntity<DashboardStatsDto> getOverviewStats() {
        return ResponseEntity.ok(dashboardService.getOverviewStats());
    }

    @GetMapping("/stats/recent-assignments")
    public ResponseEntity<List<AssignmentSummaryDto>> getRecentAssignments(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getRecentAssignments(limit));
    }

    @GetMapping("/stats/recent-sessions")
    public ResponseEntity<List<SessionSummaryDto>> getRecentCompletedSessions(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getRecentCompletedSessions(limit));
    }

    @GetMapping("/stats/status-distribution")
    public ResponseEntity<StatusDistributionDto> getStatusDistribution() {
        return ResponseEntity.ok(dashboardService.getStatusDistribution());
    }

    @GetMapping("/stats/top-companies")
    public ResponseEntity<List<CompanyActivityDto>> getTopCompanies(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getTopCompanies(limit));
    }

    @GetMapping("/stats/theme-scores")
    public ResponseEntity<List<ThemeScoreDto>> getThemeAverageScores(
            @RequestParam(defaultValue = "6") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getThemeAverageScores(limit));
    }

    @GetMapping("/stats/hierarchy")
    public ResponseEntity<List<HierarchyNodeDto>> getHierarchy() {
        return ResponseEntity.ok(dashboardService.getCompanyHierarchy());
    }
}
