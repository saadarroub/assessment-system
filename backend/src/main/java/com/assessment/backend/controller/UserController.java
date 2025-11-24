package com.assessment.backend.controller;

import com.assessment.backend.dto.UserSummaryDTO;
import com.assessment.backend.entity.User;
import com.assessment.backend.entity.UserRole;
import com.assessment.backend.service.UserService;
import com.assessment.backend.service.RolePermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")

public class UserController {


    @Autowired
    private UserService userService;

    @Autowired
    private RolePermissionService rolePermissionService;

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

    //@PreAuthorize("hasAuthority('users.create')")
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
}