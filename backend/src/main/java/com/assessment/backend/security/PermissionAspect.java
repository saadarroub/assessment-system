package com.assessment.backend.security;

import java.util.UUID;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.assessment.backend.service.RolePermissionService;

/**
 * AOP Aspect to enforce @RequirePermission annotation
 */
@Aspect
@Component
public class PermissionAspect {

    @Autowired
    private RolePermissionService rolePermissionService;

    @Before("@annotation(RequirePermission)")
    public void checkPermission(JoinPoint joinPoint) {
        // Get annotation
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequirePermission annotation = signature.getMethod().getAnnotation(RequirePermission.class);
        
        // Extract userId from method parameters (must be first parameter or named 'userId')
        UUID userId = extractUserId(joinPoint.getArgs());
        
        if (userId == null) {
            throw new SecurityException("userId not found in method parameters");
        }
        
        // Get required permissions
        String[] permissions = annotation.value();
        boolean requireAll = annotation.requireAll();
        
        // Check permissions
        if (requireAll) {
            // AND logic: user must have ALL permissions
            for (String permission : permissions) {
                if (!rolePermissionService.userHasPermission(userId, permission)) {
                    throw new SecurityException("Missing required permission: " + permission);
                }
            }
        } else {
            // OR logic: user must have AT LEAST ONE permission
            boolean hasAny = false;
            for (String permission : permissions) {
                if (rolePermissionService.userHasPermission(userId, permission)) {
                    hasAny = true;
                    break;
                }
            }
            if (!hasAny) {
                throw new SecurityException("Missing required permissions: " + String.join(", ", permissions));
            }
        }
    }
    
    /**
     * Extract userId from method parameters
     * Assumes first UUID parameter is userId
     */
    private UUID extractUserId(Object[] args) {
        if (args == null || args.length == 0) {
            return null;
        }
        
        // First argument is userId
        if (args[0] instanceof UUID userId) {
            return userId;
        }
        
        return null;
    }
}

