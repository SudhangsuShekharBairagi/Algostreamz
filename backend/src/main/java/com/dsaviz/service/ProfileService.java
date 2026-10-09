package com.dsaviz.service;

import com.dsaviz.dto.ChangePasswordRequest;
import com.dsaviz.dto.DeleteAccountRequest;
import com.dsaviz.dto.ProfileUpdateRequest;
import com.dsaviz.dto.UserResponse;
import com.dsaviz.entity.User;
import com.dsaviz.exception.BadRequestException;
import com.dsaviz.exception.ForbiddenException;
import com.dsaviz.exception.UnauthorizedException;
import com.dsaviz.repository.OtpCodeRepository;
import com.dsaviz.repository.UserProgressRepository;
import com.dsaviz.repository.UserRepository;
import com.dsaviz.security.AuthPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final UserProgressRepository progressRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(UserRepository userRepository,
            OtpCodeRepository otpCodeRepository,
            UserProgressRepository progressRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpCodeRepository = otpCodeRepository;
        this.progressRepository = progressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(AuthPrincipal principal) {
        return UserResponse.from(getUser(principal));
    }

    @Transactional
    public UserResponse updateProfile(AuthPrincipal principal, ProfileUpdateRequest request) {
        User user = getUser(principal);
        user.setDisplayName(normalise(request.displayName()));
        user.setBio(normalise(request.bio()));
        user.setAvatarUrl(normalise(request.avatarUrl()));
        user.setCollege(normalise(request.college()));
        user.setStudyYear(request.studyYear());
        user.setLocation(normalise(request.location()));
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(AuthPrincipal principal, ChangePasswordRequest request) {
        User user = getUser(principal);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("New password confirmation does not match.");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the current password.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(AuthPrincipal principal, DeleteAccountRequest request) {
        User user = getUser(principal);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Password is incorrect.");
        }
        otpCodeRepository.deleteAllByEmailIgnoreCase(user.getEmail());
        progressRepository.deleteAllByUserId(user.getId());
        userRepository.delete(user);
    }

    private User getUser(AuthPrincipal principal) {
        User user = userRepository.findById(principal.id())
                .orElseThrow(() -> new UnauthorizedException("Account no longer exists"));
        if (!user.isEnabled()) {
            throw new ForbiddenException("This account has been disabled.");
        }
        return user;
    }

    private static String normalise(String value) {
        if (value == null)
            return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}