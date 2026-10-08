package com.dsaviz.repository;

import com.dsaviz.entity.OtpCode;
import com.dsaviz.entity.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

        Optional<OtpCode> findFirstByEmailIgnoreCaseAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                        String email, OtpPurpose purpose);

        long countByEmailIgnoreCaseAndPurposeAndCreatedAtAfter(String email, OtpPurpose purpose, Instant since);

        long countByEmailIgnoreCaseAndCreatedAtAfter(String email, Instant since);

        long countByRequestedByIpAndCreatedAtAfter(String ip, Instant since);

        List<OtpCode> findAllByEmailIgnoreCaseAndConsumedAtIsNull(String email);

        void deleteAllByEmailIgnoreCase(String email);

        /**
         * Invalidates every outstanding code for an address+purpose. Called before
         * issuing a
         * replacement so only the newest emailed code can ever be redeemed.
         */
        @Modifying
        @Query("update OtpCode o set o.consumedAt = :now "
                        + "where lower(o.email) = lower(:email) and o.purpose = :purpose and o.consumedAt is null")
        int invalidateOutstanding(@Param("email") String email, @Param("purpose") OtpPurpose purpose,
                        @Param("now") Instant now);

        @Modifying
        @Query("delete from OtpCode o where o.expiresAt < :cutoff")
        int deleteExpired(@Param("cutoff") Instant cutoff);
}
