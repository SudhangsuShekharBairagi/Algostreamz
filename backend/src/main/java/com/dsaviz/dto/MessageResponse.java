package com.dsaviz.dto;

/**
 * Generic acknowledgement for endpoints that have no body to return.
 * Deliberately carries no hint about whether the address exists.
 */
public record MessageResponse(String message) {
}
