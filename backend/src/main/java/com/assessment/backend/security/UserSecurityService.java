package com.assessment.backend.security;

import com.assessment.backend.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for user-related security checks.
 * Used in SpEL expressions for method-level security.
 */
@Service("userSecurityService")
public class UserSecurityService {

    /**
     * Check if the given user ID matches the currently authenticated user.
     * This allows users to edit their own profile.
     * 
     * @param userId the user ID to check
     * @return true if the current user matches the given ID
     */
    public boolean isCurrentUser(UUID userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        
        // Check if principal is User entity (set by JwtAuthenticationFilter)
        if (principal instanceof User) {
            User currentUser = (User) principal;
            boolean isMatch = userId.equals(currentUser.getId());
            System.out.println("[UserSecurityService] Checking isCurrentUser: userId=" + userId + ", currentUserId=" + currentUser.getId() + ", match=" + isMatch);
            return isMatch;
        }
        
        // Fallback: check authentication name (might be UUID string)
        String name = authentication.getName();
        try {
            UUID authUserId = UUID.fromString(name);
            return userId.equals(authUserId);
        } catch (IllegalArgumentException e) {
            // Name is not a UUID
            return false;
        }
    }
}
