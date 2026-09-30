package com.dsaviz.exception;

import com.dsaviz.dto.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Emits the same JSON error envelope from Spring Security's entry point and access-denied
 * handler as from the MVC exception handler, so clients only ever parse one error shape.
 */
@Component
public class SecurityErrorResponder {

    private static final Logger log = LoggerFactory.getLogger(SecurityErrorResponder.class);

    private final ObjectMapper objectMapper;

    public SecurityErrorResponder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void write(HttpServletRequest request,
                      HttpServletResponse response,
                      HttpStatus status,
                      String message,
                      Exception cause) throws IOException {
        if (cause != null) {
            log.debug("Security rejected {} {}: {}", request.getMethod(), request.getRequestURI(), cause.getMessage());
        }
        if (response.isCommitted()) {
            return;
        }
        response.reset();
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(),
                ApiError.of(status, message, request.getRequestURI()));
    }

    public void writeUnauthorized(HttpServletRequest request, HttpServletResponse response,
                                   AuthenticationException cause) throws IOException {
        write(request, response, HttpStatus.UNAUTHORIZED, "Authentication required", cause);
    }

    public void writeForbidden(HttpServletRequest request, HttpServletResponse response,
                               AccessDeniedException cause) throws IOException {
        write(request, response, HttpStatus.FORBIDDEN, "Access denied", cause);
    }
}
