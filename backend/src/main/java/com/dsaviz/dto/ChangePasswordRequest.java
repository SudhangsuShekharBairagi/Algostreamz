package com.dsaviz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "current password is required") @Size(max = 72, message = "password must be at most 72 characters") String currentPassword,

        @NotBlank(message = "new password is required") @Size(min = 8, max = 72, message = "new password must be between 8 and 72 characters") String newPassword,

        @NotBlank(message = "password confirmation is required") @Size(min = 8, max = 72, message = "password confirmation must be between 8 and 72 characters") String confirmPassword) {
}