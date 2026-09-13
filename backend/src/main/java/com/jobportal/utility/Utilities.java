package com.jobportal.utility;

import java.security.SecureRandom;

public final class Utilities {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int OTP_LENGTH = 6;

    // Prevent instantiation
    private Utilities() {
    }

    public static String generateOtp() {
        StringBuilder otp = new StringBuilder(OTP_LENGTH);

        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(RANDOM.nextInt(10));
        }

        return otp.toString();
    }
}