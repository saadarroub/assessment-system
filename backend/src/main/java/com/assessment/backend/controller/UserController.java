package com.assessment.backend.controller;

import com.assessment.backend.dto.ChangePasswordDTO;
import com.assessment.backend.dto.UpdateUserProfileDTO;
import com.assessment.backend.dto.UserSummaryDTO;
import com.assessment.backend.entity.User;
import com.assessment.backend.entity.UserRole;
import com.assessment.backend.service.FileStorageService;
import com.assessment.backend.service.UserService;
import com.assessment.backend.service.RolePermissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")

public class UserController {


    @Autowired
    private UserService userService;

    @Autowired
    private RolePermissionService rolePermissionService;

    @Autowired
    private FileStorageService fileStorageService;

    @PreAuthorize("hasAuthority('users.view')")
    @GetMapping
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers() {
        List<UserSummaryDTO> users = userService.getAllUsers()
            .stream()
            .map(user -> UserSummaryDTO.fromEntity(user, rolePermissionService))
            .toList();
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasAuthority('users.view')")
    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryDTO> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
            .map(user -> UserSummaryDTO.fromEntity(user, rolePermissionService))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('users.create')")
    @PostMapping
    public ResponseEntity<UserSummaryDTO> createUser(@RequestBody CreateUserWithRoleRequest request) {
        User createdUser = userService.createUserWithRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserSummaryDTO.fromEntity(createdUser, rolePermissionService));
    }

    @PreAuthorize("hasAuthority('users.edit')")
    @PutMapping("/{id}")
    public ResponseEntity<UserSummaryDTO> updateUser(@PathVariable UUID id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(UserSummaryDTO.fromEntity(updatedUser, rolePermissionService));
    }

    @PreAuthorize("hasAuthority('users.delete')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('users.create')")
    @PostMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<UserRole> assignRole(@PathVariable UUID userId, @PathVariable UUID roleId) {
        UserRole userRole = userService.assignRoleToUser(userId, roleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(userRole);
    }

    @PreAuthorize("hasAuthority('users.create')")
    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<Void> removeRole(@PathVariable UUID userId, @PathVariable UUID roleId) {
        userService.removeRoleFromUser(userId, roleId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('users.view')")
    @GetMapping("/{userId}/roles")
    public ResponseEntity<List<UserRole>> getUserRoles(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserRoles(userId));
    }

    /**
     * Upload or update avatar image for a user.
     * 
     * @param id the user ID
     * @param file the avatar image file (JPEG/PNG, max 2MB)
     * @return the updated user summary with new avatar path
     */
    @PreAuthorize("hasAuthority('users.edit') or @userSecurityService.isCurrentUser(#id)")
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        return userService.getUserById(id)
            .map(user -> {
                try {
                    // Delete old avatar if not default
                    String oldAvatar = user.getProfileImagePath();
                    if (oldAvatar != null && !oldAvatar.equals("default-avatar.jpg")) {
                        fileStorageService.deleteAvatar(oldAvatar);
                    }

                    // Store new avatar
                    String newFilename = fileStorageService.storeAvatar(file, id);
                    
                    // Update user
                    user.setProfileImagePath(newFilename);
                    User updatedUser = userService.updateUserAvatar(id, newFilename);
                    
                    return ResponseEntity.ok(UserSummaryDTO.fromEntity(updatedUser, rolePermissionService));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                } catch (IOException e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Fehler beim Hochladen des Avatars"));
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete avatar and reset to default for a user.
     * 
     * @param id the user ID
     * @return the updated user summary with default avatar
     */
    @PreAuthorize("hasAuthority('users.edit') or @userSecurityService.isCurrentUser(#id)")
    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<UserSummaryDTO> deleteAvatar(@PathVariable UUID id) {
        return userService.getUserById(id)
            .map(user -> {
                // Delete old avatar if not default
                String oldAvatar = user.getProfileImagePath();
                if (oldAvatar != null && !oldAvatar.isBlank()) {
                    fileStorageService.deleteAvatar(oldAvatar);
                }

                // Reset to default
                User updatedUser = userService.updateUserAvatar(id,null);
                return ResponseEntity.ok(UserSummaryDTO.fromEntity(updatedUser, rolePermissionService));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update user profile information (name, email, phone, address).
     * Requires current password for verification.
     * 
     * @param id the user ID
     * @param profileDTO the profile update data including current password
     * @return the updated user summary
     */
    @PreAuthorize("hasAuthority('users.edit') or @userSecurityService.isCurrentUser(#id)")
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable UUID id, @Valid @RequestBody UpdateUserProfileDTO profileDTO) {
        try {
            User updatedUser = userService.updateUserProfile(id, profileDTO);
            return ResponseEntity.ok(UserSummaryDTO.fromEntity(updatedUser, rolePermissionService));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Change user password.
     * Requires current password for verification.
     * 
     * @param id the user ID
     * @param passwordDTO the password change data
     * @return success message or error
     */
    @PreAuthorize("hasAuthority('users.edit') or @userSecurityService.isCurrentUser(#id)")
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable UUID id, @Valid @RequestBody ChangePasswordDTO passwordDTO) {
        // Validate passwords match
        if (!passwordDTO.passwordsMatch()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Das neue Passwort und die Bestätigung stimmen nicht überein"));
        }

        try {
            userService.changePassword(id, passwordDTO);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Toggle user status between active and inactive.
     * 
     * @param id the user ID
     * @return the updated user
     */
    @PreAuthorize("hasAuthority('users.edit')")
    @PatchMapping("/status/change/{id}")
    public ResponseEntity<UserSummaryDTO> changeUserStatus(@PathVariable UUID id) {
        try {
            User updatedUser = userService.changeStatus(id);
            return ResponseEntity.ok(UserSummaryDTO.fromEntity(updatedUser, rolePermissionService));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}