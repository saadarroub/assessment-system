package com.assessment.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO für GET-Requests (Company-Daten an Frontend senden)
 * Enthält alle Felder inklusive Status und Adresse
 */
public class CompanyResponseDTO {
    
    private UUID id;
    private String name;
    private String description;
    
    // Status Field
    private String status;
    
    // Adress-Felder (strukturiert)
    private String street;
    private String postalCode;
    private String city;
    private String country;
    
    // Kontakt-Felder
    private String website;
    private String phone;
    
    // Audit-Felder
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public CompanyResponseDTO() {
    }

    public CompanyResponseDTO(UUID id, String name, String description, String status,
                             String street, String postalCode, String city, String country,
                             String website, String phone, 
                             LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.street = street;
        this.postalCode = postalCode;
        this.city = city;
        this.country = country;
        this.website = website;
        this.phone = phone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
