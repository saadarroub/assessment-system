package com.assessment.backend.controller;

import com.assessment.backend.entity.Catalog;
import com.assessment.backend.service.CatalogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalogs")
@CrossOrigin(origins = "*")
public class CatalogController {

    @Autowired
    private CatalogService catalogService;

    // Create - POST /api/catalogs
    @PostMapping
    public ResponseEntity<Catalog> createCatalog(@RequestBody Catalog catalog) {
        try {
            Catalog createdCatalog = catalogService.createCatalog(catalog);
            return new ResponseEntity<>(createdCatalog, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read All - GET /api/catalogs
    @GetMapping
    public ResponseEntity<List<Catalog>> getAllCatalogs() {
        try {
            List<Catalog> catalogs = catalogService.getAllCatalogs();
            if (catalogs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(catalogs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By ID - GET /api/catalogs/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Catalog> getCatalogById(@PathVariable("id") UUID id) {
        try {
            Optional<Catalog> catalog = catalogService.getCatalogById(id);
            return catalog.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update - PUT /api/catalogs/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Catalog> updateCatalog(@PathVariable("id") UUID id, @RequestBody Catalog catalog) {
        try {
            Catalog updatedCatalog = catalogService.updateCatalog(id, catalog);
            return new ResponseEntity<>(updatedCatalog, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete - DELETE /api/catalogs/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCatalog(@PathVariable("id") UUID id) {
        try {
            catalogService.deleteCatalog(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete All - DELETE /api/catalogs
    @DeleteMapping
    public ResponseEntity<HttpStatus> deleteAllCatalogs() {
        try {
            catalogService.getAllCatalogs().forEach(catalog -> catalogService.deleteCatalog(catalog.getId()));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count - GET /api/catalogs/count
    @GetMapping("/count")
    public ResponseEntity<Long> countCatalogs() {
        try {
            long count = catalogService.count();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check Exists - GET /api/catalogs/exists/{id}
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> catalogExists(@PathVariable("id") UUID id) {
        try {
            boolean exists = catalogService.existsById(id);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}