package com.jobportal.exception;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Standardized error response returned by the global exception handler.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private String message;
    private int status;
    private String error;
    private String errorCode;
    private List<FieldErrorItem> fieldErrors;
    private LocalDateTime timestamp;

    public ErrorResponse(String message, int status, String error, LocalDateTime timestamp) {
        this(message, status, error, null, null, timestamp);
    }

    public ErrorResponse(String message, int status, String error, String errorCode, LocalDateTime timestamp) {
        this(message, status, error, errorCode, null, timestamp);
    }

    public ErrorResponse(String message, int status, String error, String errorCode, List<FieldErrorItem> fieldErrors, LocalDateTime timestamp) {
        this.message = message;
        this.status = status;
        this.error = error;
        this.errorCode = errorCode;
        this.fieldErrors = fieldErrors;
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public List<FieldErrorItem> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(List<FieldErrorItem> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FieldErrorItem {
        private String field;
        private String message;
        private Object rejectedValue;

        public FieldErrorItem() {}

        public FieldErrorItem(String field, String message, Object rejectedValue) {
            this.field = field;
            this.message = message;
            this.rejectedValue = rejectedValue;
        }

        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Object getRejectedValue() {
            return rejectedValue;
        }

        public void setRejectedValue(Object rejectedValue) {
            this.rejectedValue = rejectedValue;
        }
    }
}
