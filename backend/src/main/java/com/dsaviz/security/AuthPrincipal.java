package com.dsaviz.security;

import java.security.Principal;

/**
 * The authenticated caller, as resolved from the bearer token.
 *
 * Carries the user id (not the email) as the subject so an account can change its email
 * without invalidating outstanding tokens.
 */
public record AuthPrincipal(Long id, String email, boolean emailVerified) implements Principal {

    @Override
    public String getName() {
        return String.valueOf(id);
    }
}
