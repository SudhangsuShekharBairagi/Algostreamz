package com.dsaviz.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordResetRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid address")
        @Size(max = 320)
        String email,

        @NotBlank(message = "code is required")
        @Pattern(regexp = "\\d{6}", message = "code must be 6 digits")
        String code,

        @NotBlank(message = "new password is required")
        @Size(min = 8, max = 72, message = "new password must be between 8 and 72 characters")
        String newPassword
) {
}
