package com.assessment.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO für RolePermission Response (Saubere Darstellung)
 */
public class RolePermissionResponseDTO {
    
    private UUID roleId;
    private String roleName;
    private UUID permissionId;
    private String permissionName;
    private String permissionDescription;
    private LocalDateTime grantedAt;

    // Constructor
    public RolePermissionResponseDTO() {
    }

    public RolePermissionResponseDTO(UUID roleId, String roleName, 
                                    UUID permissionId, String permissionName, 
                                    String permissionDescription, LocalDateTime grantedAt) {
        this.roleId = roleId;
        this.roleName = roleName;
        this.permissionId = permissionId;
        this.permissionName = permissionName;
        this.permissionDescription = permissionDescription;
        this.grantedAt = grantedAt;
    }

    // Getters and Setters
    public UUID getRoleId() {
        return roleId;
    }

    public void setRoleId(UUID roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public UUID getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(UUID permissionId) {
        this.permissionId = permissionId;
    }

    public String getPermissionName() {
        return permissionName;
    }

    public void setPermissionName(String permissionName) {
        this.permissionName = permissionName;
    }

    public String getPermissionDescription() {
        return permissionDescription;
    }

    public void setPermissionDescription(String permissionDescription) {
        this.permissionDescription = permissionDescription;
    }

    public LocalDateTime getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(LocalDateTime grantedAt) {
        this.grantedAt = grantedAt;
    }
}
