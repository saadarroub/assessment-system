package com.assessment.backend.security.reset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetConfirmDto(
    @NotBlank String requestId,
    @NotBlank @Size(min = 8, max = 200) String newPassword
) {}
