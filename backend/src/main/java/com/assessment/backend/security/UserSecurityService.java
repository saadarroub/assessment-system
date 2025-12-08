package com.assessment.backend.security;

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
        
        // Check if principal contains user ID information
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            // Username is the email, we need to check if it corresponds to the userId
            // This requires looking up the user - for simplicity, we'll handle this via JWT claims
        }
        
        // If using JWT with user ID in claims
        if (principal instanceof String) {
            try {
                // The principal might be the user ID as a string
                return userId.toString().equals(principal);
            } catch (Exception e) {
                return false;
            }
        }

        // Check if there's a custom authentication with user details
        if (authentication.getDetails() instanceof UUID) {
            return userId.equals(authentication.getDetails());
        }

        // Fallback: check claims if available
        Object credentials = authentication.getCredentials();
        if (credentials instanceof String) {
            // JWT token - the ID should be in the authentication name or details
            String name = authentication.getName();
            try {
                UUID authUserId = UUID.fromString(name);
                return userId.equals(authUserId);
            } catch (IllegalArgumentException e) {
                // Name is not a UUID, might be email
                return false;
            }
        }

        return false;
    }
}
