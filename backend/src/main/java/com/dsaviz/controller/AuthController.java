package com.dsaviz.controller;

import com.dsaviz.dto.AuthResponse;
import com.dsaviz.dto.LoginRequest;
import com.dsaviz.dto.MessageResponse;
import com.dsaviz.dto.RegisterRequest;
import com.dsaviz.dto.ResendOtpRequest;
import com.dsaviz.dto.UserResponse;
import com.dsaviz.dto.VerifyEmailRequest;
import com.dsaviz.security.AuthPrincipal;
import com.dsaviz.service.AuthService;
import com.dsaviz.util.ClientIpResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

/**
 * Email + password accounts, gated by a one-time code sent over SMTP.
 *
 * Contract documented in {@code docs/auth-api.md}. All responses share one error shape:
 * {@code {timestamp, status, error, message, path, fieldErrors}}.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** Deliberately identical for "unknown", "already verified" and "too soon". */
    private static final String GENERIC_EMAIL_SENT =
            "If that address needs a code, one is on its way.";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request,
                                                     HttpServletRequest servletRequest) {
        authService.register(request, ClientIpResolver.resolve(servletRequest));
        return ResponseEntity
                .created(URI.create("/api/auth/me"))
                .body(new MessageResponse(GENERIC_EMAIL_SENT));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody ResendOtpRequest request,
                                                              HttpServletRequest servletRequest) {
        authService.resendVerificationEmail(request.email(), ClientIpResolver.resolve(servletRequest));
        return ResponseEntity.accepted().body(new MessageResponse(GENERIC_EMAIL_SENT));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/otp/request")
    public ResponseEntity<MessageResponse> requestLoginOtp(@Valid @RequestBody ResendOtpRequest request,
                                                           HttpServletRequest servletRequest) {
        authService.requestLoginOtp(request.email(), ClientIpResolver.resolve(servletRequest));
        return ResponseEntity.accepted().body(new MessageResponse(GENERIC_EMAIL_SENT));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<AuthResponse> verifyLoginOtp(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyLoginOtp(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(authService.currentUser(principal));
    }

    /**
     * Tokens are stateless, so there is no server-side session to destroy. This endpoint
     * exists to give the frontend one call to make on sign-out, and to leave room for a
     * denylist later without changing the client.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
