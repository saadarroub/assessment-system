package com.assessment.backend.service;

import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.entity.ThemaCatalog;
import com.assessment.backend.repository.CatalogRepository;
import com.assessment.backend.repository.ThemaCatalogRepository;
import com.assessment.backend.repository.ThemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ThemaCatalogService {
    
    @Autowired
    private ThemaCatalogRepository themaCatalogRepository;
    
    @Autowired
    private ThemaRepository themaRepository;
    
    @Autowired
    private CatalogRepository catalogRepository;

    // Create - Add Thema to Catalog
    @Transactional
    public ThemaCatalog addThemaToCatalog(UUID themaId, UUID catalogId, Integer orderIndex) {
        Thema thema = themaRepository.findById(themaId)
                .orElseThrow(() -> new RuntimeException("Thema not found with id: " + themaId));
        
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + catalogId));
        
        ThemaCatalog themaCatalog = new ThemaCatalog(thema, catalog, orderIndex);
        return themaCatalogRepository.save(themaCatalog);
    }

    // Read - Get all ThemaCatalogs
    public List<ThemaCatalog> getAllThemaCatalogs() {
        return themaCatalogRepository.findAll();
    }

    // Read - Get ThemaCatalogs by Catalog ID
    public List<ThemaCatalog> getThemaCatalogsByCatalogId(UUID catalogId) {
        return themaCatalogRepository.findByCatalogId(catalogId);
    }

    // Read - Get ThemaCatalogs by Catalog ID ordered by orderIndex
    public List<ThemaCatalog> getThemaCatalogsByCatalogIdOrdered(UUID catalogId) {
        return themaCatalogRepository.findByCatalogIdOrderByOrderIndexAsc(catalogId);
    }

    // Read - Get ThemaCatalogs by Thema ID
    public List<ThemaCatalog> getThemaCatalogsByThemaId(UUID themaId) {
        return themaCatalogRepository.findByThemaId(themaId);
    }

    // Read - Get all Themas for a Catalog (ordered by orderIndex)
    public List<Thema> getThemasByCatalogId(UUID catalogId) {
        return themaCatalogRepository.findThemasByCatalogId(catalogId);
    }

    // Read - Get all Catalogs for a Thema
    public List<Catalog> getCatalogsByThemaId(UUID themaId) {
        return themaCatalogRepository.findCatalogsByThemaId(themaId);
    }

    // Update - Update orderIndex
    @Transactional
    public ThemaCatalog updateOrderIndex(UUID themaId, UUID catalogId, Integer newOrderIndex) {
        List<ThemaCatalog> themaCatalogs = themaCatalogRepository.findByCatalogId(catalogId);
        
        ThemaCatalog themaCatalog = themaCatalogs.stream()
                .filter(tc -> tc.getThema().getId().equals(themaId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("ThemaCatalog relationship not found"));
        
        themaCatalog.setOrderIndex(newOrderIndex);
        return themaCatalogRepository.save(themaCatalog);
    }

    // Delete - Remove Thema from Catalog
    @Transactional
    public void removeThemaFromCatalog(UUID themaId, UUID catalogId) {
        if (!themaCatalogRepository.existsByThemaIdAndCatalogId(themaId, catalogId)) {
            throw new RuntimeException("ThemaCatalog relationship not found");
        }
        themaCatalogRepository.deleteByThemaIdAndCatalogId(themaId, catalogId);
    }

    // Delete - Remove all Themas from a Catalog
    @Transactional
    public void removeAllThemasFromCatalog(UUID catalogId) {
        themaCatalogRepository.deleteByCatalogId(catalogId);
    }

    // Delete - Remove Thema from all Catalogs
    @Transactional
    public void removeThemaFromAllCatalogs(UUID themaId) {
        themaCatalogRepository.deleteByThemaId(themaId);
    }

    // Check if Thema exists in Catalog
    public boolean existsThemaInCatalog(UUID themaId, UUID catalogId) {
        return themaCatalogRepository.existsByThemaIdAndCatalogId(themaId, catalogId);
    }

    // Count Themas in a Catalog
    public long countThemasInCatalog(UUID catalogId) {
        return themaCatalogRepository.countByCatalogId(catalogId);
    }

    // Count Catalogs containing a Thema
    public long countCatalogsWithThema(UUID themaId) {
        return themaCatalogRepository.countByThemaId(themaId);
    }
}
