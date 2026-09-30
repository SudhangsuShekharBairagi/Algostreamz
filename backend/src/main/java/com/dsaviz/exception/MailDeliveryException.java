package com.dsaviz.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when the upstream SMTP relay rejects a message. Surfaces as 502 so clients can
 * distinguish "our provider is down" from "you typed the wrong code".
 */
public class MailDeliveryException extends ApiException {
    public MailDeliveryException(String message, Throwable cause) {
        super(HttpStatus.BAD_GATEWAY, message, cause);
    }
}
