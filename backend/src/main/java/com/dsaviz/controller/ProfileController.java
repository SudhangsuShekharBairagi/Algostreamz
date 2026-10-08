package com.dsaviz.controller;

import com.dsaviz.dto.ChangePasswordRequest;
import com.dsaviz.dto.DeleteAccountRequest;
import com.dsaviz.dto.ProfileUpdateRequest;
import com.dsaviz.dto.UserResponse;
import com.dsaviz.security.AuthPrincipal;
import com.dsaviz.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal));
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(principal, request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(principal, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody DeleteAccountRequest request) {
        profileService.deleteAccount(principal, request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}