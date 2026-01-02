package com.assessment.backend.service;

import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.repository.CatalogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CatalogService {

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private AuditLogService auditLogService;

    // Create
    public Catalog createCatalog(Catalog catalog) {
        Catalog saved = catalogRepository.save(catalog);
        String details = String.format("Title: %s", saved.getTitle());
        auditLogService.log("CREATE", "catalog", saved.getId(), details, null);
        return saved;
    }

    // Read - All
    public List<Catalog> getAllCatalogs() {
        return catalogRepository.findAll();
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
