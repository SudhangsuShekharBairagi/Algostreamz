package com.dsaviz.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.dsaviz.exception.SecurityErrorResponder;
import com.dsaviz.security.JwtAuthFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Cost 12 is the current sweet spot: ~250ms to hash on commodity hardware, which is
     * also the natural throttle on credential-stuffing attempts.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                            JwtAuthFilter jwtAuthFilter,
                                            SecurityErrorResponder errorResponder) throws Exception {
        http
                // No cookies or sessions are used, so there is no CSRF surface. A bearer
                // token is not sent ambiently by the browser, so it cannot be forged.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> { })
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frame -> frame.deny()))
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, ex) ->
                                errorResponder.writeUnauthorized(request, response, ex))
                        .accessDeniedHandler((request, response, ex) ->
                                errorResponder.writeForbidden(request, response, ex)))
                .authorizeHttpRequests(requests -> requests
                        // Preflight never carries credentials.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Listed one by one on purpose. A blanket "/api/auth/**" would also
                        // expose /me and /logout, which must stay authenticated.
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify-email",
                                "/api/auth/resend-verification",
                                "/api/auth/otp/request",
                                "/api/auth/otp/verify")
                        .permitAll()
                        .requestMatchers("/api/metadata/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
