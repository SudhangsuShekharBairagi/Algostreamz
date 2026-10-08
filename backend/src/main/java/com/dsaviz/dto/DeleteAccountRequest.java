package com.dsaviz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeleteAccountRequest(
        @NotBlank(message = "password is required") @Size(max = 72, message = "password must be at most 72 characters") String password) {
}