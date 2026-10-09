package com.dsaviz.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "user_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_progress_user_type_item",
                columnNames = { "user_id", "progress_type", "item_id" })
}, indexes = {
        @Index(name = "idx_user_progress_user", columnList = "user_id")
})
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_type", nullable = false, length = 16)
    private ProgressType type;

    @Column(name = "item_id", nullable = false, length = 120)
    private String itemId;

    @Column(nullable = false, updatable = false)
    private Instant completedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ProgressType getType() {
        return type;
    }

    public void setType(ProgressType type) {
        this.type = type;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
