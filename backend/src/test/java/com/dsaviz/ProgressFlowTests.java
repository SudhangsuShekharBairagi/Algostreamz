package com.dsaviz;

import com.dsaviz.entity.User;
import com.dsaviz.repository.UserProgressRepository;
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
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProgressFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JavaMailSender mailSender;

    @BeforeEach
    void reset() {
        progressRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void progressEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/progress"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/progress/visualizer/bubble-sort"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/progress/challenge")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"challengeId\":\"merge-step-1\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void visualizerAndChallengeCompletionsAreIdempotentAndPerUser() throws Exception {
        Account learner = createAccount("learner@example.com");
        Account other = createAccount("other@example.com");

        for (int attempt = 0; attempt < 2; attempt++) {
            mockMvc.perform(post("/api/progress/visualizer/bubble-sort")
                    .header("Authorization", bearer(learner.token())))
                    .andExpect(status().isNoContent());
            mockMvc.perform(post("/api/progress/challenge")
                    .header("Authorization", bearer(learner.token()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            new ChallengeRequest("merge-step-1"))))
                    .andExpect(status().isNoContent());
        }

        mockMvc.perform(get("/api/progress").header("Authorization", bearer(learner.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedVisualizers").isArray())
                .andExpect(jsonPath("$.completedVisualizers.length()").value(1))
                .andExpect(jsonPath("$.completedVisualizers[0]").value("bubble-sort"))
                .andExpect(jsonPath("$.masteredChallenges.length()").value(1))
                .andExpect(jsonPath("$.masteredChallenges[0]").value("merge-step-1"));

        mockMvc.perform(get("/api/progress").header("Authorization", bearer(other.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedVisualizers").isEmpty())
                .andExpect(jsonPath("$.masteredChallenges").isEmpty());
        assertThat(progressRepository.count()).isEqualTo(2);
    }

    @Test
    void challengeIdMustBeNonBlankAndWithinLimit() throws Exception {
        Account learner = createAccount("validation@example.com");

        mockMvc.perform(post("/api/progress/challenge")
                .header("Authorization", bearer(learner.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"challengeId\":\" \"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/progress/challenge")
                .header("Authorization", bearer(learner.token()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ChallengeRequest("x".repeat(121)))))
                .andExpect(status().isBadRequest());
    }

    private Account createAccount(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("not-used-by-this-test");
        user.setEmailVerified(true);
        User saved = userRepository.save(user);
        return new Account(saved.getId(), jwtService.issue(saved));
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private record Account(Long userId, String token) {
    }

    private record ChallengeRequest(String challengeId) {
    }
}
