package com.dsaviz.service;

import com.dsaviz.dto.ProgressResponse;
import com.dsaviz.entity.ProgressType;
import com.dsaviz.entity.User;
import com.dsaviz.entity.UserProgress;
import com.dsaviz.exception.ForbiddenException;
import com.dsaviz.exception.UnauthorizedException;
import com.dsaviz.repository.UserProgressRepository;
import com.dsaviz.repository.UserRepository;
import com.dsaviz.security.AuthPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;

    public ProgressService(UserRepository userRepository, UserProgressRepository progressRepository) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
    }

    @Transactional(readOnly = true)
    public ProgressResponse getProgress(AuthPrincipal principal) {
        getUser(principal);
        return ProgressResponse.from(progressRepository.findAllByUserId(principal.id()));
    }

    @Transactional
    public void completeVisualizer(AuthPrincipal principal, String algorithmId) {
        recordCompletion(principal, ProgressType.VISUALIZER, algorithmId);
    }

    @Transactional
    public void completeChallenge(AuthPrincipal principal, String challengeId) {
        recordCompletion(principal, ProgressType.CHALLENGE, challengeId);
    }

    private void recordCompletion(AuthPrincipal principal, ProgressType type, String itemId) {
        User user = userRepository.findByIdForUpdate(principal.id())
                .orElseThrow(() -> new UnauthorizedException("Account no longer exists"));
        if (!user.isEnabled()) {
            throw new ForbiddenException("This account has been disabled.");
        }
        if (progressRepository.findByUserIdAndTypeAndItemId(principal.id(), type, itemId).isPresent()) {
            return;
        }

        UserProgress progress = new UserProgress();
        progress.setUser(user);
        progress.setType(type);
        progress.setItemId(itemId);
        progressRepository.save(progress);
    }

    private User getUser(AuthPrincipal principal) {
        User user = userRepository.findById(principal.id())
                .orElseThrow(() -> new UnauthorizedException("Account no longer exists"));
        if (!user.isEnabled()) {
            throw new ForbiddenException("This account has been disabled.");
        }
        return user;
    }
}
