package com.dsaviz.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Resolves database connection settings from whichever environment variables the target
 * platform provides.
 *
 * Explicit {@code SPRING_DATASOURCE_*} wins. Otherwise a single-URL convention is
 * accepted, because every common PaaS (Render, Railway, Heroku, Fly) injects the
 * Postgres add-on as one URL rather than three parts. Supporting both means the same
 * jar boots on any of them with no code change.
 */
@Component
public class DataSourceSettings {

    private static final Logger log = LoggerFactory.getLogger(DataSourceSettings.class);

    private final String jdbcUrl;
    private final String username;
    private final String password;
    private final int maxPoolSize;

    public DataSourceSettings(Environment environment) {
        String explicitUrl = trimmed(environment.getProperty("spring.datasource.url"));
        String explicitUser = trimmed(environment.getProperty("spring.datasource.username"));
        String explicitPassword = trimmed(environment.getProperty("spring.datasource.password"));

        if (StringUtils.hasText(explicitUrl)) {
            this.jdbcUrl = explicitUrl;
            this.username = explicitUser;
            this.password = explicitPassword;
            log.info("Using explicit datasource configuration from spring.datasource.*");
        } else {
            String url = firstNonBlank(
                    trimmed(environment.getProperty("DATABASE_URL")),
                    trimmed(environment.getProperty("JDBC_DATABASE_URL")),
                    trimmed(environment.getProperty("POSTGRES_URL")));
            if (!StringUtils.hasText(url)) {
                throw new IllegalStateException(String.join("\n",
                        "No database configured. Set either:",
                        "  SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD",
                        "or a single:",
                        "  DATABASE_URL=postgres://user:password@host:5432/dbname"));
            }
            Credentials parsed = parse(url);
            this.jdbcUrl = parsed.jdbcUrl();
            this.username = parsed.username();
            this.password = parsed.password();
            log.info("Using DATABASE_URL datasource convention");
        }

        this.maxPoolSize = Integer.parseInt(
                environment.getProperty("spring.datasource.hikari.maximum-pool-size", "10"));
    }

    public String getJdbcUrl() {
        return jdbcUrl;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public int getMaxPoolSize() {
        return maxPoolSize;
    }

    private record Credentials(String jdbcUrl, String username, String password) {
    }

    /** Accepts both {@code postgres://} and {@code postgresql://} schemes. */
    private Credentials parse(String url) {
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme() == null ? "postgresql" : uri.getScheme();
            String host = uri.getHost();
            if (host == null) {
                throw new IllegalStateException("Could not parse host out of DATABASE_URL: " + url);
            }
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String database = uri.getPath() == null || uri.getPath().isBlank()
                    ? "" : uri.getPath().substring(1);

            String user = null;
            String password = null;
            String userInfo = uri.getUserInfo();
            if (userInfo != null) {
                int colon = userInfo.indexOf(':');
                user = colon >= 0 ? userInfo.substring(0, colon) : userInfo;
                password = colon >= 0 ? userInfo.substring(colon + 1) : null;
            }
            if (password != null) {
                password = java.net.URLDecoder.decode(password, java.nio.charset.StandardCharsets.UTF_8);
            }

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            return new Credentials(jdbcUrl, user, password);
        } catch (URISyntaxException ex) {
            throw new IllegalStateException("DATABASE_URL is not a valid URL: " + url, ex);
        }
    }

    private static String trimmed(String value) {
        return value == null ? null : value.trim();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }
}
