package com.assessment.backend.security;

import com.assessment.backend.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Secret key used to sign the token (must be long enough for HS256)
    private static final String SECRET_KEY = "my-super-secret-key-for-jwt-123456";

    // Token validity: 1 hour (in milliseconds)
    private static final long EXPIRATION_TIME_MS = 60 * 60 * 1000;

    private final Key key;

    public JwtUtil() {
        this.key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Generate a JWT token for the given user
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME_MS);

        return Jwts.builder()
                .setSubject(user.getId().toString())      // main subject: user id
                .claim("email", user.getEmail())          // extra claims
                .claim("name", user.getName())
                .setIssuedAt(now)                         // issued at
                .setExpiration(expiryDate)                // expiration time
                .signWith(key, SignatureAlgorithm.HS256)  // signing algorithm + key
                .compact();
    }
}
