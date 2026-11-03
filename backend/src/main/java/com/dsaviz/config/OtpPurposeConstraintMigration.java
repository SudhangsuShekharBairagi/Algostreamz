package com.dsaviz.config;

import com.dsaviz.entity.OtpPurpose;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Repairs the enum CHECK constraint on {@code otp_codes.purpose}.
 *
 * <p>Hibernate 6 emits {@code check (purpose in (...))} for an
 * {@code @Enumerated(EnumType.STRING)} column, but {@code ddl-auto=update} never revisits
 * a constraint that already exists. A database created before a new {@link OtpPurpose}
 * was added therefore keeps rejecting rows carrying the new value - which surfaced as a
 * misleading 409 "That record already exists" on the password-reset endpoint.
 *
 * <p>Rewriting the constraint from the current enum once per boot lets existing
 * deployments upgrade themselves. A real migration tool is still the better long-term
 * home for this; see the note about Flyway in {@code application.properties}.
 */
@Component
public class OtpPurposeConstraintMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OtpPurposeConstraintMigration.class);
    private static final String CONSTRAINT = "otp_codes_purpose_check";

    private final JdbcTemplate jdbcTemplate;

    public OtpPurposeConstraintMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        String product;
        try {
            product = jdbcTemplate.execute((ConnectionCallback<String>) connection ->
                    connection.getMetaData().getDatabaseProductName());
        } catch (DataAccessException ex) {
            log.debug("Could not identify the database; skipping {} repair", CONSTRAINT, ex);
            return;
        }
        if (product == null || !product.toLowerCase().contains("postgres")) {
            // H2 and friends are created from scratch by the test profile, so they are
            // always in sync with the current enum.
            return;
        }

        String allowed = Arrays.stream(OtpPurpose.values())
                .map(purpose -> "'" + purpose.name() + "'")
                .collect(Collectors.joining(", "));

        try {
            String definition = jdbcTemplate.queryForObject(
                    "select pg_get_constraintdef(oid) from pg_constraint where conname = ?",
                    String.class, CONSTRAINT);
            boolean complete = Arrays.stream(OtpPurpose.values())
                    .allMatch(purpose -> definition != null && definition.contains("'" + purpose.name() + "'"));
            if (complete) {
                return;
            }
        } catch (DataAccessException ex) {
            log.debug("Could not read the existing {} definition; rebuilding it", CONSTRAINT, ex);
        }

        try {
            jdbcTemplate.execute("alter table otp_codes drop constraint if exists " + CONSTRAINT);
            jdbcTemplate.execute("alter table otp_codes add constraint " + CONSTRAINT
                    + " check (purpose in (" + allowed + "))");
            log.info("Rebuilt {} to allow {}", CONSTRAINT, allowed);
        } catch (DataAccessException ex) {
            log.warn("Could not rebuild {}; codes for newer purposes may be rejected", CONSTRAINT, ex);
        }
    }
}
