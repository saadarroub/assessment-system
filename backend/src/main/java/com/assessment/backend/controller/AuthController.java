package com.assessment.backend.controller;

import com.assessment.backend.dto.LoginRequest;
import com.assessment.backend.dto.LoginResponseDTO;
import com.assessment.backend.entity.Permission;
import com.assessment.backend.entity.User;
import com.assessment.backend.service.AuthService;
import com.assessment.backend.service.RolePermissionService;
import com.assessment.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RolePermissionService rolePermissionService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println(">>> AuthController.login called with email = " + loginRequest.getEmail());
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Optional<User> userOpt = authService.login(email, password);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtUtil.generateToken(user);

            // Load user permissions
            List<String> permissions = rolePermissionService.getPermissionsForUser(user.getId())
                    .stream()
                    .map(Permission::getName)
                    .collect(Collectors.toList());

            LoginResponseDTO responseDTO = new LoginResponseDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getCreatedAt(),
                    user.getUpdatedAt(),
                    token,
                    permissions
            );
            return ResponseEntity.ok(responseDTO);
        } else {
            return ResponseEntity.status(401)
                                 .body(Map.of("error", "Invalid credentials"));
        }

    
    }
    

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> logoutRequest) {
        String token = logoutRequest.get("token");
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}

