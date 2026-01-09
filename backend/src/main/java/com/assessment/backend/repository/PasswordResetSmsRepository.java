package com.assessment.backend.repository;

import com.assessment.backend.security.reset.PasswordResetSmsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetSmsRepository extends JpaRepository<PasswordResetSmsEntity, UUID> {
  Optional<PasswordResetSmsEntity> findTopByPhoneOrderByCreatedAtDesc(String phone);
}
