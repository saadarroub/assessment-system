package com.assessment.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "question_type")
public class QuestionType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "input_type", nullable = false)
    private String inputType;

    @Column(name = "has_options", nullable = false)
    private Boolean hasOptions = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Constructors
    public QuestionType() {
    }

    // Getters only (keine Setters für Production Data)
    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getInputType() {
        return inputType;
    }

    public Boolean getHasOptions() {
        return hasOptions;
    }

    public String getDescription() {
        return description;
    }
}
