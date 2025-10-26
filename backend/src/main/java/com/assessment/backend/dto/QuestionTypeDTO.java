package com.assessment.backend.dto;

import java.util.UUID;

public record QuestionTypeDTO(

    UUID id,
    String name,
    String inputType,
    Boolean hasOptions,
    String description

) {
}
