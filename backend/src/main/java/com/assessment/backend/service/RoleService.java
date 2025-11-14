package com.assessment.backend.service;

import com.assessment.backend.entity.Role;
import com.assessment.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    /**
     * Get all roles
     */
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    /**
     * Get role by ID
     */
    public Role getRoleById(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
    }

    /**
     * Get role by name
     */
    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Role not found with name: " + name));
    }

    /**
     * Create new role
     */
    public Role createRole(Role role) {
        // Check if role name already exists
        if (roleRepository.existsByName(role.getName())) {
            throw new RuntimeException("Role with name '" + role.getName() + "' already exists");
        }
        return roleRepository.save(role);
    }

    /**
     * Update existing role
     */
    public Role updateRole(UUID id, Role roleDetails) {
        Role role = getRoleById(id);
        
        // Check if new name conflicts with another role
        if (!role.getName().equals(roleDetails.getName()) 
                && roleRepository.existsByName(roleDetails.getName())) {
            throw new RuntimeException("Role with name '" + roleDetails.getName() + "' already exists");
        }
        
        role.setName(roleDetails.getName());
        role.setDescription(roleDetails.getDescription());
        
        return roleRepository.save(role);
    }

    /**
     * Delete role
     */
    public void deleteRole(UUID id) {
        Role role = getRoleById(id);
        roleRepository.delete(role);
    }

    /**
     * Check if role exists by name
     */
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }
}
