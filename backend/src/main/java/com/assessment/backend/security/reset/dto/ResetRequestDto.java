package com.assessment.backend.security.reset.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetRequestDto(@NotBlank String phone) {}
