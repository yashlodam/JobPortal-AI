package com.jobportal.exception;

import org.springframework.http.HttpStatus;

/**
 * Domain exception with HTTP status awareness.
 * Use factory methods for semantic, meaningful exceptions.
 */
public class JobPortalException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final String errorCode;

    public JobPortalException(String message, HttpStatus httpStatus) {
        this(message, httpStatus, defaultErrorCodeFor(httpStatus));
    }

    public JobPortalException(String message, HttpStatus httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode != null ? errorCode : defaultErrorCodeFor(httpStatus);
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    private static String defaultErrorCodeFor(HttpStatus status) {
        if (status == null) return "INTERNAL_ERROR";
        return switch (status) {
            case NOT_FOUND -> "RESOURCE_NOT_FOUND";
            case CONFLICT -> "RESOURCE_CONFLICT";
            case FORBIDDEN -> "ACCESS_DENIED";
            case BAD_REQUEST -> "BAD_REQUEST";
            case UNAUTHORIZED -> "UNAUTHORIZED";
            case PAYLOAD_TOO_LARGE -> "PAYLOAD_TOO_LARGE";
            default -> status.is5xxServerError() ? "INTERNAL_ERROR" : "CLIENT_ERROR";
        };
    }

    // ── Factory Methods ──────────────────────────────────────────

    public static JobPortalException notFound(String message) {
        return new JobPortalException(message, HttpStatus.NOT_FOUND);
    }

    public static JobPortalException notFound(String message, String errorCode) {
        return new JobPortalException(message, HttpStatus.NOT_FOUND, errorCode);
    }

    public static JobPortalException conflict(String message) {
        return new JobPortalException(message, HttpStatus.CONFLICT);
    }

    public static JobPortalException conflict(String message, String errorCode) {
        return new JobPortalException(message, HttpStatus.CONFLICT, errorCode);
    }

    public static JobPortalException forbidden(String message) {
        return new JobPortalException(message, HttpStatus.FORBIDDEN);
    }

    public static JobPortalException forbidden(String message, String errorCode) {
        return new JobPortalException(message, HttpStatus.FORBIDDEN, errorCode);
    }

    public static JobPortalException badRequest(String message) {
        return new JobPortalException(message, HttpStatus.BAD_REQUEST);
    }

    public static JobPortalException badRequest(String message, String errorCode) {
        return new JobPortalException(message, HttpStatus.BAD_REQUEST, errorCode);
    }

    public static JobPortalException unauthorized(String message) {
        return new JobPortalException(message, HttpStatus.UNAUTHORIZED);
    }

    public static JobPortalException unauthorized(String message, String errorCode) {
        return new JobPortalException(message, HttpStatus.UNAUTHORIZED, errorCode);
    }

    public static JobPortalException internalError(String message) {
        return new JobPortalException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static JobPortalException internalError(String message, String errorCode) {
        return new JobPortalException(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode);
    }
}
