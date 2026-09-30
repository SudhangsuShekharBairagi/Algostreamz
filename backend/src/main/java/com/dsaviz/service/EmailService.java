package com.dsaviz.service;

import com.dsaviz.config.MailProperties;
import com.dsaviz.exception.MailDeliveryException;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Sends transactional mail over plain SMTP.
 *
 * Deliberately knows nothing about Brevo (or Gmail, or SES): the relay host, port,
 * credentials and TLS mode all arrive as environment variables. Pointing this app at a
 * different provider is a config change, never a code change.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String UTF_8 = "UTF-8";

    private final JavaMailSender mailSender;
    private final MailProperties properties;

    public EmailService(JavaMailSender mailSender, MailProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @PostConstruct
    void validateConfiguration() {
        if (!StringUtils.hasText(properties.getFromEmail())) {
            throw new IllegalStateException(
                    "MAIL_FROM_EMAIL is not set. It must be an address verified by your mail provider "
                            + "(Brevo: Settings > Senders & Domains > Email).");
        }
    }

    public void sendOtpEmail(String toEmail, String code, int ttlMinutes, boolean forLogin) {
        String subject = forLogin
                ? properties.getAppName() + " login code"
                : "Verify your " + properties.getAppName() + " email address";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, false, UTF_8);
            helper.setFrom(properties.getFromName() + " <" + properties.getFromEmail() + ">");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(plainTextBody(code, ttlMinutes, forLogin), false);
            helper.setText(htmlBody(code, ttlMinutes, forLogin), true);

            mailSender.send(message);
            log.info("Sent {} OTP to {}@{}", forLogin ? "login" : "verification",
                    mask(toEmail), domainOf(toEmail));
        } catch (MailException | jakarta.mail.MessagingException ex) {
            log.error("Failed to send OTP email to {}", mask(toEmail), ex);
            throw new MailDeliveryException("Could not send the email. Please try again shortly.", ex);
        }
    }

    private String plainTextBody(String code, int ttlMinutes, boolean forLogin) {
        String action = forLogin ? "sign in to your account" : "finish creating your account";
        return "Your " + properties.getAppName() + " verification code is:\n\n"
                + "    " + code + "\n\n"
                + "Use this code to " + action + ". "
                + "The code expires in " + ttlMinutes + " minutes.\n\n"
                + "If you did not request this code you can safely ignore this email - "
                + "it will stop working on its own.\n";
    }

    private String htmlBody(String code, int ttlMinutes, boolean forLogin) {
        String heading = forLogin ? "Your sign-in code" : "Verify your email";
        String intro = forLogin
                ? "Enter this code on the sign-in screen to finish."
                : "Enter this code to finish setting up your account.";
        String app = escapeHtml(properties.getAppName());

        return """
                <!doctype html>
                <html lang="en">
                <body style="margin:0;padding:32px 16px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
                    <tr><td>
                      <h1 style="margin:0 0 4px;font-size:20px;color:#0f172a;">%1$s</h1>
                      <p style="margin:0 0 24px;font-size:14px;color:#64748b;">%2$s</p>
                      <div style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 12px;">%3$s</div>
                      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#475569;">%4$s
                        This code expires in <strong>%5$d minutes</strong>.</p>
                      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">
                        If you did not request this code you can safely ignore this email - it will stop working on its own.</p>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(app, heading, escapeHtml(code), intro, ttlMinutes);
    }

    /** Logs the local part only partially, to keep addresses out of logs. */
    private static String mask(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***" + (at >= 0 ? email.substring(at) : "");
        }
        return email.charAt(0) + "***" + email.substring(at);
    }

    private static String domainOf(String email) {
        int at = email.indexOf('@');
        return at < 0 ? "?" : email.substring(at + 1);
    }

    private static String escapeHtml(String raw) {
        return raw.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
