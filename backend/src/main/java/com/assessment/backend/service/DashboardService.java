package com.assessment.backend.service;

import com.assessment.backend.dto.AssignmentSummaryDto;
import com.assessment.backend.dto.CompanyActivityDto;
import com.assessment.backend.dto.DashboardStatsDto;
import com.assessment.backend.dto.HierarchyNodeDto;
import com.assessment.backend.dto.SessionSummaryDto;
import com.assessment.backend.dto.StatusDistributionDto;
import com.assessment.backend.dto.ThemeScoreDto;
import com.assessment.backend.entity.AssessmentSession;
import com.assessment.backend.entity.WorkerCatalog;
import com.assessment.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CompanyRepository companyRepository;
    private final CatalogRepository catalogRepository;
    private final ThemaRepository themaRepository;
    private final WorkerRepository workerRepository;
    private final WorkerCatalogRepository workerCatalogRepository;
    private final AssessmentSessionRepository assessmentSessionRepository;

    public DashboardStatsDto getOverviewStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        stats.setTotalCompanies(companyRepository.count());
        stats.setTotalCatalogs(catalogRepository.count());
        stats.setTotalThemes(themaRepository.count());
        stats.setTotalWorkers(workerRepository.count());
        stats.setTotalAssignments(workerCatalogRepository.count());
        stats.setActiveAssignments(workerCatalogRepository.countActiveAssignments());
        stats.setCompletedAssignments(workerCatalogRepository.countByStatus("completed"));
        stats.setTotalSessions(assessmentSessionRepository.count());
        stats.setCompletedSessions(assessmentSessionRepository.countByStatus("completed"));
        
        return stats;
    }

    public List<AssignmentSummaryDto> getRecentAssignments(int limit) {
        List<WorkerCatalog> assignments = workerCatalogRepository.findTop10ByOrderByAssignedAtDesc();
        
        return assignments.stream()
                .limit(limit)
                .map(this::convertToAssignmentSummary)
                .collect(Collectors.toList());
    }

    public List<SessionSummaryDto> getRecentCompletedSessions(int limit) {
        List<AssessmentSession> sessions = assessmentSessionRepository
                .findByStatusOrderByCompletedAtDesc("completed", PageRequest.of(0, limit));
        
        return sessions.stream()
                .map(this::convertToSessionSummary)
                .collect(Collectors.toList());
    }

    public StatusDistributionDto getStatusDistribution() {
        StatusDistributionDto distribution = new StatusDistributionDto();
        
        // Assignment status distribution
        Map<String, Long> assignmentsByStatus = new HashMap<>();
        assignmentsByStatus.put("assigned", workerCatalogRepository.countByStatus("assigned"));
        assignmentsByStatus.put("in_progress", workerCatalogRepository.countByStatus("in_progress"));
        assignmentsByStatus.put("completed", workerCatalogRepository.countByStatus("completed"));
        assignmentsByStatus.put("expired", workerCatalogRepository.countByStatus("expired"));
        distribution.setAssignmentsByStatus(assignmentsByStatus);
        
        // Session status distribution
        Map<String, Long> sessionsByStatus = new HashMap<>();
        sessionsByStatus.put("started", assessmentSessionRepository.countByStatus("started"));
        sessionsByStatus.put("in_progress", assessmentSessionRepository.countByStatus("in_progress"));
        sessionsByStatus.put("completed", assessmentSessionRepository.countByStatus("completed"));
        sessionsByStatus.put("cancelled", assessmentSessionRepository.countByStatus("cancelled"));
        distribution.setSessionsByStatus(sessionsByStatus);
        
        return distribution;
    }

    public List<CompanyActivityDto> getTopCompanies(int limit) {
        List<Object[]> results = workerCatalogRepository.findTopCompaniesByAssignmentCount(PageRequest.of(0, limit));
        
        return results.stream()
                .map(result -> {
                    String companyName = (String) result[0];
                    Long count = (Long) result[1];
                    return new CompanyActivityDto(companyName, count);
                })
                .collect(Collectors.toList());
    }

    public List<ThemeScoreDto> getThemeAverageScores(int limit) {
        List<Object[]> results = assessmentSessionRepository.findAverageScoresByTheme(PageRequest.of(0, limit));
        
        return results.stream()
                .map(result -> {
                    String themeName = (String) result[0];
                    Double avgScore = (Double) result[1];
                    return new ThemeScoreDto(themeName, avgScore);
                })
                .collect(Collectors.toList());
    }

    public List<HierarchyNodeDto> getCompanyHierarchy() {
        List<Object[]> results = workerCatalogRepository.findCompanyHierarchy();
        
        Map<String, HierarchyNodeDto> companyMap = new HashMap<>();
        
        for (Object[] row : results) {
            String companyName = (String) row[0];
            String catalogTitle = (String) row[1];
            Long assignmentCount = (Long) row[2];
            
            // Get or create company node
            HierarchyNodeDto companyNode = companyMap.computeIfAbsent(companyName, name -> {
                HierarchyNodeDto node = new HierarchyNodeDto();
                node.setName(name);
                node.setChildren(new ArrayList<>());
                node.setSize(0L);
                return node;
            });
            
            // Add catalog as child
            HierarchyNodeDto catalogNode = new HierarchyNodeDto(catalogTitle, assignmentCount);
            companyNode.getChildren().add(catalogNode);
            companyNode.setSize(companyNode.getSize() + assignmentCount);
        }
        
        return new ArrayList<>(companyMap.values());
    }

    private AssignmentSummaryDto convertToAssignmentSummary(WorkerCatalog wc) {
        AssignmentSummaryDto dto = new AssignmentSummaryDto();
        dto.setId(wc.getId());
        dto.setWorkerName(wc.getWorker().getName());
        dto.setWorkerEmail(wc.getWorker().getEmail());
        dto.setCatalogTitle(wc.getCatalog().getTitle());
        dto.setCompanyName(wc.getCompany().getName());
        dto.setStatus(wc.getStatus());
        dto.setAssignedAt(wc.getAssignedAt());
        dto.setCompletedAt(wc.getCompletedAt());
        return dto;
    }

    private SessionSummaryDto convertToSessionSummary(AssessmentSession session) {
        SessionSummaryDto dto = new SessionSummaryDto();
        dto.setId(session.getId());
        
        // Fetch related entities with fallback
        workerRepository.findById(session.getWorkerId()).ifPresentOrElse(
            worker -> dto.setWorkerName(worker.getName() != null ? worker.getName() : "Unbekannt"),
            () -> dto.setWorkerName("Unbekannt")
        );
        
        themaRepository.findById(session.getThemaId()).ifPresentOrElse(
            thema -> dto.setThemeName(thema.getName() != null ? thema.getName() : "Unbekannt"),
            () -> dto.setThemeName("Unbekannt")
        );
        
        companyRepository.findById(session.getCompanyId()).ifPresentOrElse(
            company -> dto.setCompanyName(company.getName() != null ? company.getName() : "Unbekannt"),
            () -> dto.setCompanyName("Unbekannt")
        );
        
        dto.setStatus(session.getStatus());
        dto.setTotalScore(session.getTotalScore());
        dto.setMaxPossibleScore(session.getMaxPossibleScore());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setCompletedAt(session.getCompletedAt());
        
        return dto;
    }
}
