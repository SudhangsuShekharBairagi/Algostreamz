package com.dsaviz.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(max = 80, message = "display name must be at most 80 characters") String displayName,

        @Size(max = 500, message = "bio must be at most 500 characters") String bio,

        @Size(max = 2048, message = "avatar URL must be at most 2048 characters") @Pattern(regexp = "^https?://[^\\s]+$", message = "avatar URL must use http or https") String avatarUrl,

        @Size(max = 120, message = "college must be at most 120 characters") String college,

        @Min(value = 1, message = "study year must be between 1 and 12") @Max(value = 12, message = "study year must be between 1 and 12") Integer studyYear,

        @Size(max = 120, message = "location must be at most 120 characters") String location) {
}