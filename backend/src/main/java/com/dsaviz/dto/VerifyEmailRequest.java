package com.dsaviz.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid address")
        @Size(max = 320)
        String email,

        @NotBlank(message = "code is required")
        @Pattern(regexp = "\\d{6}", message = "code must be 6 digits")
        String code
) {
}
