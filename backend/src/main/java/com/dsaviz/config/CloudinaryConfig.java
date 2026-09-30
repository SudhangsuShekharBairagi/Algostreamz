package com.dsaviz.config;

import com.cloudinary.Cloudinary;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Optional. Only registers when {@code CLOUDINARY_URL} is set, so a deployment that does
 * not need image uploads still boots.
 */
@Configuration
@ConditionalOnExpression("T(org.springframework.util.StringUtils).hasText('${cloudinary.url:}')")
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(CloudinaryUrlProperties properties) {
        return new Cloudinary(properties.getUrl());
    }
}
