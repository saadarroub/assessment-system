package com.assessment.backend.controller;

import com.assessment.backend.dto.CatalogScoreDTO;
import com.assessment.backend.dto.OverallScoreDTO;
import com.assessment.backend.dto.ThemaScoreDTO;
import com.assessment.backend.service.ScoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Controller für Score-Abfrage im Admin Panel (Firmen-basiert)
 * Alle Endpunkte sind nur für Admins zugänglich
 * Scores werden als Prozentsatz (0-100%) zurückgegeben
 * Nur completed Sessions werden berücksichtigt
 */
@RestController
@RequestMapping("/api/scoring")
@CrossOrigin(origins = "*")
public class ScoringController {

    @Autowired
    private ScoringService scoringService;

    /**
     * GET /api/scoring/company/{companyId}/overall
     * Gesamtübersicht aller Scores für eine Firma
     * 
     * Response:
     * {
     *   "companyId": "uuid",
     *   "companyName": "Example GmbH",
     *   "averagePercentageScore": 75.5,
     *   "totalCompletedSessions": 150,
     *   "totalSessions": 200,
     *   "totalWorkers": 50,
     *   "totalCatalogs": 5,
     *   "catalogScores": [...]
     * }
     */
    @GetMapping("/company/{companyId}/overall")
    @PreAuthorize("hasAuthority('ADMIN_PANEL_ADMIN')")
    public ResponseEntity<?> getCompanyOverallScore(@PathVariable("companyId") String companyId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            OverallScoreDTO dto = scoringService.getCompanyOverallScore(companyUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Company not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid company ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/company/{companyId}/catalog/{catalogId}
     * Score für einen Catalog einer Firma (ohne Worker-Liste)
     * 
     * Response:
     * {
     *   "catalogId": "uuid",
     *   "catalogTitle": "Java Basics",
     *   "totalScore": 450.5,
     *   "maxPossibleScore": 600.0,
     *   "percentageScore": 75.08,
     *   "completedSessions": 30,
     *   "totalSessions": 40,
     *   "themaScores": [...],
     *   "workerScores": []
     * }
     */
    @GetMapping("/company/{companyId}/catalog/{catalogId}")
    @PreAuthorize("hasAuthority('ADMIN_PANEL_ADMIN')")
    public ResponseEntity<?> getCompanyCatalogScore(
            @PathVariable("companyId") String companyId,
            @PathVariable("catalogId") String catalogId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            UUID catalogUuid = UUID.fromString(catalogId);
            
            CatalogScoreDTO dto = scoringService.getCompanyCatalogScore(companyUuid, catalogUuid, false);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Catalog not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/company/{companyId}/catalog/{catalogId}/workers
     * Score für einen Catalog einer Firma (mit Worker-Liste)
     * 
     * Response:
     * {
     *   "catalogId": "uuid",
     *   "catalogTitle": "Java Basics",
     *   "totalScore": 450.5,
     *   "maxPossibleScore": 600.0,
     *   "percentageScore": 75.08,
     *   "completedSessions": 30,
     *   "totalSessions": 40,
     *   "themaScores": [...],
     *   "workerScores": [
     *     {
     *       "workerId": "uuid",
     *       "workerName": "Max Mustermann",
     *       "workerEmail": "max@example.com",
     *       "percentageScore": 88.5,
     *       "completedThemas": 3,
     *       "totalThemas": 3,
     *       "status": "completed"
     *     }
     *   ]
     * }
     */
    @GetMapping("/company/{companyId}/catalog/{catalogId}/workers")
    @PreAuthorize("hasAuthority('ADMIN_PANEL_ADMIN')")
    public ResponseEntity<?> getCompanyCatalogScoreWithWorkers(
            @PathVariable("companyId") String companyId,
            @PathVariable("catalogId") String catalogId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            UUID catalogUuid = UUID.fromString(catalogId);
            
            CatalogScoreDTO dto = scoringService.getCompanyCatalogScore(companyUuid, catalogUuid, true);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Catalog not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/company/{companyId}/thema/{themaId}
     * Score für ein Thema einer Firma
     * 
     * Response:
     * {
     *   "themaId": "uuid",
     *   "themaName": "OOP Concepts",
     *   "totalScore": 280.5,
     *   "maxPossibleScore": 400.0,
     *   "percentageScore": 70.13,
     *   "completedSessions": 15,
     *   "totalSessions": 20
     * }
     */
    @GetMapping("/company/{companyId}/thema/{themaId}")
    @PreAuthorize("hasAuthority('ADMIN_PANEL_ADMIN')")
    public ResponseEntity<?> getCompanyThemaScore(
            @PathVariable("companyId") String companyId,
            @PathVariable("themaId") String themaId) {
        try {
            UUID companyUuid = UUID.fromString(companyId);
            UUID themaUuid = UUID.fromString(themaId);
            
            ThemaScoreDTO dto = scoringService.getCompanyThemaScore(companyUuid, themaUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Thema not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/worker/{workerId}/thema/{themaId}
     * Score für einen Worker in einem Thema
     * 
     * Response:
     * {
     *   "themaId": "uuid",
     *   "themaName": "OOP Concepts",
     *   "totalScore": 35.5,
     *   "maxPossibleScore": 40.0,
     *   "percentageScore": 88.75,
     *   "completedSessions": 1,
     *   "totalSessions": 2
     * }
     */
    @GetMapping("/worker/{workerId}/thema/{themaId}")
    @PreAuthorize("hasAuthority('ADMIN_PANEL_ADMIN')")
    public ResponseEntity<?> getWorkerThemaScore(
            @PathVariable("workerId") String workerId,
            @PathVariable("themaId") String themaId) {
        try {
            UUID workerUuid = UUID.fromString(workerId);
            UUID themaUuid = UUID.fromString(themaId);
            
            ThemaScoreDTO dto = scoringService.getWorkerThemaScore(workerUuid, themaUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Thema not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/scoring/worker/{workerId}/catalog/{catalogId}
     * Score für einen Worker in einem Catalog
     * 
     * Response:
     * {
     *   "catalogId": "uuid",
     *   "catalogTitle": "Java Basics",
     *   "totalScore": 115.5,
     *   "maxPossibleScore": 120.0,
     *   "percentageScore": 96.25,
     *   "completedSessions": 3,
     *   "totalSessions": 3,
     *   "themaScores": [...],
     *   "workerScores": []
     * }
     */
    @GetMapping("/worker/{workerId}/catalog/{catalogId}")
    @PreAuthorize("hasAuthority('ADMIN_PANEL_ADMIN')")
    public ResponseEntity<?> getWorkerCatalogScore(
            @PathVariable("workerId") String workerId,
            @PathVariable("catalogId") String catalogId) {
        try {
            UUID workerUuid = UUID.fromString(workerId);
            UUID catalogUuid = UUID.fromString(catalogId);
            
            CatalogScoreDTO dto = scoringService.getWorkerCatalogScore(workerUuid, catalogUuid);
            
            if (dto == null) {
                return new ResponseEntity<>(
                    Map.of("error", "Catalog not found"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid ID format"), 
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
