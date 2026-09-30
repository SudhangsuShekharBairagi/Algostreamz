package com.dsaviz.service;

import com.dsaviz.config.OtpProperties;
import com.dsaviz.entity.OtpCode;
import com.dsaviz.entity.OtpPurpose;
import com.dsaviz.exception.BadRequestException;
import com.dsaviz.exception.TooManyRequestsException;
import com.dsaviz.repository.OtpCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class OtpCodeService {

    private static final Logger log = LoggerFactory.getLogger(OtpCodeService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Fixed at 6 digits and intentionally not configurable: the value is mirrored by the
     * {@code @Pattern} on the verify DTOs, and a mismatched pair would reject every code.
     */
    private static final int CODE_LENGTH = 6;
    private static final int CODE_BOUND = 1_000_000;

    private final OtpCodeRepository otpCodeRepository;
    private final EmailService emailService;
    private final OtpProperties properties;

    public OtpCodeService(OtpCodeRepository otpCodeRepository,
                          EmailService emailService,
                          OtpProperties properties) {
        this.otpCodeRepository = otpCodeRepository;
        this.emailService = emailService;
        this.properties = properties;
    }

    /**
     * Rate-limits, burns any previous code, emails a fresh one and stores its digest.
     *
     * The send happens inside this transaction on purpose: if the relay rejects the
     * message we want the whole thing - row included - rolled back, rather than leaving a
     * code in the database that the user never received.
     *
     * @return never, the code travels only to the email.
     */
    @Transactional
    public void issueAndSend(String email, OtpPurpose purpose, String clientIp) {
        String normalised = email.trim().toLowerCase();
        Instant now = Instant.now();

        enforceSendLimits(normalised, purpose, clientIp, now);

        // Burn older codes so a leaked earlier email stops working the moment we resend.
        otpCodeRepository.invalidateOutstanding(normalised, purpose, now);

        String plaintext = generateCode();

        OtpCode code = new OtpCode();
        code.setEmail(normalised);
        code.setPurpose(purpose);
        code.setCodeHash(hash(plaintext));
        code.setExpiresAt(now.plus(Duration.ofMinutes(properties.getTtlMinutes())));
        code.setMaxAttempts(properties.getMaxAttempts());
        code.setCreatedAt(now);
        code.setRequestedByIp(clientIp);
        otpCodeRepository.save(code);

        emailService.sendOtpEmail(normalised, plaintext, properties.getTtlMinutes(), purpose == OtpPurpose.LOGIN);
    }

    /**
     * Redeems a code.
     *
     * {@code noRollbackFor} is essential: each wrong guess must persist its attempt
     * counter even though we throw. Without it the transaction would roll back and the
     * code would stay brute-forceable.
     */
    @Transactional(noRollbackFor = BadRequestException.class)
    public void verify(String email, OtpPurpose purpose, String plaintext) {
        String normalised = email.trim().toLowerCase();
        OtpCode code = otpCodeRepository
                .findFirstByEmailIgnoreCaseAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(normalised, purpose)
                .orElseThrow(() -> new BadRequestException(
                        "No active code for this email. Request a new one."));

        if (code.isExpired()) {
            burn(code);
            throw new BadRequestException("That code has expired. Request a new one.");
        }

        if (!matches(plaintext, code.getCodeHash())) {
            int attempts = code.getAttempts() + 1;
            code.setAttempts(attempts);
            if (attempts >= code.getMaxAttempts()) {
                burn(code);
                throw new BadRequestException("That code is not valid. Too many attempts - request a new code.");
            }
            throw new BadRequestException(
                    "That code is not valid. " + (code.getMaxAttempts() - attempts) + " attempt(s) remaining.");
        }

        burn(code);
    }

    private void enforceSendLimits(String email, OtpPurpose purpose, String clientIp, Instant now) {
        if (clientIp != null) {
            long perIp = otpCodeRepository.countByRequestedByIpAndCreatedAtAfter(
                    clientIp, now.minus(Duration.ofHours(1)));
            if (perIp >= properties.getMaxPerHourPerIp()) {
                log.warn("OTP rate limit hit for ip={} ({} in last hour)", clientIp, perIp);
                throw new TooManyRequestsException(
                        "Too many codes requested from this network. Try again later.");
            }
        }

        long perEmail = otpCodeRepository.countByEmailIgnoreCaseAndCreatedAtAfter(
                email, now.minus(Duration.ofHours(1)));
        if (perEmail >= properties.getMaxPerHourPerEmail()) {
            log.warn("OTP rate limit hit for an address ({} sends in last hour)", perEmail);
            throw new TooManyRequestsException(
                    "Too many codes requested for this email. Try again later.");
        }

        Instant cooldownStart = now.minus(Duration.ofSeconds(properties.getResendCooldownSeconds()));
        otpCodeRepository
                .findFirstByEmailIgnoreCaseAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(email, purpose)
                .filter(existing -> existing.getCreatedAt().isAfter(cooldownStart))
                .ifPresent(existing -> {
                    log.warn("OTP resend cooldown hit for purpose={}", purpose);
                    throw new TooManyRequestsException("Please wait "
                            + properties.getResendCooldownSeconds() + " seconds before requesting another code.");
                });
    }

    /** Keeps the table from growing without bound on a long-lived deployment. */
    @Scheduled(fixedDelayString = "${app.otp.cleanup-interval-ms:900000}")
    @Transactional
    public void purgeExpired() {
        int removed = otpCodeRepository.deleteExpired(Instant.now().minus(Duration.ofHours(1)));
        if (removed > 0) {
            log.info("Purged {} expired OTP rows", removed);
        }
    }

    private void burn(OtpCode code) {
        code.setConsumedAt(Instant.now());
    }

    private String generateCode() {
        // nextInt is rejection-sampled, so the digits stay uniform - no modulo bias.
        return String.format("%0" + CODE_LENGTH + "d", RANDOM.nextInt(CODE_BOUND));
    }

    private boolean matches(String plaintext, String expectedHash) {
        if (plaintext == null) {
            return false;
        }
        byte[] expected = expectedHash.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, hash(plaintext).getBytes(StandardCharsets.UTF_8));
    }

    private String hash(String plaintext) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest((properties.getPepper() + ":" + plaintext).getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is required but unavailable", ex);
        }
    }
}
