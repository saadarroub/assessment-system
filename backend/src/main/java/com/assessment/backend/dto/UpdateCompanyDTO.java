package com.assessment.backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO für PUT-Requests (Company aktualisieren)
 * Frontend kann nur diese Felder ändern - keine ID, keine Timestamps
 * Status wird separat über eigenen Endpoint geändert
 */
public class UpdateCompanyDTO {
    
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    // Adress-Felder
    @Size(max = 255, message = "Street must not exceed 255 characters")
    private String street;
    
    @Pattern(regexp = "^\\d{5}$", message = "Postal code must be exactly 5 digits")
    private String postalCode;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    // Kontakt-Felder
    @Pattern(regexp = "^(https?://)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([/\\w \\.-]*)*/?$", 
             message = "Invalid website URL format")
    @Size(max = 255, message = "Website must not exceed 255 characters")
    private String website;
    
    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{7,20}$", 
             message = "Invalid phone number format")
    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;

    // Constructors
    public UpdateCompanyDTO() {
    }

    public UpdateCompanyDTO(String name, String description,
                           String street, String postalCode, String city, String country,
                           String website, String phone) {
        this.name = name;
        this.description = description;
        this.street = street;
        this.postalCode = postalCode;
        this.city = city;
        this.country = country;
        this.website = website;
        this.phone = phone;
    }

    // Getters and Setters
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
}
