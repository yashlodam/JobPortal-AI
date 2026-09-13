package com.jobportal.chat.dto.response;

/**
 * Structured error pushed to /user/queue/errors when a WebSocket operation fails.
 * Prevents raw exception messages from leaking to the client.
 */
public class WebSocketErrorResponse {

    private String type = "ERROR";
    private String code;
    private String message;

    public WebSocketErrorResponse() {}

    public WebSocketErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public static WebSocketErrorResponse accessDenied() {
        return new WebSocketErrorResponse("CONVERSATION_ACCESS_DENIED",
            "You do not have access to this conversation.");
    }

    public static WebSocketErrorResponse invalidPayload(String detail) {
        return new WebSocketErrorResponse("INVALID_PAYLOAD", detail);
    }

    public static WebSocketErrorResponse serverError() {
        return new WebSocketErrorResponse("SERVER_ERROR",
            "An unexpected error occurred. Please try again.");
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
