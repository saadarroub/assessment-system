package com.assessment.backend.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.assessment.backend.dto.EnhancedLoginResponseDTO;
import com.assessment.backend.dto.LoginRequest;
import com.assessment.backend.dto.TokenRefreshResponseDTO;
import com.assessment.backend.entity.Permission;
import com.assessment.backend.entity.User;
import com.assessment.backend.security.JwtUtil;
import com.assessment.backend.service.AuditLogService;
import com.assessment.backend.service.AuthService;
import com.assessment.backend.service.RolePermissionService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RolePermissionService rolePermissionService;

    @Autowired
    private AuditLogService auditLogService;

    @Value("${security.jwt.expiration-ms:900000}") // Default 15 minutes
    private long accessTokenExpirationMs;

    @Value("${security.jwt.refresh-expiration-ms:604800000}") // Default 7 days
    private long refreshTokenExpirationMs;

    /**
     * Login Endpoint - Enhanced Version mit Token-Refresh-Support
     * 
     * Neues Behavior:
     * 1. Generiert Access Token (15 Min gültig) → im Response Body
     * 2. Generiert Refresh Token (7 Tage gültig) → in httpOnly Cookie
     * 3. Gibt User-Daten + Permissions + Roles zurück
     * 4. Setzt expiresAt-Timestamp für Frontend
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println(">>> AuthController.login called with email = " + loginRequest.getEmail());
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Optional<User> userOpt = authService.login(email, password);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Generate Access Token (short-lived)
            String accessToken = jwtUtil.generateToken(user);
            long accessTokenExpiresAt = System.currentTimeMillis() + accessTokenExpirationMs;

            String refreshToken = jwtUtil.generateToken(user); // For now same structure
            
            // Load user permissions
            List<String> permissions = rolePermissionService.getPermissionsForUser(user.getId())
                    .stream()
                    .map(Permission::getName)
                    .collect(Collectors.toList());

            // Load user roles
            List<String> roles = user.getRoles()
                    .stream()
                    .map(userRole -> userRole.getRole().getName())
                    .collect(Collectors.toList());

            // Create Enhanced Response DTO
            EnhancedLoginResponseDTO responseDTO = new EnhancedLoginResponseDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    accessToken,
                    accessTokenExpiresAt,
                    roles,
                    permissions
            );

            // Set httpOnly Refresh Token Cookie
            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(false) // Set to true in production with HTTPS!
                    .path("/api/auth")
                    .maxAge(refreshTokenExpirationMs / 1000) // Convert to seconds
                    .sameSite("Lax")
                    .build();

            // Audit log for login
            auditLogService.log(user, "LOGIN", "users", user.getId(), null);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(responseDTO);
        } else {
            return ResponseEntity.status(401)
                                 .body(Map.of("error", "Invalid credentials"));
        }
    }

    /**
     * Token Refresh Endpoint - NEUER ENDPOINT
     * 
     * POST /api/auth/refresh
     * 
     * Flow:
     * 1. Liest Refresh Token aus httpOnly Cookie
     * 2. Validiert Refresh Token
     * 3. Generiert neuen Access Token
     * 4. Gibt neuen Access Token + expiresAt zurück
     * 
     * WICHTIG: Refresh Token bleibt im Cookie (wird nicht erneuert)
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        // Extract Refresh Token from httpOnly Cookie
        String refreshToken = extractRefreshTokenFromCookies(request);
        
        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired refresh token"));
        }

        try {
            // Extract User from Refresh Token
            java.util.UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
            
            
            User user = new User();
            user.setId(userId);
            String newAccessToken = jwtUtil.generateToken(user);
            long newExpiresAt = System.currentTimeMillis() + accessTokenExpirationMs;

            TokenRefreshResponseDTO response = new TokenRefreshResponseDTO(
                    newAccessToken,
                    newExpiresAt
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Token refresh failed"));
        }
    }

    /**
     * Helper: Extract Refresh Token from Cookies
     */
    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        
        return Arrays.stream(request.getCookies())
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
    /**
     * Logout Endpoint - Enhanced mit Cookie-Cleanup
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> logoutRequest) {
        String token = logoutRequest != null ? logoutRequest.get("token") : null;
        authService.logout(token);
        
        // Clear Refresh Token Cookie
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false) // Set to true in production
                .path("/api/auth")
                .maxAge(0) // Delete cookie
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }

    /**
     * Get Permissions for Current User - NEUER ENDPOINT
     * 
     * GET /api/auth/permissions
     * 
     * Gibt Permissions des aktuell eingeloggten Users zurück
     * (basierend auf Authorization Header Token)
     */
    @GetMapping("/permissions")
    public ResponseEntity<?> getCurrentUserPermissions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "No valid authorization token"));
        }

        String token = authHeader.substring(7);
        
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        try {
            java.util.UUID userId = jwtUtil.getUserIdFromToken(token);
            
            List<String> permissions = rolePermissionService.getPermissionsForUser(userId)
                    .stream()
                    .map(Permission::getName)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("permissions", permissions));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to load permissions"));
        }
    }
}

