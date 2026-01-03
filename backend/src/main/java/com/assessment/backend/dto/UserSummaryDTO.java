
package com.assessment.backend.dto;

import java.util.List;

import java.time.LocalDateTime;
import java.util.UUID;

import com.assessment.backend.entity.User;


import java.util.ArrayList;
import java.util.stream.Collectors;
import com.assessment.backend.entity.UserRole;
import com.assessment.backend.entity.Role;
import com.assessment.backend.dto.RoleSummaryDTO;

import com.assessment.backend.entity.Permission;
import com.assessment.backend.service.RolePermissionService;

public class UserSummaryDTO {
    private UUID id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RoleSummaryDTO> roles;
    private String phone;
    private String street;
    private String postalCode;
    private String city;
    private String country;
    private String profileImagePath;
    private String status;

    public UserSummaryDTO() {}

    public UserSummaryDTO(UUID id, String name, String email, LocalDateTime createdAt, LocalDateTime updatedAt, 
                          List<RoleSummaryDTO> roles, String phone, String street, String postalCode, 
                          String city, String country, String profileImagePath, String status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.roles = roles;
        this.phone = phone;
        this.street = street;
        this.postalCode = postalCode;
        this.city = city;
        this.country = country;
        this.profileImagePath = profileImagePath;
        this.status = status;
    }

    public static UserSummaryDTO fromEntity(User user, RolePermissionService rolePermissionService) {
        List<RoleSummaryDTO> roleDTOs = new ArrayList<>();
        if (user.getRoles() != null) {
            for (UserRole ur : user.getRoles()) {
                Role role = ur.getRole();
                List<String> permissions = new ArrayList<>();
                if (role != null && role.getId() != null && rolePermissionService != null) {
                    permissions = rolePermissionService.getPermissionsForRole(role.getId())
                        .stream()
                        .map(rp -> rp.getPermission() != null ? rp.getPermission().getName() : null)
                        .filter(p -> p != null)
                        .collect(Collectors.toList());
                }
                roleDTOs.add(new RoleSummaryDTO(
                    role != null ? role.getId() : null,
                    role != null ? role.getName() : null,
                    role != null ? role.getDescription() : null,
                    role != null ? role.getCreatedAt() : null,
                    permissions
                ));
            }
        }
        return new UserSummaryDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            roleDTOs,
            user.getPhone(),
            user.getStreet(),
            user.getPostalCode(),
            user.getCity(),
            user.getCountry(),
            user.getProfileImagePath(),
            user.getStatus()
        );
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<RoleSummaryDTO> getRoles() { return roles; }
    public void setRoles(List<RoleSummaryDTO> roles) { this.roles = roles; }
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
    public String getProfileImagePath() { return profileImagePath; }
    public void setProfileImagePath(String profileImagePath) { this.profileImagePath = profileImagePath; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
