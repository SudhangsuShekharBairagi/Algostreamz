package com.dsaviz.dto;

import com.dsaviz.entity.ProgressType;
import com.dsaviz.entity.UserProgress;

import java.util.List;

public record ProgressResponse(
        List<String> completedVisualizers,
        List<String> masteredChallenges) {

    public static ProgressResponse from(List<UserProgress> progress) {
        List<String> visualizers = progress.stream()
                .filter(item -> item.getType() == ProgressType.VISUALIZER)
                .map(UserProgress::getItemId)
                .sorted()
                .toList();
        List<String> challenges = progress.stream()
                .filter(item -> item.getType() == ProgressType.CHALLENGE)
                .map(UserProgress::getItemId)
                .sorted()
                .toList();
        return new ProgressResponse(visualizers, challenges);
    }
}
