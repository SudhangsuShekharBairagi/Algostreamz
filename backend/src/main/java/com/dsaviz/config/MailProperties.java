package com.dsaviz.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {

    /** Display name shown in the recipient's inbox. */
    private String fromName = "DSA Viz";

    /** Envelope sender. On Brevo this must be a verified sender/address. */
    private String fromEmail = "";

    private String appName = "DSA Viz";

    /** Frontend origin used to build the "sign in" link inside the email body. */
    private String appUrl = "http://localhost:5173";

    public String getFromName() {
        return fromName;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }

    public String getFromEmail() {
        return fromEmail;
    }

    public void setFromEmail(String fromEmail) {
        this.fromEmail = fromEmail;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public String getAppUrl() {
        return appUrl;
    }

    public void setAppUrl(String appUrl) {
        this.appUrl = appUrl;
    }
}
