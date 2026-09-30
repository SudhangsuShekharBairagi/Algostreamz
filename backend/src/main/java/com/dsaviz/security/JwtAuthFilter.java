package com.dsaviz.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads {@code Authorization: Bearer <jwt>} and populates the security context.
 *
 * An absent, malformed or expired token is deliberately left anonymous rather than
 * rejected here: the request then flows to the authorization rules, so public endpoints
 * keep working and the entry point produces the 401 for protected ones.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HEADER);
        if (header != null && header.regionMatches(true, 0, PREFIX, 0, PREFIX.length())
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            authenticate(header.substring(PREFIX.length()).trim(), request);
        }
        filterChain.doFilter(request, response);
    }

    private void authenticate(String token, HttpServletRequest request) {
        jwtService.parse(token).ifPresent(claims -> {
            Long userId = parseUserId(claims);
            if (userId == null) {
                return;
            }
            AuthPrincipal principal = new AuthPrincipal(
                    userId,
                    claims.get("email", String.class),
                    Boolean.TRUE.equals(claims.get("verified", Boolean.class))
            );
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        });
    }

    private Long parseUserId(Claims claims) {
        try {
            return Long.valueOf(claims.getSubject());
        } catch (NumberFormatException | NullPointerException ex) {
            return null;
        }
    }
}
