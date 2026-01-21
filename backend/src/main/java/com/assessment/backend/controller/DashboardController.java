package com.assessment.backend.controller;

import com.assessment.backend.dto.*;
import com.assessment.backend.service.DashboardService;
import com.assessment.backend.service.SessionAnalyticsService;
import com.assessment.backend.service.ThemeAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SessionAnalyticsService sessionAnalyticsService;
    private final ThemeAnalyticsService themeAnalyticsService;

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

    /**
     * Get completed sessions with maturity model information
     */
    @GetMapping("/stats/completed-with-maturity")
    public ResponseEntity<List<CompletedCatalogMaturityDto>> getCompletedSessionsWithMaturity(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getCompletedSessionsWithMaturity(limit));
    }

    // ==================== Session Analytics Endpoints ====================

    /**
     * Get list of completed sessions for analytics selection
     */
    @GetMapping("/analytics/completed-sessions")
    @PreAuthorize("hasAuthority('analytics.analyze')")
    public ResponseEntity<List<CompletedSessionOptionDto>> getCompletedSessionsForAnalytics() {
        return ResponseEntity.ok(sessionAnalyticsService.getCompletedSessions());
    }

    /**
     * Get time series data for selected sessions
     */
    @GetMapping("/analytics/session-timeseries")
    @PreAuthorize("hasAuthority('analytics.analyze')")
    public ResponseEntity<SessionTimeSeriesResponseDto> getSessionTimeSeries(
            @RequestParam List<UUID> sessionIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String timeBucket
    ) {
        return ResponseEntity.ok(sessionAnalyticsService.getSessionTimeSeries(
                sessionIds, startDate, endDate, timeBucket
        ));
    }

    /**
     * Get best and worst questions for selected sessions
     */
    @GetMapping("/analytics/question-extremes")
    @PreAuthorize("hasAuthority('analytics.analyze')")
    public ResponseEntity<List<SessionQuestionExtremesDto>> getQuestionExtremes(
            @RequestParam List<UUID> sessionIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "3") int limit
    ) {
        return ResponseEntity.ok(sessionAnalyticsService.getQuestionExtremes(
                sessionIds, startDate, endDate, limit
        ));
    }

    // ==================== Theme Analytics Endpoints ====================

    /**
     * Get list of themes that have completed sessions for analytics selection.
     * Returns themes with their total session count and average score.
     */
    @GetMapping("/analytics/themes")
    @PreAuthorize("hasAuthority('analytics.analyze')")
    public ResponseEntity<List<ThemeOptionDto>> getThemesForAnalytics() {
        return ResponseEntity.ok(themeAnalyticsService.getThemesWithCompletedSessions());
    }

    /**
     * Get time series data for selected themes.
     * Shows average scores per time bucket aggregated across all sessions of each theme.
     */
    @GetMapping("/analytics/theme-timeseries")
    @PreAuthorize("hasAuthority('analytics.analyze')")
    public ResponseEntity<ThemeTimeSeriesResponseDto> getThemeTimeSeries(
            @RequestParam List<UUID> themeIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String timeBucket
    ) {
        return ResponseEntity.ok(themeAnalyticsService.getThemeTimeSeries(
                themeIds, startDate, endDate, timeBucket
        ));
    }

    /**
     * Get best and worst questions for selected themes.
     * Questions are ranked by their average score across all sessions of each theme.
     */
    @GetMapping("/analytics/theme-question-extremes")
    @PreAuthorize("hasAuthority('analytics.analyze')")
    public ResponseEntity<List<ThemeQuestionExtremesDto>> getThemeQuestionExtremes(
            @RequestParam List<UUID> themeIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "3") int limit
    ) {
        return ResponseEntity.ok(themeAnalyticsService.getThemeQuestionExtremes(
                themeIds, startDate, endDate, limit
        ));
    }
}
