package com.dsaviz.controller;

import com.dsaviz.dto.ChallengeProgressRequest;
import com.dsaviz.dto.ProgressResponse;
import com.dsaviz.security.AuthPrincipal;
import com.dsaviz.service.ProgressService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public ResponseEntity<ProgressResponse> getProgress(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(progressService.getProgress(principal));
    }

    @PostMapping("/visualizer/{algorithmId}")
    public ResponseEntity<Void> completeVisualizer(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable @NotBlank @Size(max = 120) String algorithmId) {
        progressService.completeVisualizer(principal, algorithmId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/challenge")
    public ResponseEntity<Void> completeChallenge(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody ChallengeProgressRequest request) {
        progressService.completeChallenge(principal, request.challengeId());
        return ResponseEntity.noContent().build();
    }
}
