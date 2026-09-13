package com.jobportal.config;

/**
 * JWT constants — secret is read from application.properties, not hardcoded here.
 */
public class JwtConstants {

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";

    private JwtConstants() {
        // Utility class — no instantiation
    }
}
