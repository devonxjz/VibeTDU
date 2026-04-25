package com.example.virtualchemistrylab.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a request payload fails business-level validation
 * (beyond Spring's @Valid checks).
 */
public class ValidationException extends ApiException {

    public ValidationException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
