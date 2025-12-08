package com.assessment.backend.service;

import com.assessment.backend.dto.ChangePasswordDTO;
import com.assessment.backend.dto.UpdateUserProfileDTO;
import com.assessment.backend.entity.User;
import com.assessment.backend.entity.UserRole;
import com.assessment.backend.repository.UserRepository;
import com.assessment.backend.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    // Encoder pour les mots de passe
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUserWithRole(com.assessment.backend.controller.CreateUserWithRoleRequest request) {
        User user = new User();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setProfileImagePath("default-avatar.jpg"); // Set default avatar
        System.out.println("ENCODED PASSWORD (create) = " + user.getPassword());
        User savedUser = userRepository.save(user);
        if (request.roleId != null) {
            UserRole userRole = new UserRole(savedUser.getId(), request.roleId);
            userRoleRepository.save(userRole);
        }
        return savedUser;
    }
    

    public User updateUser(UUID id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());

        // Update and encode password only if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            System.out.println("ENCODED PASSWORD (update) = " + user.getPassword());
        }

        return userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public UserRole assignRoleToUser(UUID userId, UUID roleId) {
        UserRole userRole = new UserRole(userId, roleId);
        return userRoleRepository.save(userRole);
    }

    @Transactional
    public void removeRoleFromUser(UUID userId, UUID roleId) {
        userRoleRepository.deleteByUserIdAndRoleId(userId, roleId);
    }

    public List<UserRole> getUserRoles(UUID userId) {
        return userRoleRepository.findByUserId(userId);
    }

    /**
     * Update user avatar path.
     * 
     * @param id the user ID
     * @param avatarFilename the new avatar filename
     * @return the updated user
     */
    @Transactional
    public User updateUserAvatar(UUID id, String avatarFilename) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setProfileImagePath(avatarFilename);
        return userRepository.save(user);
    }

    /**
     * Update user profile information including address and phone.
     * Requires current password for verification.
     * 
     * @param id the user ID
     * @param profileDTO the profile update data
     * @return the updated user
     * @throws IllegalArgumentException if current password is incorrect
     */
    @Transactional
    public User updateUserProfile(UUID id, UpdateUserProfileDTO profileDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Verify current password
        if (!passwordEncoder.matches(profileDTO.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Das eingegebene Passwort ist falsch");
        }

        // Update basic info
        user.setName(profileDTO.getName());
        user.setEmail(profileDTO.getEmail());

        // Update optional fields
        user.setPhone(profileDTO.getPhone());
        user.setStreet(profileDTO.getStreet());
        user.setPostalCode(profileDTO.getPostalCode());
        user.setCity(profileDTO.getCity());
        user.setCountry(profileDTO.getCountry());

        return userRepository.save(user);
    }

    /**
     * Change user password.
     * Requires current password for verification.
     * 
     * @param id the user ID
     * @param passwordDTO the password change data
     * @throws IllegalArgumentException if current password is incorrect
     */
    @Transactional
    public void changePassword(UUID id, ChangePasswordDTO passwordDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Verify current password
        if (!passwordEncoder.matches(passwordDTO.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Das aktuelle Passwort ist falsch");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(passwordDTO.getNewPassword()));
        userRepository.save(user);
    }
}


