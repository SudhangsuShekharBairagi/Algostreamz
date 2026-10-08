package com.dsaviz.dto;

import com.dsaviz.entity.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String email,
        boolean emailVerified,
        String displayName,
        String bio,
        String avatarUrl,
        String college,
        Integer studyYear,
        String location,
        Instant createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.isEmailVerified(),
                user.getDisplayName(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCollege(),
                user.getStudyYear(),
                user.getLocation(),
                user.getCreatedAt());
    }
}
