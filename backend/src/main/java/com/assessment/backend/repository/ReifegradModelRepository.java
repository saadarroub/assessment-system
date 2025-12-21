package com.assessment.backend.repository;

import com.assessment.backend.entity.ReifegradModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReifegradModelRepository
        extends JpaRepository<ReifegradModel, UUID> {
}
