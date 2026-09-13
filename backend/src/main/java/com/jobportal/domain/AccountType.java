package com.jobportal.domain;

/**
 * Account types supported by the platform.
 *
 * <ul>
 *   <li>{@link #APPLICANT} — job seeker; has access to profile, job browsing, and applications.</li>
 *   <li>{@link #EMPLOYER}  — recruiter; subject to the {@link RecruiterStatus} verification lifecycle.</li>
 *   <li>{@link #ADMIN}     — platform administrator; manages recruiter verification and platform health.</li>
 * </ul>
 *
 * <p>The {@code accountType} value is stored as the Spring Security {@code GrantedAuthority}
 * via {@link com.jobportal.serviceImpl.CustomUserDetailsService}. Use
 * {@code @PreAuthorize("hasAuthority('ADMIN')")} for admin-only endpoints.</p>
 */
public enum AccountType {
    APPLICANT,
    EMPLOYER,
    ADMIN
}
