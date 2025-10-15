package com.assessment.backend.service;

import com.assessment.backend.entity.Catalog;
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

    // Create
    public Catalog createCatalog(Catalog catalog) {
        return catalogRepository.save(catalog);
    }

    // Read - All
    public List<Catalog> getAllCatalogs() {
        return catalogRepository.findAll();
    }

    // Read - By ID
    public Optional<Catalog> getCatalogById(UUID id) {
        return catalogRepository.findById(id);
    }

    // Update
    public Catalog updateCatalog(UUID id, Catalog catalogDetails) {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + id));
        
        catalog.setTitle(catalogDetails.getTitle());
        catalog.setDescription(catalogDetails.getDescription());
        
        return catalogRepository.save(catalog);
    }

    // Delete
    public void deleteCatalog(UUID id) {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + id));
        
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
