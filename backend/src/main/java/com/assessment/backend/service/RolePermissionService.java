package com.assessment.backend.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.assessment.backend.dto.RolePermissionResponseDTO;
import com.assessment.backend.entity.Permission;
import com.assessment.backend.entity.Role;
import com.assessment.backend.entity.RolePermission;
import com.assessment.backend.repository.PermissionRepository;
import com.assessment.backend.repository.RolePermissionRepository;
import com.assessment.backend.repository.RoleRepository;

@Service
@Transactional
public class RolePermissionService {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    // ========== Mapper ==========
    
    private RolePermissionResponseDTO mapToDTO(RolePermission rp) {
        Role role = rp.getRole();
        Permission permission = rp.getPermission();
        
        return new RolePermissionResponseDTO(
            rp.getRoleId(),
            role != null ? role.getName() : null,
            rp.getPermissionId(),
            permission != null ? permission.getName() : null,
            permission != null ? permission.getDescription() : null,
            rp.getGrantedAt()
        );
    }

    // ========== Service Methods ==========
    
    // Get all permissions for a role
    public List<RolePermission> getPermissionsForRole(UUID roleId) {
        // Verify role exists
        roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        
        return rolePermissionRepository.findByRoleId(roleId);
    }

    // Get all roles that have a specific permission
    public List<RolePermission> getRolesWithPermission(UUID permissionId) {
        // Verify permission exists
        permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + permissionId));
        
        return rolePermissionRepository.findByPermissionId(permissionId);
    }

    // Grant permission to role
    public RolePermission grantPermissionToRole(UUID roleId, UUID permissionId) {
        // Verify role exists
        roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        
        // Verify permission exists
        permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + permissionId));
        
        // Check if already granted
        if (rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
            throw new RuntimeException("Permission already granted to this role");
        }
        
        RolePermission rolePermission = new RolePermission(roleId, permissionId);
        return rolePermissionRepository.save(rolePermission);
    }

    // Revoke permission from role
    public void revokePermissionFromRole(UUID roleId, UUID permissionId) {
        // Verify mapping exists
        if (!rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
            throw new RuntimeException("Permission not granted to this role");
        }
        
        rolePermissionRepository.deleteByRoleIdAndPermissionId(roleId, permissionId);
    }

    // Get all permissions for a user (via their roles)
    public List<Permission> getPermissionsForUser(UUID userId) {
        return rolePermissionRepository.findPermissionsByUserId(userId);
    }

    // Check if role has permission
    public boolean roleHasPermission(UUID roleId, UUID permissionId) {
        return rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId);
    }

    // Check if user has permission (via any of their roles)
    public boolean userHasPermission(UUID userId, String permissionName) {
        List<Permission> permissions = rolePermissionRepository.findPermissionsByUserId(userId);
        return permissions.stream()
                .anyMatch(p -> p.getName().equals(permissionName));
    }

    // Grant multiple permissions to role (BULK) - Returns clean DTO
    @Transactional
    public List<RolePermissionResponseDTO> grantMultiplePermissionsToRole(UUID roleId, List<UUID> permissionIds) {
        // Verify role exists
        roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        
        // Verify all permissions exist
        for (UUID permissionId : permissionIds) {
            permissionRepository.findById(permissionId)
                    .orElseThrow(() -> new RuntimeException("Permission not found with id: " + permissionId));
        }
        
        // Grant each permission (skip if already granted)
        List<RolePermission> granted = new java.util.ArrayList<>();
        for (UUID permissionId : permissionIds) {
            if (!rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
                RolePermission rolePermission = new RolePermission(roleId, permissionId);
                granted.add(rolePermissionRepository.save(rolePermission));
            }
        }
        
        // Convert to DTO
        return granted.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    // Get all permissions for a role (Returns clean DTO)
    public List<RolePermissionResponseDTO> getPermissionsForRoleDTO(UUID roleId) {
        // Verify role exists
        roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleId(roleId);
        
        return rolePermissions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Revoke multiple permissions from role (BULK)
    @Transactional
    public void revokeMultiplePermissionsFromRole(UUID roleId, List<UUID> permissionIds) {
        // Verify role exists
        roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        
        // Revoke each permission
        for (UUID permissionId : permissionIds) {
            if (rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
                rolePermissionRepository.deleteByRoleIdAndPermissionId(roleId, permissionId);
            }
        }
    }
}

