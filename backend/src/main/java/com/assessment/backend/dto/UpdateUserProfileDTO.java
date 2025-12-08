package com.assessment.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for updating user profile information (name, email, phone, address).
 * Password changes are handled separately via ChangePasswordDTO.
 * Requires current password for verification.
 */
public class UpdateUserProfileDTO {

    @NotBlank(message = "Name ist erforderlich")
    @Size(min = 2, max = 100, message = "Name muss zwischen 2 und 100 Zeichen lang sein")
    private String name;

    @NotBlank(message = "E-Mail ist erforderlich")
    @Email(message = "Bitte geben Sie eine gültige E-Mail-Adresse ein")
    private String email;

    @Size(max = 20, message = "Telefonnummer darf maximal 20 Zeichen lang sein")
    @Pattern(regexp = "^$|^[+]?[0-9\\s\\-()]+$", message = "Bitte geben Sie eine gültige Telefonnummer ein")
    private String phone;

    @Size(max = 255, message = "Straße darf maximal 255 Zeichen lang sein")
    private String street;

    @Size(max = 10, message = "Postleitzahl darf maximal 10 Zeichen lang sein")
    @Pattern(regexp = "^$|^[0-9A-Za-z\\s\\-]+$", message = "Bitte geben Sie eine gültige Postleitzahl ein")
    private String postalCode;

    @Size(max = 100, message = "Stadt darf maximal 100 Zeichen lang sein")
    private String city;

    @Size(max = 100, message = "Land darf maximal 100 Zeichen lang sein")
    private String country;

    // Current password required for verification when updating profile
    @NotBlank(message = "Aktuelles Passwort ist erforderlich, um das Profil zu aktualisieren")
    private String currentPassword;

    public UpdateUserProfileDTO() {}

    public UpdateUserProfileDTO(String name, String email, String phone, String street, 
                                 String postalCode, String city, String country, String currentPassword) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.street = street;
        this.postalCode = postalCode;
        this.city = city;
        this.country = country;
        this.currentPassword = currentPassword;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
}
