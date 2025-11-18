package com.assessment.backend.security;

import com.assessment.backend.entity.User;
import com.assessment.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        System.out.println(">>> JwtAuthenticationFilter TRIGGERED for path = " + path);

      if (path.startsWith("/api/auth/login")
            || path.startsWith("/api/auth/logout")
            || path.startsWith("/api/users")) {
                 System.out.println(">>> JwtAuthenticationFilter SKIPPED for path = " + path);
        filterChain.doFilter(request, response);
           return;
    }

        String header = request.getHeader("Authorization"); 
        System.out.println(">>> JwtAuthenticationFilter header = " + header);

        // Pas de header Authorization ou pas Bearer, on laisse passer sans authentifier
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            System.out.println(">>> JwtAuthenticationFilter: no Bearer token, continue without auth");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        // Token invalide
        if (!jwtUtil.validateToken(token)) {
             System.out.println(">>> JwtAuthenticationFilter: invalid token");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        UUID userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
              System.out.println(">>> JwtAuthenticationFilter: userId null");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
             System.out.println(">>> JwtAuthenticationFilter: user not found");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        var authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                Collections.emptyList()
        );

        authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        System.out.println(">>> JwtAuthenticationFilter: authentication set, continue filter chain");
        filterChain.doFilter(request, response);
    }
}
