package com.assessment.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.assessment.backend.dto.RolePermissionResponseDTO;
import com.assessment.backend.entity.Permission;
import com.assessment.backend.entity.RolePermission;
import com.assessment.backend.service.RolePermissionService;

@RestController
@RequestMapping("/api/role-permissions")
public class RolePermissionController {

    @Autowired
    private RolePermissionService rolePermissionService;

    // GET /api/role-permissions/roles/{roleId}/permissions - Get all permissions for a role (Clean DTO)
    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<?> getPermissionsForRole(@PathVariable UUID roleId) {
        try {
            List<RolePermissionResponseDTO> rolePermissions = rolePermissionService.getPermissionsForRoleDTO(roleId);
            return ResponseEntity.ok(rolePermissions);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/role-permissions/permissions/{permissionId}/roles - Get all roles with a permission
    @GetMapping("/permissions/{permissionId}/roles")
    public ResponseEntity<?> getRolesWithPermission(@PathVariable UUID permissionId) {
        try {
            List<RolePermission> rolePermissions = rolePermissionService.getRolesWithPermission(permissionId);
            return ResponseEntity.ok(rolePermissions);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/role-permissions/grant - Grant permission to role
    @PostMapping("/grant")
    public ResponseEntity<?> grantPermissionToRole(@RequestBody Map<String, UUID> request) {
        try {
            UUID roleId = request.get("roleId");
            UUID permissionId = request.get("permissionId");
            
            if (roleId == null || permissionId == null) {
                return ResponseEntity.badRequest().body("roleId and permissionId are required");
            }
            
            RolePermission rolePermission = rolePermissionService.grantPermissionToRole(roleId, permissionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(rolePermission);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // DELETE /api/role-permissions/revoke - Revoke permission from role
    @DeleteMapping("/revoke")
    public ResponseEntity<?> revokePermissionFromRole(@RequestBody Map<String, UUID> request) {
        try {
            UUID roleId = request.get("roleId");
            UUID permissionId = request.get("permissionId");
            
            if (roleId == null || permissionId == null) {
                return ResponseEntity.badRequest().body("roleId and permissionId are required");
            }
            
            rolePermissionService.revokePermissionFromRole(roleId, permissionId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/role-permissions/users/{userId}/permissions - Get all permissions for a user
    @GetMapping("/users/{userId}/permissions")
    public ResponseEntity<List<Permission>> getPermissionsForUser(@PathVariable UUID userId) {
        List<Permission> permissions = rolePermissionService.getPermissionsForUser(userId);
        return ResponseEntity.ok(permissions);
    }

    // GET /api/role-permissions/check - Check if role has permission
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkRolePermission(
            @RequestParam UUID roleId, 
            @RequestParam UUID permissionId) {
        boolean hasPermission = rolePermissionService.roleHasPermission(roleId, permissionId);
        return ResponseEntity.ok(Map.of("hasPermission", hasPermission));
    }

    // GET /api/role-permissions/users/{userId}/check/{permissionName} - Check if user has permission
    @GetMapping("/users/{userId}/check/{permissionName}")
    public ResponseEntity<Map<String, Boolean>> checkUserPermission(
            @PathVariable UUID userId, 
            @PathVariable String permissionName) {
        boolean hasPermission = rolePermissionService.userHasPermission(userId, permissionName);
        return ResponseEntity.ok(Map.of("hasPermission", hasPermission));
    }

    // POST /api/role-permissions/grant-multiple - Grant multiple permissions to role (Clean DTO Response)
    @PostMapping("/grant-multiple")
    public ResponseEntity<?> grantMultiplePermissionsToRole(@RequestBody Map<String, Object> request) {
        try {
            UUID roleId = UUID.fromString(request.get("roleId").toString());
            @SuppressWarnings("unchecked")
            List<String> permissionIdStrings = (List<String>) request.get("permissionIds");
            
            if (roleId == null || permissionIdStrings == null || permissionIdStrings.isEmpty()) {
                return ResponseEntity.badRequest().body("roleId and permissionIds are required");
            }
            
            List<UUID> permissionIds = permissionIdStrings.stream()
                    .map(UUID::fromString)
                    .toList();
            
            List<RolePermissionResponseDTO> granted = rolePermissionService.grantMultiplePermissionsToRole(roleId, permissionIds);
            return ResponseEntity.status(HttpStatus.CREATED).body(granted);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // DELETE /api/role-permissions/revoke-multiple - Revoke multiple permissions from role
    @DeleteMapping("/revoke-multiple")
    public ResponseEntity<?> revokeMultiplePermissionsFromRole(@RequestBody Map<String, Object> request) {
        try {
            UUID roleId = UUID.fromString(request.get("roleId").toString());
            @SuppressWarnings("unchecked")
            List<String> permissionIdStrings = (List<String>) request.get("permissionIds");
            
            if (roleId == null || permissionIdStrings == null || permissionIdStrings.isEmpty()) {
                return ResponseEntity.badRequest().body("roleId and permissionIds are required");
            }
            
            List<UUID> permissionIds = permissionIdStrings.stream()
                    .map(UUID::fromString)
                    .toList();
            
            rolePermissionService.revokeMultiplePermissionsFromRole(roleId, permissionIds);
            return ResponseEntity.ok(Map.of("message", "Revoked " + permissionIds.size() + " permissions"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

