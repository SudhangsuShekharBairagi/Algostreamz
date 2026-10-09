package com.dsaviz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChallengeProgressRequest(
        @NotBlank @Size(max = 120) String challengeId) {
}
