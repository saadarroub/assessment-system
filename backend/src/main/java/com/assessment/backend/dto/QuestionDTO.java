package com.assessment.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import com.assessment.backend.entity.QuestionType;

public record QuestionDTO(

    UUID id,
    String text,
    QuestionType questionType,
    String options,
    String scoringSchema,
    LocalDateTime createdAt,
    LocalDateTime updatedAt

) {
}
