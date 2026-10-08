package com.dsaviz;

import com.dsaviz.dto.ChangePasswordRequest;
import com.dsaviz.dto.DeleteAccountRequest;
import com.dsaviz.dto.ProfileUpdateRequest;
import com.dsaviz.entity.User;
import com.dsaviz.repository.OtpCodeRepository;
import com.dsaviz.repository.UserRepository;
import com.dsaviz.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileFlowTests {

    private static final String PASSWORD = "current-password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JavaMailSender mailSender;

    @BeforeEach
    void reset() {
        otpCodeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void authenticatedUserCanViewProfileWithoutSensitiveFields() throws Exception {
        Account account = createAccount("ada@example.com");
        User user = userRepository.findById(account.userId()).orElseThrow();
        user.setDisplayName("Ada Lovelace");
        user.setBio("Learning algorithms");
        user.setCollege("Analytical Engine Institute");
        user.setStudyYear(2);
        user.setLocation("London");
        userRepository.save(user);

        mockMvc.perform(get("/api/profile").header("Authorization", bearer(account.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(account.userId()))
                .andExpect(jsonPath("$.email").value("ada@example.com"))
                .andExpect(jsonPath("$.displayName").value("Ada Lovelace"))
                .andExpect(jsonPath("$.bio").value("Learning algorithms"))
                .andExpect(jsonPath("$.college").value("Analytical Engine Institute"))
                .andExpect(jsonPath("$.studyYear").value(2))
                .andExpect(jsonPath("$.location").value("London"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.otp").doesNotExist());
    }

    @Test
    void updateUsesJwtUserAndCannotChangeEmailOrAnotherAccount() throws Exception {
        Account caller = createAccount("caller@example.com");
        Account other = createAccount("other@example.com");
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "Caller Name", "A profile bio", "https://example.com/avatar.png", "Example College", 3, "Oslo");

        mockMvc.perform(put("/api/profile")
                .header("Authorization", bearer(caller.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caller.userId()))
                .andExpect(jsonPath("$.email").value("caller@example.com"))
                .andExpect(jsonPath("$.displayName").value("Caller Name"));

        assertThat(userRepository.findById(other.userId()).orElseThrow().getDisplayName()).isNull();
        assertThat(userRepository.findById(caller.userId()).orElseThrow().getEmail()).isEqualTo("caller@example.com");
    }

    @Test
    void updateRejectsInvalidProfileFields() throws Exception {
        Account account = createAccount("validation@example.com");
        ProfileUpdateRequest invalid = new ProfileUpdateRequest(
                "x".repeat(81), "x".repeat(501), "javascript:alert(1)", "x".repeat(121), 0, "x".repeat(121));

        mockMvc.perform(put("/api/profile")
                .header("Authorization", bearer(account.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.displayName").exists())
                .andExpect(jsonPath("$.fieldErrors.avatarUrl").exists())
                .andExpect(jsonPath("$.fieldErrors.studyYear").exists());
    }

    @Test
    void passwordChangeChecksCurrentPasswordAndConfirmation() throws Exception {
        Account account = createAccount("password@example.com");

        mockMvc.perform(put("/api/profile/password")
                .header("Authorization", bearer(account.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ChangePasswordRequest("wrong-password", "new-password", "new-password"))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/profile/password")
                .header("Authorization", bearer(account.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ChangePasswordRequest(PASSWORD, "new-password", "different-password"))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/profile/password")
                .header("Authorization", bearer(account.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ChangePasswordRequest(PASSWORD, "new-password", "new-password"))))
                .andExpect(status().isNoContent());

        User changed = userRepository.findById(account.userId()).orElseThrow();
        assertThat(passwordEncoder.matches("new-password", changed.getPasswordHash())).isTrue();
        assertThat(changed.getPasswordHash()).isNotEqualTo("new-password");
    }

    @Test
    void deleteRequiresPasswordConfirmationAndRemovesOnlyCurrentAccount() throws Exception {
        Account caller = createAccount("delete@example.com");
        Account other = createAccount("keep@example.com");

        mockMvc.perform(delete("/api/profile")
                .header("Authorization", bearer(caller.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new DeleteAccountRequest("wrong-password"))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/profile")
                .header("Authorization", bearer(caller.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new DeleteAccountRequest(PASSWORD))))
                .andExpect(status().isNoContent());

        assertThat(userRepository.existsById(caller.userId())).isFalse();
        assertThat(userRepository.existsById(other.userId())).isTrue();
    }

    @Test
    void everyProfileEndpointRejectsUnauthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/profile")).andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/profile").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ProfileUpdateRequest(null, null, null, null, null, null))))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/profile/password").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper
                        .writeValueAsString(new ChangePasswordRequest(PASSWORD, "new-password", "new-password"))))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/profile").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new DeleteAccountRequest(PASSWORD))))
                .andExpect(status().isUnauthorized());
    }

    private Account createAccount(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setEmailVerified(true);
        User saved = userRepository.save(user);
        return new Account(saved.getId(), jwtService.issue(saved));
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private record Account(Long userId, String token) {
    }
}