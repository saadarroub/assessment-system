package com.assessment.backend.security;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.assessment.backend.entity.User;
import com.assessment.backend.repository.RevokedTokenRepository;
import com.assessment.backend.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter { 

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RevokedTokenRepository revokedTokenRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
                                   UserRepository userRepository,
                                   RevokedTokenRepository revokedTokenRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();

        System.out.println("=== JwtAuthenticationFilter START ===");
        System.out.println("Path: " + path);
        System.out.println("Method: " + method);

       
        if (isPublicPath(path, method)) {
            System.out.println("Public path - skipping auth");
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        System.out.println("Authorization header: " + (header != null ? header.substring(0, Math.min(30, header.length())) + "..." : "MISSING"));

        
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            System.out.println("No valid Bearer token - continuing without auth");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        //  (logout)
        if (revokedTokenRepository.existsByToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (!jwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        UUID userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = userOpt.get();

        // Extract permissions from token and convert to GrantedAuthority
        List<String> permissions = jwtUtil.getPermissionsFromToken(token);
        
        // DEBUG: Log permissions
        System.out.println("=== JWT Filter Debug ===");
        System.out.println("User: " + user.getEmail());
        System.out.println("Permissions from token: " + permissions.size());
        if (!permissions.isEmpty()) {
            System.out.println("First 3 permissions: " + permissions.stream().limit(3).collect(Collectors.toList()));
        }
        
        List<org.springframework.security.core.GrantedAuthority> authorities = 
                permissions.stream()
                        .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
        
        System.out.println("Authorities created: " + authorities.size());

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        authorities   // Use permissions as authorities
                );

        authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        System.out.println("Authentication set in SecurityContext");
        System.out.println("========================");
        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path, String method) {
        // Login
        if ("/api/auth/login".equals(path)) {
            return true;
        }

        // Public Access Endpoints (eigenes Token-System)
        if (path.startsWith("/public/access/")) {
            return true;
        }

        return false;
    }
}
