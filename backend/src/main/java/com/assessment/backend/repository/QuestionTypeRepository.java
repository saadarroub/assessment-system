package com.assessment.backend.repository;

import com.assessment.backend.entity.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionTypeRepository extends JpaRepository<QuestionType, UUID> {
    
    // Find by name
    Optional<QuestionType> findByName(String name);
    
    // Find by input type
    Optional<QuestionType> findByInputType(String inputType);
    
    // Find all with options
    Optional<QuestionType> findByHasOptions(Boolean hasOptions);
}
