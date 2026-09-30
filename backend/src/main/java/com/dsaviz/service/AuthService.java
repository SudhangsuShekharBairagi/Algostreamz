package com.dsaviz.service;

import com.dsaviz.dto.AuthResponse;
import com.dsaviz.dto.LoginRequest;
import com.dsaviz.dto.RegisterRequest;
import com.dsaviz.dto.UserResponse;
import com.dsaviz.dto.VerifyEmailRequest;
import com.dsaviz.entity.OtpPurpose;
import com.dsaviz.entity.User;
import com.dsaviz.exception.BadRequestException;
import com.dsaviz.exception.ConflictException;
import com.dsaviz.exception.ForbiddenException;
import com.dsaviz.exception.UnauthorizedException;
import com.dsaviz.repository.UserRepository;
import com.dsaviz.security.AuthPrincipal;
import com.dsaviz.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Registration, email verification, and the two ways into a session
 * (password, or one-time code).
 *
 * Deliberately NOT annotated {@code @Transactional} on the verification methods. If it
 * were, the OTP's {@code noRollbackFor} rule would be ignored in favour of the outer
 * transaction's, and every rejected code guess would roll its own attempt counter back.
 * Letting each repository call commit on its own keeps the counters honest.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpCodeService otpCodeService;
    private final JwtService jwtService;

    /**
     * A throwaway hash so a login attempt for an unknown address still pays the full BCrypt
     * cost. Without it, response timing reveals which emails are registered.
     */
    private final String decoyHash;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       OtpCodeService otpCodeService,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpCodeService = otpCodeService;
        this.jwtService = jwtService;
        this.decoyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    /**
     * Creates the account and emails the verification code as one unit: if the mail
     * cannot be sent the whole registration rolls back, so nobody is left holding an
     * account they can never verify.
     */
    @Transactional
    public void register(RegisterRequest request, String clientIp) {
        String email = normalise(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists. Try signing in.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        otpCodeService.issueAndSend(email, OtpPurpose.EMAIL_VERIFICATION, clientIp);
        log.info("Registered account id={} email={}", user.getId(), user.getEmail());
    }

    /** Consumes the emailed code and, on success, returns a session immediately. */
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        String email = normalise(request.email());
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException(
                        "No active code for this email. Request a new one."));

        otpCodeService.verify(user.getEmail(), OtpPurpose.EMAIL_VERIFICATION, request.code());

        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Verified email for account id={}", user.getId());

        return sessionFor(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalise(request.email());
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        String hash = user != null ? user.getPasswordHash() : decoyHash;
        boolean passwordMatches = passwordEncoder.matches(request.password(), hash);

        if (user == null || !passwordMatches) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!user.isEmailVerified()) {
            throw new ForbiddenException("Verify your email address before signing in.");
        }
        if (!user.isEnabled()) {
            throw new ForbiddenException("This account has been disabled.");
        }

        return sessionFor(user);
    }

    /**
     * Emails a sign-in code. Always reports success, whether or not the address belongs to
     * a verified account - otherwise this endpoint becomes an account-enumeration oracle.
     */
    public void requestLoginOtp(String rawEmail, String clientIp) {
        String email = normalise(rawEmail);
        userRepository.findByEmailIgnoreCase(email)
                .filter(User::isEmailVerified)
                .filter(User::isEnabled)
                .ifPresentOrElse(
                        user -> otpCodeService.issueAndSend(user.getEmail(), OtpPurpose.LOGIN, clientIp),
                        () -> log.debug("Sign-in code requested for an address with no usable account"));
    }

    public AuthResponse verifyLoginOtp(VerifyEmailRequest request) {
        String email = normalise(request.email());
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException(
                        "No active code for this email. Request a new one."));

        otpCodeService.verify(user.getEmail(), OtpPurpose.LOGIN, request.code());

        if (!user.isEnabled()) {
            throw new ForbiddenException("This account has been disabled.");
        }
        log.info("Sign-in code accepted for account id={}", user.getId());

        return sessionFor(user);
    }

    /** Always reports success, for the same anti-enumeration reason as requestLoginOtp. */
    public void resendVerificationEmail(String rawEmail, String clientIp) {
        String email = normalise(rawEmail);
        userRepository.findByEmailIgnoreCase(email)
                .filter(user -> !user.isEmailVerified())
                .ifPresent(user -> otpCodeService.issueAndSend(
                        user.getEmail(), OtpPurpose.EMAIL_VERIFICATION, clientIp));
    }

    /** Re-reads the user so a stale token cannot outlive a disabled account. */
    public UserResponse currentUser(AuthPrincipal principal) {
        User user = userRepository.findById(principal.id())
                .orElseThrow(() -> new UnauthorizedException("Account no longer exists"));
        if (!user.isEnabled()) {
            throw new ForbiddenException("This account has been disabled.");
        }
        return UserResponse.from(user);
    }

    private AuthResponse sessionFor(User user) {
        String token = jwtService.issue(user);
        return AuthResponse.bearer(token, jwtService.getExpirationMs(), UserResponse.from(user));
    }

    private static String normalise(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
