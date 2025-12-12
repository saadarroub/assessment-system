package com.assessment.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for changing user password.
 * Requires current password for verification.
 */
public class ChangePasswordDTO {

    @NotBlank(message = "Aktuelles Passwort ist erforderlich")
    private String currentPassword;

    @NotBlank(message = "Neues Passwort ist erforderlich")
    @Size(min = 8, max = 100, message = "Das neue Passwort muss mindestens 8 Zeichen lang sein")
    private String newPassword;

    @NotBlank(message = "Passwortbestätigung ist erforderlich")
    private String confirmPassword;

    public ChangePasswordDTO() {}

    public ChangePasswordDTO(String currentPassword, String newPassword, String confirmPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }

    // Getters and Setters
    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    /**
     * Validate that newPassword and confirmPassword match.
     * @return true if passwords match
     */
    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
