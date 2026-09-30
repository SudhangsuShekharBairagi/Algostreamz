package com.dsaviz;

import com.dsaviz.entity.OtpCode;
import com.dsaviz.repository.OtpCodeRepository;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers the case the default cooldown makes untestable: what happens to a code once a
 * newer one has been emailed. The cooldown is zeroed here so a resend can actually happen
 * inside a single test.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "app.otp.resend-cooldown-seconds=0",
        "app.otp.max-per-hour-per-email=50"
})
class OtpSupersedeTests {

    private static final Pattern CODE = Pattern.compile("(?<!\\d)(\\d{6})(?!\\d)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @MockBean
    private JavaMailSender mailSender;

    @BeforeEach
    void reset() {
        when(mailSender.createMimeMessage())
                .thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void issuingANewCodeRetiresThePrevious() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"linus@example.com","password":"correct-horse-battery"}"""))
                .andExpect(status().isCreated());
        String first = codeFromLastEmail();

        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"linus@example.com"}"""))
                .andExpect(status().isAccepted());
        String second = codeFromLastEmail();
        assertThat(second).isNotEqualTo(first);

        // The superseded code must no longer redeem.
        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"linus@example.com","code":"%s"}""".formatted(first)))
                .andExpect(status().isBadRequest());

        // The current one must.
        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"linus@example.com","code":"%s"}""".formatted(second)))
                .andExpect(status().isOk());
    }

    @Test
    void fiveWrongGuessesBurnTheCode() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"margaret@example.com","password":"correct-horse-battery"}"""))
                .andExpect(status().isCreated());
        String real = codeFromLastEmail();
        String wrong = real.equals("000000") ? "111111" : "000000";

        for (int attempt = 1; attempt <= 5; attempt++) {
            mockMvc.perform(post("/api/auth/verify-email")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"margaret@example.com","code":"%s"}""".formatted(wrong)))
                    .andExpect(status().isBadRequest());
        }

        // Locked out: the genuine code no longer works either.
        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"margaret@example.com","code":"%s"}""".formatted(real)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void codesAreNotStoredInPlaintext() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"donald@example.com","password":"correct-horse-battery"}"""))
                .andExpect(status().isCreated());
        String emailed = codeFromLastEmail();

        // A database dump must not be replayable as a valid login, so only a digest is kept.
        List<OtpCode> rows = otpCodeRepository.findAllByEmailIgnoreCaseAndConsumedAtIsNull("donald@example.com");
        assertThat(rows).hasSize(1);
        OtpCode stored = rows.get(0);

        assertThat(stored.getCodeHash()).isNotEqualTo(emailed).doesNotContain(emailed);
        assertThat(stored.getCodeHash()).matches("[0-9a-f]{64}");
    }

    private String codeFromLastEmail() throws Exception {
        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, atLeastOnce()).send(captor.capture());
        List<MimeMessage> sent = captor.getAllValues();
        String body = String.valueOf(sent.get(sent.size() - 1).getContent());

        Matcher matcher = CODE.matcher(body);
        assertThat(matcher.find()).as("no 6-digit code in: %s", body).isTrue();
        return matcher.group(1);
    }
}
