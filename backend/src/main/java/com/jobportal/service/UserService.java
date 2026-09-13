package com.jobportal.service;

import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.exception.JobPortalException;

public interface UserService {

    UserResponse registerUser(RegisterRequest request) throws JobPortalException;

    UserResponse getUserByEmail(String email) throws JobPortalException;

    boolean sendOtp(String email) throws Exception;

    boolean verifyOtp(String email, String otp) throws JobPortalException;

    boolean resetPassword(String email, String newPassword) throws JobPortalException;
}
