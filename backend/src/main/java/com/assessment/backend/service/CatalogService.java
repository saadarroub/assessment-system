package com.assessment.backend.service;

import com.assessment.backend.dto.CatalogResponseDTO;
import com.assessment.backend.dto.CreateCatalogDTO;
import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.ReifegradModel;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.repository.CatalogRepository;
import com.assessment.backend.repository.ReifegradModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CatalogService {

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private ReifegradModelRepository reifegradModelRepository;

    @Autowired
    private AuditLogService auditLogService;

    // Create (Legacy - ohne Reifegradmodell)
    public Catalog createCatalog(Catalog catalog) {
        Catalog saved = catalogRepository.save(catalog);
        String details = String.format("Title: %s", saved.getTitle());
        auditLogService.log("CREATE", "catalog", saved.getId(), details, null);
        return saved;
    }

    /**
     * Neuer Katalog mit optionalem Reifegradmodell erstellen
     */
    @Transactional
    public CatalogResponseDTO createCatalogWithModel(CreateCatalogDTO dto) {
        Catalog catalog = new Catalog();
        catalog.setTitle(dto.getTitle());
        catalog.setDescription(dto.getDescription() != null ? dto.getDescription() : "");

        // Reifegradmodell verknüpfen, falls ID angegeben
        if (dto.getReifegradModelId() != null) {
            ReifegradModel model = reifegradModelRepository.findById(dto.getReifegradModelId())
                    .orElseThrow(() -> new RuntimeException("ReifegradModel not found: " + dto.getReifegradModelId()));
            catalog.setReifegradModel(model);
        }

        Catalog saved = catalogRepository.save(catalog);
        String details = String.format("Title: %s", saved.getTitle());
        auditLogService.log("CREATE", "catalog", saved.getId(), details, null);

        return toResponseDTO(saved);
    }

    /**
     * Reifegradmodell für einen bestehenden Katalog setzen oder entfernen
     */
    @Transactional
    public CatalogResponseDTO setReifegradModel(UUID catalogId, UUID reifegradModelId) {
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new RuntimeException("Catalog not found: " + catalogId));

        if (reifegradModelId != null) {
            ReifegradModel model = reifegradModelRepository.findById(reifegradModelId)
                    .orElseThrow(() -> new RuntimeException("ReifegradModel not found: " + reifegradModelId));
            catalog.setReifegradModel(model);
        } else {
            catalog.setReifegradModel(null);
        }

        Catalog saved = catalogRepository.save(catalog);
        auditLogService.log("UPDATE", "catalog", saved.getId(), 
                "ReifegradModel changed: " + (reifegradModelId != null ? reifegradModelId : "removed"), null);

        return toResponseDTO(saved);
    }

    /**
     * Catalog in Response-DTO umwandeln (mit Reifegradmodel-Info)
     */
    public CatalogResponseDTO toResponseDTO(Catalog catalog) {
        CatalogResponseDTO dto = new CatalogResponseDTO();
        dto.setId(catalog.getId());
        dto.setTitle(catalog.getTitle());
        dto.setDescription(catalog.getDescription());
        dto.setStatus(catalog.getStatus());
        dto.setCreatedAt(catalog.getCreatedAt());
        dto.setUpdatedAt(catalog.getUpdatedAt());

        ReifegradModel model = catalog.getReifegradModel();
        if (model != null) {
            dto.setReifegradModelId(model.getId());
            dto.setReifegradModelName(model.getName());
        }

        return dto;
    }

    // Read - All
    public List<Catalog> getAllCatalogs() {
        return catalogRepository.findAll();
    }

    /**
     * Alle Kataloge als DTOs mit Reifegradmodel-Info
     */
    @Transactional(readOnly = true)
    public List<CatalogResponseDTO> getAllCatalogsAsDTO() {
        return catalogRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Read - By ID
    public Optional<Catalog> getCatalogById(UUID id) {
        return catalogRepository.findById(id);
    }

    // Read - By the Active Status
    public List<Catalog> getActiveStatus() { return catalogRepository.findByStatus("active");}

    // Read - By the Inactive Status
    public List<Catalog> getInactiveStatus() { return catalogRepository.findByStatus("inactive");}

    // Update
    public Catalog updateCatalog(UUID id, Catalog catalogDetails) {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + id));
        
        catalog.setTitle(catalogDetails.getTitle());
        catalog.setDescription(catalogDetails.getDescription());
        
        Catalog updated = catalogRepository.save(catalog);
        String details = String.format("Title: %s", updated.getTitle());
        auditLogService.log("UPDATE", "catalog", updated.getId(), details, null);
        return updated;
    }

    //Update
  public Catalog changeStatus(UUID id) {
    Catalog catalog = catalogRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + id));

    String currentStatus = catalog.getStatus();

    if(currentStatus.equals("active")){

      catalog.setStatus("inactive");

    }else{

      catalog.setStatus("active");

    }

    return catalogRepository.save(catalog);

  }

  //Update
  public List<Catalog> deactivateAll(){

    List<Catalog>catalogs = catalogRepository.findByStatus("active");

    for(Catalog c : catalogs){

      c.setStatus("inactive");

    }

    return catalogRepository.saveAll(catalogs);

  }

    // Delete
    public void deleteCatalog(UUID id) {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + id));
        
        String details = String.format("Deleted catalog: %s", catalog.getTitle());
        auditLogService.log("DELETE", "catalog", id, details, null);
        catalogRepository.delete(catalog);
    }

    // Check if exists
    public boolean existsById(UUID id) {
        return catalogRepository.existsById(id);
    }

    // Count
    public long count() {
        return catalogRepository.count();
    }
}
