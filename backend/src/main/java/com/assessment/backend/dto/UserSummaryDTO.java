
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

    public UserSummaryDTO() {}

    public UserSummaryDTO(UUID id, String name, String email, LocalDateTime createdAt, LocalDateTime updatedAt, List<RoleSummaryDTO> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.roles = roles;
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
            roleDTOs
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
}
