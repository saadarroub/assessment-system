package com.assessment.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.assessment.backend.entity.Permission;
import com.assessment.backend.service.PermissionService;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    // GET /api/permissions - Get all permissions
    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

    // GET /api/permissions/{id} - Get permission by ID
    @GetMapping("/{id}")
    public ResponseEntity<Permission> getPermissionById(@PathVariable UUID id) {
        try {
            Permission permission = permissionService.getPermissionById(id);
            return ResponseEntity.ok(permission);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/permissions/by-name/{name} - Get permission by name
    @GetMapping("/by-name/{name}")
    public ResponseEntity<Permission> getPermissionByName(@PathVariable String name) {
        try {
            Permission permission = permissionService.getPermissionByName(name);
            return ResponseEntity.ok(permission);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/permissions - Create new permission
    @PostMapping
    public ResponseEntity<?> createPermission(@RequestBody Permission permission) {
        try {
            Permission created = permissionService.createPermission(permission);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // PUT /api/permissions/{id} - Update permission
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePermission(@PathVariable UUID id, @RequestBody Permission permission) {
        try {
            Permission updated = permissionService.updatePermission(id, permission);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // DELETE /api/permissions/{id} - Delete permission
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePermission(@PathVariable UUID id) {
        try {
            permissionService.deletePermission(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

