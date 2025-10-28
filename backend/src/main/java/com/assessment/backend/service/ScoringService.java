package com.assessment.backend.service;

import com.assessment.backend.dto.CatalogScoreDTO;
import com.assessment.backend.dto.OverallScoreDTO;
import com.assessment.backend.dto.ThemaScoreDTO;
import com.assessment.backend.dto.WorkerCatalogScoreDTO;
import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Company;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.entity.Worker;
import com.assessment.backend.repository.CatalogRepository;
import com.assessment.backend.repository.CompanyRepository;
import com.assessment.backend.repository.ThemaRepository;
import com.assessment.backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service für Score-Berechnungen im Admin Panel (Firmen-basiert)
 * Alle Scores werden als Prozentsatz (0-100%) dargestellt
 * Nur completed Sessions werden berücksichtigt
 */
@Service
public class ScoringService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private ThemaRepository themaRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private WorkerRepository workerRepository;

    /**
     * Berechnet Gesamtübersicht für eine Firma (0-100%)
     * Zeigt nur completed Sessions
     */
    @Transactional(readOnly = true)
    public OverallScoreDTO getCompanyOverallScore(UUID companyId) {
        Company company = companyRepository.findById(companyId).orElse(null);
        if (company == null) {
            return null;
        }

        // Alle Catalogs die dieser Firma zugewiesen sind (via worker_catalog)
        List<UUID> catalogIds = jdbcTemplate.query(
            """
            SELECT DISTINCT wc.catalog_id 
            FROM worker_catalog wc
            WHERE wc.company_id = ?
            """,
            (rs, rowNum) -> UUID.fromString(rs.getString("catalog_id")),
            companyId
        );

        if (catalogIds.isEmpty()) {
            return new OverallScoreDTO(
                companyId, company.getName(), 0.0, 0L, 0L, 0L, 0L, new ArrayList<>()
            );
        }

        List<CatalogScoreDTO> catalogScores = new ArrayList<>();
        double totalPercentage = 0.0;
        long overallCompletedSessions = 0;
        long overallTotalSessions = 0;
        int validCatalogCount = 0;

        for (UUID catalogId : catalogIds) {
            CatalogScoreDTO catalogScore = getCompanyCatalogScore(companyId, catalogId, false);
            if (catalogScore != null) {
                catalogScores.add(catalogScore);
                
                if (catalogScore.getCompletedSessions() > 0) {
                    totalPercentage += catalogScore.getPercentageScore();
                    validCatalogCount++;
                }
                
                overallCompletedSessions += catalogScore.getCompletedSessions();
                overallTotalSessions += catalogScore.getTotalSessions();
            }
        }

        // Durchschnitt berechnen (nur Catalogs mit completed Sessions)
        Double averagePercentage = validCatalogCount > 0 
            ? totalPercentage / validCatalogCount 
            : 0.0;

        // Total Workers dieser Firma
        Long totalWorkers = jdbcTemplate.queryForObject(
            "SELECT COUNT(DISTINCT id) FROM worker WHERE company_id = ?",
            Long.class, companyId
        );

        return new OverallScoreDTO(
            companyId,
            company.getName(),
            averagePercentage,
            overallCompletedSessions,
            overallTotalSessions,
            totalWorkers != null ? totalWorkers : 0L,
            (long) catalogIds.size(),
            catalogScores
        );
    }

    /**
     * Berechnet Score für einen Catalog einer Firma (0-100%)
     * Mit Worker-Liste und Thema-Details
     */
    @Transactional(readOnly = true)
    public CatalogScoreDTO getCompanyCatalogScore(UUID companyId, UUID catalogId, boolean includeWorkers) {
        Catalog catalog = catalogRepository.findById(catalogId).orElse(null);
        if (catalog == null) {
            return null;
        }

        // Alle Themas im Catalog
        List<UUID> themaIds = jdbcTemplate.query(
            "SELECT thema_id FROM thema_catalog WHERE catalog_id = ?",
            (rs, rowNum) -> UUID.fromString(rs.getString("thema_id")),
            catalogId
        );

        if (themaIds.isEmpty()) {
            return new CatalogScoreDTO(
                catalogId, catalog.getTitle(), BigDecimal.ZERO, BigDecimal.ZERO, 
                0.0, 0L, 0L, new ArrayList<>(), new ArrayList<>()
            );
        }

        // Scores pro Thema sammeln (nur completed Sessions dieser Firma)
        List<ThemaScoreDTO> themaScores = new ArrayList<>();
        BigDecimal catalogTotalScore = BigDecimal.ZERO;
        BigDecimal catalogMaxScore = BigDecimal.ZERO;
        long catalogCompletedSessions = 0;
        long catalogTotalSessions = 0;

        for (UUID themaId : themaIds) {
            ThemaScoreDTO themaScore = getCompanyThemaScore(companyId, themaId);
            if (themaScore != null) {
                themaScores.add(themaScore);
                catalogTotalScore = catalogTotalScore.add(themaScore.getTotalScore());
                catalogMaxScore = catalogMaxScore.add(themaScore.getMaxPossibleScore());
                catalogCompletedSessions += themaScore.getCompletedSessions();
                catalogTotalSessions += themaScore.getTotalSessions();
            }
        }

        // Prozentsatz berechnen
        Double percentage = 0.0;
        if (catalogMaxScore.compareTo(BigDecimal.ZERO) > 0) {
            percentage = catalogTotalScore.divide(catalogMaxScore, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }

        // Worker-Liste (wenn requested)
        List<WorkerCatalogScoreDTO> workerScores = new ArrayList<>();
        if (includeWorkers) {
            workerScores = getWorkersForCatalog(companyId, catalogId, themaIds);
        }

        return new CatalogScoreDTO(
            catalogId,
            catalog.getTitle(),
            catalogTotalScore,
            catalogMaxScore,
            percentage,
            catalogCompletedSessions,
            catalogTotalSessions,
            themaScores,
            workerScores
        );
    }

    /**
     * Holt alle Worker die an einem Catalog arbeiten
     */
    private List<WorkerCatalogScoreDTO> getWorkersForCatalog(UUID companyId, UUID catalogId, List<UUID> themaIds) {
        // Alle Worker die diesem Catalog zugewiesen sind
        List<UUID> workerIds = jdbcTemplate.query(
            """
            SELECT DISTINCT wc.worker_id
            FROM worker_catalog wc
            WHERE wc.company_id = ? AND wc.catalog_id = ?
            """,
            (rs, rowNum) -> UUID.fromString(rs.getString("worker_id")),
            companyId, catalogId
        );

        List<WorkerCatalogScoreDTO> workerScores = new ArrayList<>();
        
        for (UUID workerId : workerIds) {
            Worker worker = workerRepository.findById(workerId).orElse(null);
            if (worker == null) continue;

            // Completed Themas count
            long completedThemas = 0;
            for (UUID themaId : themaIds) {
                Long count = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*)
                    FROM assessment_session
                    WHERE worker_id = ? AND thema_id = ? AND status = 'completed'
                    """,
                    Long.class, workerId, themaId
                );
                if (count != null && count > 0) {
                    completedThemas++;
                }
            }

            // Total Themas
            long totalThemas = themaIds.size();

            // Score berechnen (Durchschnitt aller completed Themas)
            BigDecimal totalScore = BigDecimal.ZERO;
            BigDecimal maxScore = BigDecimal.ZERO;

            for (UUID themaId : themaIds) {
                List<Object[]> sessionData = jdbcTemplate.query(
                    """
                    SELECT total_score, max_possible_score
                    FROM assessment_session
                    WHERE worker_id = ? AND thema_id = ? AND status = 'completed'
                    ORDER BY total_score DESC
                    LIMIT 1
                    """,
                    (rs, rowNum) -> new Object[]{
                        rs.getBigDecimal("total_score"),
                        rs.getBigDecimal("max_possible_score")
                    },
                    workerId, themaId
                );

                if (!sessionData.isEmpty()) {
                    totalScore = totalScore.add((BigDecimal) sessionData.get(0)[0]);
                    maxScore = maxScore.add((BigDecimal) sessionData.get(0)[1]);
                }
            }

            Double percentageScore = 0.0;
            if (maxScore.compareTo(BigDecimal.ZERO) > 0) {
                percentageScore = totalScore.divide(maxScore, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            }

            // Status ermitteln
            String status = "assigned";
            if (completedThemas == totalThemas && totalThemas > 0) {
                status = "completed";
            } else if (completedThemas > 0) {
                status = "in_progress";
            }

            workerScores.add(new WorkerCatalogScoreDTO(
                workerId,
                worker.getName(),
                worker.getEmail(),
                percentageScore,
                completedThemas,
                totalThemas,
                status
            ));
        }

        return workerScores;
    }

    /**
     * Berechnet Score für ein Thema einer Firma (nur completed Sessions)
     */
    @Transactional(readOnly = true)
    public ThemaScoreDTO getCompanyThemaScore(UUID companyId, UUID themaId) {
        Thema thema = themaRepository.findById(themaId).orElse(null);
        if (thema == null) {
            return null;
        }

        // Alle completed Sessions dieser Firma für dieses Thema
        List<Object[]> results = jdbcTemplate.query(
            """
            SELECT 
                COALESCE(SUM(ass.total_score), 0) as total_score,
                COALESCE(SUM(ass.max_possible_score), 0) as max_possible_score,
                COUNT(*) as completed_count
            FROM assessment_session ass
            WHERE ass.thema_id = ? 
              AND ass.company_id = ? 
              AND ass.status = 'completed'
            """,
            (rs, rowNum) -> new Object[]{
                rs.getBigDecimal("total_score"),
                rs.getBigDecimal("max_possible_score"),
                rs.getLong("completed_count")
            },
            themaId, companyId
        );

        BigDecimal totalScore = (BigDecimal) results.get(0)[0];
        BigDecimal maxPossibleScore = (BigDecimal) results.get(0)[1];
        Long completedSessions = (Long) results.get(0)[2];

        // Total Sessions (alle Status dieser Firma)
        Long totalSessions = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) 
            FROM assessment_session 
            WHERE thema_id = ? AND company_id = ?
            """,
            Long.class, themaId, companyId
        );

        // Prozentsatz berechnen
        Double percentage = 0.0;
        if (maxPossibleScore != null && maxPossibleScore.compareTo(BigDecimal.ZERO) > 0) {
            percentage = totalScore.divide(maxPossibleScore, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }

        return new ThemaScoreDTO(
            themaId,
            thema.getName(),
            totalScore,
            maxPossibleScore,
            percentage,
            completedSessions,
            totalSessions != null ? totalSessions : 0L
        );
    }

    /**
     * Berechnet Score für einen Worker in einem bestimmten Thema
     */
    @Transactional(readOnly = true)
    public ThemaScoreDTO getWorkerThemaScore(UUID workerId, UUID themaId) {
        Thema thema = themaRepository.findById(themaId).orElse(null);
        if (thema == null) {
            return null;
        }

        // Beste completed Session des Workers für dieses Thema
        List<Object[]> results = jdbcTemplate.query(
            """
            SELECT 
                total_score,
                max_possible_score
            FROM assessment_session
            WHERE worker_id = ? AND thema_id = ? AND status = 'completed'
            ORDER BY total_score DESC
            LIMIT 1
            """,
            (rs, rowNum) -> new Object[]{
                rs.getBigDecimal("total_score"),
                rs.getBigDecimal("max_possible_score")
            },
            workerId, themaId
        );

        if (results.isEmpty()) {
            return new ThemaScoreDTO(
                themaId, thema.getName(), BigDecimal.ZERO, BigDecimal.ZERO, 0.0, 0L, 0L
            );
        }

        BigDecimal totalScore = (BigDecimal) results.get(0)[0];
        BigDecimal maxPossibleScore = (BigDecimal) results.get(0)[1];

        // Prozentsatz berechnen
        Double percentage = 0.0;
        if (maxPossibleScore != null && maxPossibleScore.compareTo(BigDecimal.ZERO) > 0) {
            percentage = totalScore.divide(maxPossibleScore, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }

        // Completed Sessions count
        Long completedSessions = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM assessment_session WHERE worker_id = ? AND thema_id = ? AND status = 'completed'",
            Long.class, workerId, themaId
        );

        // Total Sessions count
        Long totalSessions = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM assessment_session WHERE worker_id = ? AND thema_id = ?",
            Long.class, workerId, themaId
        );

        return new ThemaScoreDTO(
            themaId,
            thema.getName(),
            totalScore,
            maxPossibleScore,
            percentage,
            completedSessions != null ? completedSessions : 0L,
            totalSessions != null ? totalSessions : 0L
        );
    }

    /**
     * Berechnet Score für einen Worker in einem Catalog
     */
    @Transactional(readOnly = true)
    public CatalogScoreDTO getWorkerCatalogScore(UUID workerId, UUID catalogId) {
        Catalog catalog = catalogRepository.findById(catalogId).orElse(null);
        if (catalog == null) {
            return null;
        }

        // Alle Themas im Catalog
        List<UUID> themaIds = jdbcTemplate.query(
            "SELECT thema_id FROM thema_catalog WHERE catalog_id = ?",
            (rs, rowNum) -> UUID.fromString(rs.getString("thema_id")),
            catalogId
        );

        if (themaIds.isEmpty()) {
            return new CatalogScoreDTO(
                catalogId, catalog.getTitle(), BigDecimal.ZERO, BigDecimal.ZERO, 
                0.0, 0L, 0L, new ArrayList<>(), new ArrayList<>()
            );
        }

        List<ThemaScoreDTO> themaScores = new ArrayList<>();
        BigDecimal catalogTotalScore = BigDecimal.ZERO;
        BigDecimal catalogMaxScore = BigDecimal.ZERO;
        long catalogCompletedSessions = 0;
        long catalogTotalSessions = 0;

        for (UUID themaId : themaIds) {
            ThemaScoreDTO themaScore = getWorkerThemaScore(workerId, themaId);
            if (themaScore != null) {
                themaScores.add(themaScore);
                catalogTotalScore = catalogTotalScore.add(themaScore.getTotalScore());
                catalogMaxScore = catalogMaxScore.add(themaScore.getMaxPossibleScore());
                catalogCompletedSessions += themaScore.getCompletedSessions();
                catalogTotalSessions += themaScore.getTotalSessions();
            }
        }

        // Prozentsatz berechnen
        Double percentage = 0.0;
        if (catalogMaxScore.compareTo(BigDecimal.ZERO) > 0) {
            percentage = catalogTotalScore.divide(catalogMaxScore, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }

        return new CatalogScoreDTO(
            catalogId,
            catalog.getTitle(),
            catalogTotalScore,
            catalogMaxScore,
            percentage,
            catalogCompletedSessions,
            catalogTotalSessions,
            themaScores,
            new ArrayList<>() // Keine Worker-Liste bei einzelnem Worker
        );
    }
}
