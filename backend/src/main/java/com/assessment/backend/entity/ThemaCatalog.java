package com.assessment.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "thema_catalog")
@IdClass(ThemaCatalog.ThemaCatalogId.class)
public class ThemaCatalog implements Serializable {

    @Id
    @ManyToOne
    @JoinColumn(name = "thema_id", nullable = false)
    private Thema thema;

    @Id
    @ManyToOne
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // Constructors
    public ThemaCatalog() {
    }

    public ThemaCatalog(Thema thema, Catalog catalog, Integer orderIndex) {
        this.thema = thema;
        this.catalog = catalog;
        this.orderIndex = orderIndex;
    }

    // Getters and Setters
    public Thema getThema() {
        return thema;
    }

    public void setThema(Thema thema) {
        this.thema = thema;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    // Inner IdClass
    public static class ThemaCatalogId implements Serializable {
        private UUID thema;
        private UUID catalog;

        public ThemaCatalogId() {
        }

        public ThemaCatalogId(UUID thema, UUID catalog) {
            this.thema = thema;
            this.catalog = catalog;
        }

        public UUID getThema() {
            return thema;
        }

        public void setThema(UUID thema) {
            this.thema = thema;
        }

        public UUID getCatalog() {
            return catalog;
        }

        public void setCatalog(UUID catalog) {
            this.catalog = catalog;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ThemaCatalogId that = (ThemaCatalogId) o;
            return Objects.equals(thema, that.thema) && 
                   Objects.equals(catalog, that.catalog);
        }

        @Override
        public int hashCode() {
            return Objects.hash(thema, catalog);
        }
    }
}