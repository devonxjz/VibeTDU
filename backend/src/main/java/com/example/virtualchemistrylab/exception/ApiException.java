package com.example.virtualchemistrylab.exception;

import org.springframework.http.HttpStatus;

/**
 * Base application exception carrying an HTTP status.
 * Caught by GlobalExceptionHandler and serialised as JSON.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus httpStatus;

    public ApiException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public ApiException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
