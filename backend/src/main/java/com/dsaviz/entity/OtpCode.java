package com.dsaviz.entity;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * A single issued one-time password.
 *
 * The plaintext code is never persisted: only its SHA-256 digest is stored, so a
 * database leak cannot be replayed as a valid login. Rows are single-use and are
 * invalidated by {@code consumedAt} or by exhausting {@code attempts}.
 */
@Entity
@Table(name = "otp_codes", indexes = {
        @Index(name = "idx_otp_email_purpose", columnList = "email,purpose"),
        @Index(name = "idx_otp_expires_at", columnList = "expiresAt")
})
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 320)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OtpPurpose purpose;

    /** Lowercase hex SHA-256 of the plaintext code, peppered with the server secret. */
    @Column(nullable = false, length = 64)
    private String codeHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private int maxAttempts = 5;

    private Instant consumedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(length = 64)
    private String requestedByIp;

    public boolean isConsumed() {
        return consumedAt != null;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isLocked() {
        return attempts >= maxAttempts;
    }

    /** True when this code can still be redeemed. */
    public boolean isUsable() {
        return !isConsumed() && !isExpired() && !isLocked();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public OtpPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(OtpPurpose purpose) {
        this.purpose = purpose;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public void setCodeHash(String codeHash) {
        this.codeHash = codeHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public Instant getConsumedAt() {
        return consumedAt;
    }

    public void setConsumedAt(Instant consumedAt) {
        this.consumedAt = consumedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getRequestedByIp() {
        return requestedByIp;
    }

    public void setRequestedByIp(String requestedByIp) {
        this.requestedByIp = requestedByIp;
    }
}
