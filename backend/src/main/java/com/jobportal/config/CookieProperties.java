package com.jobportal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Centralised cookie configuration read from application.properties.
 *
 * Properties prefix: auth.cookie
 *
 * Example application.properties:
 *   auth.cookie-name=access_token
 *   auth.cookie-secure=false          # true in production (requires HTTPS)
 *   auth.cookie-same-site=Lax
 *   auth.cookie-path=/
 *   auth.cookie-max-age=28800         # 8 hours
 *   auth.cookie-domain=               # empty = default (localhost/current domain)
 */
@Component
@ConfigurationProperties(prefix = "auth")
public class CookieProperties {

    /** The cookie name that holds the JWT. */
    private String cookieName = "access_token";

    /**
     * If true, the cookie is only sent over HTTPS.
     * Must be false for local development on http://localhost.
     * Set true in production via environment variable or prod application.properties.
     */
    private boolean cookieSecure = false;

    /** SameSite attribute: Lax (default), Strict, or None (requires Secure=true). */
    private String cookieSameSite = "Lax";

    /** Cookie path — / means all requests send the cookie. */
    private String cookiePath = "/";

    /**
     * Cookie lifetime in seconds.
     * Must match jwt.expiration.ms / 1000.
     * Default: 28800 = 8 hours.
     */
    private int cookieMaxAge = 28800;

    /**
     * Optional domain override.
     * Leave empty for default behaviour (localhost or current domain).
     */
    private String cookieDomain = "";

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getCookieName() { return cookieName; }
    public void setCookieName(String cookieName) { this.cookieName = cookieName; }

    public boolean isCookieSecure() { return cookieSecure; }
    public void setCookieSecure(boolean cookieSecure) { this.cookieSecure = cookieSecure; }

    public String getCookieSameSite() { return cookieSameSite; }
    public void setCookieSameSite(String cookieSameSite) { this.cookieSameSite = cookieSameSite; }

    public String getCookiePath() { return cookiePath; }
    public void setCookiePath(String cookiePath) { this.cookiePath = cookiePath; }

    public int getCookieMaxAge() { return cookieMaxAge; }
    public void setCookieMaxAge(int cookieMaxAge) { this.cookieMaxAge = cookieMaxAge; }

    public String getCookieDomain() { return cookieDomain; }
    public void setCookieDomain(String cookieDomain) { this.cookieDomain = cookieDomain; }
}
