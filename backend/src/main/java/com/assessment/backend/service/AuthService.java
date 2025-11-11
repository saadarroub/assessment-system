package com.assessment.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.assessment.backend.entity.User;
import com.assessment.backend.repository.UserRepository;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
         
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() != null && passwordEncoder.matches(password, user.getPassword()))  {
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

