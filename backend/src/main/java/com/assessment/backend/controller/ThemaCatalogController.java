package com.assessment.backend.controller;

import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.entity.ThemaCatalog;
import com.assessment.backend.service.ThemaCatalogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;


import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/thema-catalogs")
@CrossOrigin(origins = "*")
public class ThemaCatalogController {
    
    @Autowired
    private ThemaCatalogService themaCatalogService;

    // Create - POST /api/thema-catalogs
    @PostMapping
    @PreAuthorize("hasAuthority('catalogs.create')")
    public ResponseEntity<ThemaCatalog> addThemaToCatalog(@RequestBody Map<String, Object> request) {
        try {
            UUID themaId = UUID.fromString((String) request.get("themaId"));
            UUID catalogId = UUID.fromString((String) request.get("catalogId"));
            Integer orderIndex = (Integer) request.get("orderIndex");
            
            ThemaCatalog themaCatalog = themaCatalogService.addThemaToCatalog(themaId, catalogId, orderIndex);
            return new ResponseEntity<>(themaCatalog, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read All - GET /api/thema-catalogs
    @GetMapping
    public ResponseEntity<List<ThemaCatalog>> getAllThemaCatalogs() {
        try {
            List<ThemaCatalog> themaCatalogs = themaCatalogService.getAllThemaCatalogs();
            if (themaCatalogs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(themaCatalogs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Catalog ID - GET /api/thema-catalogs/catalog/{catalogId}
    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<List<ThemaCatalog>> getThemaCatalogsByCatalogId(@PathVariable("catalogId") UUID catalogId) {
        try {
            List<ThemaCatalog> themaCatalogs = themaCatalogService.getThemaCatalogsByCatalogId(catalogId);
            if (themaCatalogs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(themaCatalogs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Catalog ID Ordered - GET /api/thema-catalogs/catalog/{catalogId}/ordered
    @GetMapping("/catalog/{catalogId}/ordered")
    public ResponseEntity<List<ThemaCatalog>> getThemaCatalogsByCatalogIdOrdered(@PathVariable("catalogId") UUID catalogId) {
        try {
            List<ThemaCatalog> themaCatalogs = themaCatalogService.getThemaCatalogsByCatalogIdOrdered(catalogId);
            if (themaCatalogs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(themaCatalogs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Thema ID - GET /api/thema-catalogs/thema/{themaId}
    @GetMapping("/thema/{themaId}")
    public ResponseEntity<List<ThemaCatalog>> getThemaCatalogsByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            List<ThemaCatalog> themaCatalogs = themaCatalogService.getThemaCatalogsByThemaId(themaId);
            if (themaCatalogs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(themaCatalogs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all Themas for a Catalog - GET /api/thema-catalogs/catalog/{catalogId}/themas
    @GetMapping("/catalog/{catalogId}/themas")
    public ResponseEntity<List<Thema>> getThemasByCatalogId(@PathVariable("catalogId") UUID catalogId) {
        try {
            List<Thema> themas = themaCatalogService.getThemasByCatalogId(catalogId);
            if (themas.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(themas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all Catalogs for a Thema - GET /api/thema-catalogs/thema/{themaId}/catalogs
    @GetMapping("/thema/{themaId}/catalogs")
    public ResponseEntity<List<Catalog>> getCatalogsByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            List<Catalog> catalogs = themaCatalogService.getCatalogsByThemaId(themaId);
            if (catalogs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(catalogs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update orderIndex - PUT /api/thema-catalogs/order
    @PutMapping("/order")
    public ResponseEntity<ThemaCatalog> updateOrderIndex(@RequestBody Map<String, Object> request) {
        try {
            UUID themaId = UUID.fromString((String) request.get("themaId"));
            UUID catalogId = UUID.fromString((String) request.get("catalogId"));
            Integer newOrderIndex = (Integer) request.get("orderIndex");
            
            ThemaCatalog updatedThemaCatalog = themaCatalogService.updateOrderIndex(themaId, catalogId, newOrderIndex);
            return new ResponseEntity<>(updatedThemaCatalog, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete - Remove Thema from Catalog - DELETE /api/thema-catalogs
    @DeleteMapping
    public ResponseEntity<HttpStatus> removeThemaFromCatalog(@RequestBody Map<String, String> request) {
        try {
            UUID themaId = UUID.fromString(request.get("themaId"));
            UUID catalogId = UUID.fromString(request.get("catalogId"));
            
            themaCatalogService.removeThemaFromCatalog(themaId, catalogId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all Themas from Catalog - DELETE /api/thema-catalogs/catalog/{catalogId}
    @DeleteMapping("/catalog/{catalogId}")
    public ResponseEntity<HttpStatus> removeAllThemasFromCatalog(@PathVariable("catalogId") UUID catalogId) {
        try {
            themaCatalogService.removeAllThemasFromCatalog(catalogId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete Thema from all Catalogs - DELETE /api/thema-catalogs/thema/{themaId}
    @DeleteMapping("/thema/{themaId}")
    public ResponseEntity<HttpStatus> removeThemaFromAllCatalogs(@PathVariable("themaId") UUID themaId) {
        try {
            themaCatalogService.removeThemaFromAllCatalogs(themaId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check if exists - GET /api/thema-catalogs/exists
    @GetMapping("/exists")
    public ResponseEntity<Boolean> existsThemaInCatalog(@RequestParam("themaId") UUID themaId, 
                                                         @RequestParam("catalogId") UUID catalogId) {
        try {
            boolean exists = themaCatalogService.existsThemaInCatalog(themaId, catalogId);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count Themas in Catalog - GET /api/thema-catalogs/catalog/{catalogId}/count
    @GetMapping("/catalog/{catalogId}/count")
    public ResponseEntity<Long> countThemasInCatalog(@PathVariable("catalogId") UUID catalogId) {
        try {
            long count = themaCatalogService.countThemasInCatalog(catalogId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count Catalogs with Thema - GET /api/thema-catalogs/thema/{themaId}/count
    @GetMapping("/thema/{themaId}/count")
    public ResponseEntity<Long> countCatalogsWithThema(@PathVariable("themaId") UUID themaId) {
        try {
            long count = themaCatalogService.countCatalogsWithThema(themaId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
