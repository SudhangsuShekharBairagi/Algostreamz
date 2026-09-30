package com.dsaviz.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Browser CORS rules, driven entirely by {@code CORS_ALLOWED_ORIGINS}.
 *
 * Exposed as a {@link CorsConfigurationSource} bean, which Spring Security picks up
 * automatically - so one set of rules governs both preflight and the actual request.
 */
@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties properties) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(properties.getAllowedOrigins());
        configuration.setAllowedMethods(properties.getAllowedMethods());
        configuration.setAllowedHeaders(properties.getAllowedHeaders());
        configuration.setExposedHeaders(properties.getExposedHeaders());
        configuration.setMaxAge(properties.getMaxAge());

        if (properties.getAllowedOrigins().contains("*")) {
            // The CORS spec forbids "*" together with credentials; Spring rejects that pair.
            log.warn("CORS_ALLOWED_ORIGINS is \"*\". Credentials are disabled - set the real "
                    + "frontend origin before going to production.");
            configuration.setAllowCredentials(false);
        } else {
            configuration.setAllowCredentials(properties.isAllowCredentials());
        }

        log.info("CORS allowed origins: {}", Arrays.toString(properties.getAllowedOrigins().toArray()));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
