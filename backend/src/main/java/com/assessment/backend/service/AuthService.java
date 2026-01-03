package com.assessment.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.assessment.backend.entity.User;
import com.assessment.backend.repository.UserRepository;

import com.assessment.backend.entity.RevokedToken;
import com.assessment.backend.repository.RevokedTokenRepository;



@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RevokedTokenRepository revokedTokenRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
         
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Check if user is active
            if ("inactive".equals(user.getStatus())) {
                return Optional.empty(); // Inactive users cannot login
            }
            if (user.getPassword() != null && passwordEncoder.matches(password, user.getPassword()))  {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public void logout(String token) {
        if (token == null || token.isBlank()) {
        return;
    }
     if (revokedTokenRepository.existsByToken(token)) {
        return;
    }
    RevokedToken revokedToken = new RevokedToken();
    revokedToken.setToken(token);

    revokedTokenRepository.save(revokedToken);
    }
}

