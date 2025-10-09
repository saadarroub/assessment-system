package com.assessment.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.assessment.backend.entity.Permission;
import com.assessment.backend.entity.RolePermission;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermission.RolePermissionId> {
    
    // Find all permissions for a specific role
    List<RolePermission> findByRoleId(UUID roleId);
    
    // Find all roles that have a specific permission
    List<RolePermission> findByPermissionId(UUID permissionId);
    
    // Check if a role has a specific permission
    boolean existsByRoleIdAndPermissionId(UUID roleId, UUID permissionId);
    
    // Delete a specific role-permission mapping
    void deleteByRoleIdAndPermissionId(UUID roleId, UUID permissionId);
    
    // Get all permissions for a user (via their roles)
    @Query("""
        SELECT DISTINCT rp.permission 
        FROM RolePermission rp 
        JOIN UserRole ur ON ur.roleId = rp.roleId 
        WHERE ur.userId = :userId
    """)
    List<Permission> findPermissionsByUserId(@Param("userId") UUID userId);
}

