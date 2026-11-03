package com.dsaviz;

import com.dsaviz.entity.User;
import com.dsaviz.repository.OtpCodeRepository;
import com.dsaviz.repository.UserRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers the password-reset path end to end: request a code, redeem it, and prove the new
 * password is the only one that works afterwards.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PasswordResetTests {

    private static final Pattern CODE = Pattern.compile("(?<!\\d)(\\d{6})(?!\\d)");
    private static final String PASSWORD = "correct-horse-battery";
    private static final String NEW_PASSWORD = "a-brand-new-password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @MockBean
    private JavaMailSender mailSender;

    @BeforeEach
    void reset() {
        otpCodeRepository.deleteAll();
        userRepository.deleteAll();
        when(mailSender.createMimeMessage())
                .thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void resetCodeReplacesThePasswordAndSignsIn() throws Exception {
        verifyAccount("ada@example.com");

        mockMvc.perform(post("/api/auth/password/forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ada@example.com"}""")))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").isNotEmpty());

        String resetCode = capturedCode();

        mockMvc.perform(post("/api/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ada@example.com","code":"%s","newPassword":"%s"}"""
                                .formatted(resetCode, NEW_PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("ada@example.com"));

        // The old password must be dead, the new one alive.
        login("ada@example.com", PASSWORD).andExpect(status().isUnauthorized());
        login("ada@example.com", NEW_PASSWORD).andExpect(status().isOk());

        User stored = userRepository.findByEmailIgnoreCase("ada@example.com").orElseThrow();
        assertThat(stored.getPasswordHash()).isNotEqualTo(PASSWORD);
    }

    @Test
    void resetCodeIsSingleUse() throws Exception {
        verifyAccount("grace@example.com");
        requestReset("grace@example.com");
        String resetCode = capturedCode();

        reset("grace@example.com", resetCode, NEW_PASSWORD).andExpect(status().isOk());

        // Replaying the spent code must not change the password again.
        reset("grace@example.com", resetCode, "another-new-password")
                .andExpect(status().isBadRequest());

        login("grace@example.com", NEW_PASSWORD).andExpect(status().isOk());
    }

    @Test
    void unknownAddressStillReportsSuccessAndSendsNothing() throws Exception {
        mockMvc.perform(post("/api/auth/password/forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ghost@example.com"}""")))
                .andExpect(status().isAccepted());

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void wrongCodeDoesNotChangeThePassword() throws Exception {
        verifyAccount("edsger@example.com");
        requestReset("edsger@example.com");
        String resetCode = capturedCode();
        String wrong = resetCode.equals("000000") ? "111111" : "000000";

        reset("edsger@example.com", wrong, NEW_PASSWORD).andExpect(status().isBadRequest());

        login("edsger@example.com", PASSWORD).andExpect(status().isOk());
    }

    @Test
    void validationRejectsAShortNewPassword() throws Exception {
        verifyAccount("barbara@example.com");
        requestReset("barbara@example.com");
        String resetCode = capturedCode();

        reset("barbara@example.com", resetCode, "short")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.newPassword").exists());

        login("barbara@example.com", PASSWORD).andExpect(status().isOk());
    }

    private void verifyAccount(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"%s","password":"%s"}""".formatted(email, PASSWORD))))
                .andExpect(status().isCreated());

        String code = capturedCode();
        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"%s","code":"%s"}""".formatted(email, code))))
                .andExpect(status().isOk());
    }

    private void requestReset(String email) throws Exception {
        mockMvc.perform(post("/api/auth/password/forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"%s"}""".formatted(email))))
                .andExpect(status().isAccepted());
    }

    private ResultActions reset(String email, String code, String newPassword) throws Exception {
        return mockMvc.perform(post("/api/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("""
                        {"email":"%s","code":"%s","newPassword":"%s"}"""
                        .formatted(email, code, newPassword))));
    }

    private ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("""
                        {"email":"%s","password":"%s"}""".formatted(email, password))));
    }

    /** Reads the code out of the most recent message handed to the fake sender. */
    private String capturedCode() throws Exception {
        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, atLeastOnce()).send(captor.capture());
        List<MimeMessage> sent = captor.getAllValues();
        String body = String.valueOf(sent.get(sent.size() - 1).getContent());

        Matcher matcher = CODE.matcher(body);
        assertThat(matcher.find()).as("no 6-digit code found in email body: %s", body).isTrue();
        return matcher.group(1);
    }

    private String json(String body) {
        return body.strip();
    }
}
