package com.assessment.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.assessment.backend.entity.Permission;
import com.assessment.backend.repository.PermissionRepository;

@Service
@Transactional
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    // Get all permissions
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    // Get permission by ID
    public Permission getPermissionById(UUID id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
    }

    // Get permission by name
    public Permission getPermissionByName(String name) {
        return permissionRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Permission not found with name: " + name));
    }

    // Create permission
    public Permission createPermission(Permission permission) {
        if (permissionRepository.existsByName(permission.getName())) {
            throw new RuntimeException("Permission with name '" + permission.getName() + "' already exists");
        }
        return permissionRepository.save(permission);
    }

    // Update permission
    public Permission updatePermission(UUID id, Permission permissionDetails) {
        Permission permission = getPermissionById(id);
        
        // Check if name is being changed to an existing name
        if (!permission.getName().equals(permissionDetails.getName()) 
                && permissionRepository.existsByName(permissionDetails.getName())) {
            throw new RuntimeException("Permission with name '" + permissionDetails.getName() + "' already exists");
        }
        
        permission.setName(permissionDetails.getName());
        permission.setDescription(permissionDetails.getDescription());
        
        return permissionRepository.save(permission);
    }

    // Delete permission
    public void deletePermission(UUID id) {
        Permission permission = getPermissionById(id);
        permissionRepository.delete(permission);
    }
}

