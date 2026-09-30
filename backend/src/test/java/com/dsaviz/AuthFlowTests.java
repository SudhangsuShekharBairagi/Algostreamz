package com.dsaviz;

import com.dsaviz.entity.User;
import com.dsaviz.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import org.springframework.test.web.servlet.MvcResult;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowTests {

    private static final Pattern CODE = Pattern.compile("(?<!\\d)(\\d{6})(?!\\d)");
    private static final String PASSWORD = "correct-horse-battery";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JavaMailSender mailSender;

    @BeforeEach
    void reset() {
        userRepository.deleteAll();
        // Hand back real MimeMessages so the send path is genuinely exercised, while
        // keeping the SMTP conversation in-process.
        when(mailSender.createMimeMessage())
                .thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void registerThenVerifyThenUseToken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"Ada@Example.com","password":"%s"}""".formatted(PASSWORD))))
                .andExpect(status().isCreated());

        User stored = userRepository.findByEmailIgnoreCase("ada@example.com").orElseThrow();
        assertThat(stored.isEmailVerified()).isFalse();
        assertThat(stored.getPasswordHash()).isNotEqualTo(PASSWORD);

        String code = capturedCode();

        // Unverified accounts cannot sign in yet.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ada@example.com","password":"%s"}""".formatted(PASSWORD))))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ada@example.com","code":"000000"}""")))
                .andExpect(status().isBadRequest());

        MvcResult verified = mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ada@example.com","code":"%s"}""".formatted(code))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.emailVerified").value(true))
                .andReturn();

        String token = body(verified).get("token").asText();
        assertThat(token).isNotBlank();
        assertThat(userRepository.findByEmailIgnoreCase("ada@example.com").orElseThrow().isEmailVerified())
                .isTrue();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ada@example.com","password":"%s"}""".formatted(PASSWORD))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ada@example.com"));
    }

    @Test
    void protectedEndpointRejectsMissingAndForgedTokens() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer not.a.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unknownEmailAndWrongPasswordAreIndistinguishable() throws Exception {
        register("grace@example.com", PASSWORD);

        String unknown = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"nobody@example.com","password":"whatever-password"}""")))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        String wrongPassword = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"grace@example.com","password":"wrong-password-here"}""")))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        // Identical apart from the timestamp: the endpoint must not reveal which emails
        // are registered. (The cost of the BCrypt check is equalised elsewhere.)
        assertThat(withoutTimestamp(unknown)).isEqualTo(withoutTimestamp(wrongPassword));
    }

    @Test
    void duplicateRegistrationConflicts() throws Exception {
        register("alan@example.com", PASSWORD);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"alan@example.com","password":"another-password"}""")))
                .andExpect(status().isConflict());
    }

    @Test
    void resendIsRateLimitedByCooldown() throws Exception {
        register("edsger@example.com", PASSWORD);

        // Registration already consumed the cooldown window, so an immediate "resend" -
        // the click someone makes when the first email looks lost - is already refused.
        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"edsger@example.com"}""")))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void resendForUnknownAddressStillReportsSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"ghost@example.com"}""")))
                .andExpect(status().isAccepted());

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void passwordlessSignInWithSingleUseCode() throws Exception {
        register("barbara@example.com", PASSWORD);
        String verifyCode = capturedCode();

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"barbara@example.com","code":"%s"}""".formatted(verifyCode))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/otp/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"barbara@example.com"}""")))
                .andExpect(status().isAccepted());

        String loginCode = capturedCode();
        assertThat(loginCode).isNotEqualTo(verifyCode);

        mockMvc.perform(post("/api/auth/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"barbara@example.com","code":"%s"}""".formatted(loginCode))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        // Replaying a spent code must fail.
        mockMvc.perform(post("/api/auth/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"barbara@example.com","code":"%s"}""".formatted(loginCode))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validationRejectsMalformedInput() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"not-an-email","password":"short"}""")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    private void register(String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("""
                                {"email":"%s","password":"%s"}""".formatted(email, password))))
                .andExpect(status().isCreated());
    }

    /**
     * Reads the code out of the most recent message handed to the fake sender, so the real
     * generation and rendering path runs rather than a stubbed value.
     */
    private String capturedCode() throws Exception {
        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, atLeastOnce()).send(captor.capture());
        List<MimeMessage> sent = captor.getAllValues();
        String body = String.valueOf(sent.get(sent.size() - 1).getContent());

        Matcher matcher = CODE.matcher(body);
        assertThat(matcher.find()).as("no 6-digit code found in email body: %s", body).isTrue();
        return matcher.group(1);
    }

    /** JSON ignores whitespace, so text blocks can be passed through as-is. */
    private String json(String body) {
        return body.strip();
    }

    private JsonNode body(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    /** Drops the one field that legitimately differs between two otherwise equal errors. */
    private String withoutTimestamp(String json) throws Exception {
        ObjectNode node = (ObjectNode) objectMapper.readTree(json);
        node.remove("timestamp");
        return node.toString();
    }
}
