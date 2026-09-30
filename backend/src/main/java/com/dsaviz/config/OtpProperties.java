package com.dsaviz.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.otp")
public class OtpProperties {

    /** How long a code stays redeemable. */
    private int ttlMinutes = 10;

    /** Wrong guesses allowed before a code is burned. */
    private int maxAttempts = 5;

    /** Minimum gap between two sends to the same address. */
    private int resendCooldownSeconds = 60;

    /** Ceiling on sends per address per rolling hour, across all purposes. */
    private int maxPerHourPerEmail = 5;

    /** Ceiling on sends per client IP per rolling hour, to blunt enumeration from one host. */
    private int maxPerHourPerIp = 20;

    /**
     * Secret mixed into the code digest. Defaults to the JWT secret so there is nothing
     * extra to configure; override with OTP_PEPPER to rotate it independently.
     */
    private String pepper = "";

    public int getTtlMinutes() {
        return ttlMinutes;
    }

    public void setTtlMinutes(int ttlMinutes) {
        this.ttlMinutes = ttlMinutes;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public int getResendCooldownSeconds() {
        return resendCooldownSeconds;
    }

    public void setResendCooldownSeconds(int resendCooldownSeconds) {
        this.resendCooldownSeconds = resendCooldownSeconds;
    }

    public int getMaxPerHourPerEmail() {
        return maxPerHourPerEmail;
    }

    public void setMaxPerHourPerEmail(int maxPerHourPerEmail) {
        this.maxPerHourPerEmail = maxPerHourPerEmail;
    }

    public int getMaxPerHourPerIp() {
        return maxPerHourPerIp;
    }

    public void setMaxPerHourPerIp(int maxPerHourPerIp) {
        this.maxPerHourPerIp = maxPerHourPerIp;
    }

    public String getPepper() {
        return pepper;
    }

    public void setPepper(String pepper) {
        this.pepper = pepper;
    }
}
