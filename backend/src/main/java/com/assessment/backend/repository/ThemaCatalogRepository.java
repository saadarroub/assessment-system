package com.assessment.backend.repository;

import com.assessment.backend.entity.Catalog;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.entity.ThemaCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThemaCatalogRepository extends JpaRepository<ThemaCatalog, ThemaCatalog.ThemaCatalogId> {
    
    // Find all ThemaCatalogs by Catalog ID
    List<ThemaCatalog> findByCatalogId(UUID catalogId);
    
    // Find all ThemaCatalogs by Catalog ID ordered by orderIndex
    List<ThemaCatalog> findByCatalogIdOrderByOrderIndexAsc(UUID catalogId);
    
    // Find all ThemaCatalogs by Thema ID
    List<ThemaCatalog> findByThemaId(UUID themaId);
    
    // Find all Themas for a specific Catalog ordered by orderIndex
    @Query("SELECT tc.thema FROM ThemaCatalog tc WHERE tc.catalog.id = :catalogId ORDER BY tc.orderIndex ASC")
    List<Thema> findThemasByCatalogId(@Param("catalogId") UUID catalogId);
    
    // Find all Catalogs for a specific Thema
    @Query("SELECT tc.catalog FROM ThemaCatalog tc WHERE tc.thema.id = :themaId")
    List<Catalog> findCatalogsByThemaId(@Param("themaId") UUID themaId);
    
    // Check if a Thema exists in a Catalog
    boolean existsByThemaIdAndCatalogId(UUID themaId, UUID catalogId);
    
    // Delete by Catalog ID
    void deleteByCatalogId(UUID catalogId);
    
    // Delete by Thema ID
    void deleteByThemaId(UUID themaId);
    
    // Delete specific ThemaCatalog relationship
    void deleteByThemaIdAndCatalogId(UUID themaId, UUID catalogId);
    
    // Count Themas in a Catalog
    long countByCatalogId(UUID catalogId);
    
    // Count Catalogs containing a Thema
    long countByThemaId(UUID themaId);
}