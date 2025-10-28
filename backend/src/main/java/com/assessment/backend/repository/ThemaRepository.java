package com.assessment.backend.repository;

import com.assessment.backend.entity.Thema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThemaRepository extends JpaRepository<Thema, UUID> {

    // Find by name (exact match)
    Optional<Thema> findByName(String name);

    // Find by name containing (partial match)
    List<Thema> findByNameContainingIgnoreCase(String name);

    // Check if exists by name
    boolean existsByName(String name);
}
