package com.assessment.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.assessment.backend.entity.User;
import com.assessment.backend.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        // to do: implement BCrypt password check
        // Simple password check (for prototype - later use BCrypt)
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() != null && user.getPassword().equals(password)) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public void logout(String token) {
        // For simple prototype: logout logic musst be handled on frontend
        // to do: implement token invalidation
        // Later: implement token invalidation
    }
}

