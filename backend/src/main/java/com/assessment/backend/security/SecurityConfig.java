package com.assessment.backend.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints (kein Token erforderlich)
                .requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/logout").permitAll()
                
                // Public Access Routes - Alle HTTP-Methoden erlaubt (GET, POST, PUT für Assessment Session)
                .requestMatchers("/public/access/**").permitAll()
                
                
                // Admin Panel Endpunkte - NUR GET öffentlich, andere Methoden brauchen Authentication
                // WorkerCatalog
                .requestMatchers(HttpMethod.GET, "/api/worker-catalog/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/worker-catalog/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/worker-catalog/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/worker-catalog/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/worker-catalog/**").authenticated()
                
                // ThemaCatalog
                .requestMatchers(HttpMethod.GET, "/api/thema-catalogs/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/thema-catalogs/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/thema-catalogs/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/thema-catalogs/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/thema-catalogs/**").authenticated()
                
                // QuestionCatalog (falls verwendet)
                .requestMatchers(HttpMethod.GET, "/api/question-catalogs/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/question-catalogs/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/question-catalogs/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/question-catalogs/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/question-catalogs/**").authenticated()
                
                // QuestionNodes
                .requestMatchers(HttpMethod.GET, "/api/question-nodes/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/question-nodes/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/question-nodes/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/question-nodes/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/question-nodes/**").authenticated()
                
                // Assessments (falls verwendet)
                .requestMatchers("/api/assessments/**").permitAll()
                
                // Static resources & root path (für Frontend in Docker)
                .requestMatchers("/", "/index.html", "/assets/**", "/static/**", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.jpg", "/*.svg").permitAll()
                
                // Avatar files - öffentlich (UUID im Dateinamen bietet Schutz)
                .requestMatchers(HttpMethod.GET, "/api/files/avatars/**").permitAll()
                
                // Explicitly protect all other API endpoints
                .requestMatchers("/api/**").authenticated()
                .requestMatchers("/actuator/**").authenticated()
                
                // Allow everything else (SPA routes like /invite/..., /dashboard, etc.)
                // WebConfig will handle forwarding to index.html
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // WICHTIG: Bei allowCredentials=true KANN NICHT "*" verwendet werden!
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "http://127.0.0.1:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // WICHTIG für httpOnly Cookies!
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie", "Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}