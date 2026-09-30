package com.dsaviz.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Resolves the originating client address.
 *
 * Every common PaaS (Render, Railway, Fly, Heroku) sits behind a proxy that terminates
 * TLS, so {@code getRemoteAddr()} is the proxy's address. Trust the left-most entry of
 * X-Forwarded-For, which is the original client. Safe here because the rate limits it
 * feeds are advisory abuse guards, not authentication decisions.
 */
public final class ClientIpResolver {

    private static final String[] HEADERS = {"X-Forwarded-For", "X-Real-IP", "CF-Connecting-IP"};

    private ClientIpResolver() {
    }

    public static String resolve(HttpServletRequest request) {
        for (String header : HEADERS) {
            String value = request.getHeader(header);
            if (value == null || value.isBlank()) {
                continue;
            }
            // "client, proxy1, proxy2" - the client is first.
            String first = value.split(",")[0].trim();
            if (!first.isEmpty() && !first.equalsIgnoreCase("unknown")) {
                return truncate(first);
            }
        }
        return truncate(request.getRemoteAddr());
    }

    /** Keep within the 64-char column on otp_codes. */
    private static String truncate(String ip) {
        return ip.length() > 64 ? ip.substring(0, 64) : ip;
    }
}
