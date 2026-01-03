package com.assessment.backend.controller;

import com.assessment.backend.dto.CatalogResponseDTO;
import com.assessment.backend.dto.CreateCatalogDTO;
import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;

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

    // Create - POST /api/catalogs (Legacy)
    @PostMapping
    @PreAuthorize("hasAuthority('catalogs.create')")
    public ResponseEntity<Catalog> createCatalog(@RequestBody Catalog catalog) {
        try {
            Catalog createdCatalog = catalogService.createCatalog(catalog);
            return new ResponseEntity<>(createdCatalog, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Neuer Katalog mit optionalem Reifegradmodell erstellen (DTO-basiert)
     */
    @PostMapping("/with-model")
    @PreAuthorize("hasAuthority('catalogs.create')")
    public ResponseEntity<CatalogResponseDTO> createCatalogWithModel(@Valid @RequestBody CreateCatalogDTO dto) {
        try {
            CatalogResponseDTO created = catalogService.createCatalogWithModel(dto);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reifegradmodell für einen Katalog setzen oder entfernen
     */
    @PatchMapping("/{id}/reifegrad-model")
    @PreAuthorize("hasAuthority('catalogs.edit')")
    public ResponseEntity<CatalogResponseDTO> setReifegradModel(
            @PathVariable("id") UUID id,
            @RequestParam(required = false) UUID reifegradModelId) {
        try {
            CatalogResponseDTO updated = catalogService.setReifegradModel(id, reifegradModelId);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
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

    /**
     * Alle Kataloge als DTOs mit Reifegradmodell-Info
     */
    @GetMapping("/with-models")
    public ResponseEntity<List<CatalogResponseDTO>> getAllCatalogsWithModels() {
        try {
            List<CatalogResponseDTO> catalogs = catalogService.getAllCatalogsAsDTO();
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

    //Read By the Active Status
    @GetMapping("/status/active")
    public ResponseEntity<List<Catalog>> getCatalogsByActiveStatus() {
      try {
        List<Catalog> catalogs = catalogService.getActiveStatus();
        if (catalogs.isEmpty()) {
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(catalogs, HttpStatus.OK);
      } catch (Exception e) {
        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    //Read By the Inactive Status
    @GetMapping("/status/inactive")
    public ResponseEntity<List<Catalog>> getCatalogsByInactiveStatus() {
      try {
        List<Catalog> catalogs = catalogService.getInactiveStatus();
        if (catalogs.isEmpty()) {
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(catalogs, HttpStatus.OK);
      } catch (Exception e) {
        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    // Update - PUT /api/catalogs/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogs.edit')")
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

  //Change the current Status
  @PatchMapping("/status/change/{id}")
  @PreAuthorize("hasAuthority('catalogs.change')")
  public ResponseEntity<Catalog> changeStatusById(@PathVariable("id") UUID id) {
    try {
      Catalog changedStatus = catalogService.changeStatus(id);
      return new ResponseEntity<>(changedStatus, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  //Deactivate All
  @PatchMapping("/status/deactivate")
  @PreAuthorize("hasAuthority('catalogs.change')")
  public ResponseEntity<List<Catalog>> deactivateAll(){
    try{
      List<Catalog> deactivatedCatalogs = catalogService.deactivateAll();
      return new ResponseEntity<>(deactivatedCatalogs, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    // Delete - DELETE /api/catalogs/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogs.delete')")
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
    @PreAuthorize("hasAuthority('catalogs.delete')")
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