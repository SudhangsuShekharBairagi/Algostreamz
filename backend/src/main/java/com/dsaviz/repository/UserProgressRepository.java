package com.dsaviz.repository;

import com.dsaviz.entity.ProgressType;
import com.dsaviz.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findAllByUserId(Long userId);

    Optional<UserProgress> findByUserIdAndTypeAndItemId(Long userId, ProgressType type, String itemId);

    void deleteAllByUserId(Long userId);
}
