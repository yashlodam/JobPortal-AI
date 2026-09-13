package com.jobportal.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Payload for recruiter verification submission (initial or resubmission).
 *
 * <p>The company fields (companyName, companyWebsite, etc.) are
 * persisted to the companies table during submission so that, after admin
 * approval, the employer Company Profile page is already pre-filled and
 * the employer does not need to complete the profile a second time.</p>
 */
public class RecruiterVerificationRequest {

    // Recruiter identity
    @Size(max = 100, message = "Designation must be at most 100 characters")
    private String designation;

    @Size(max = 500, message = "Note must be at most 500 characters")
    private String note;

    // Company / employer information
    @Size(max = 255, message = "Company name must be at most 255 characters")
    private String companyName;

    @Size(max = 500, message = "Company website must be at most 500 characters")
    private String companyWebsite;

    @Size(max = 255, message = "Company location must be at most 255 characters")
    private String companyLocation;

    @Size(max = 5000, message = "Company description must be at most 5000 characters")
    private String companyDescription;

    @Email(message = "Work email must be a valid email address")
    @Size(max = 255)
    private String workEmail;

    @Size(max = 500, message = "LinkedIn profile URL must be at most 500 characters")
    private String linkedinProfile;

    @Size(max = 255)
    private String fullName;

    public RecruiterVerificationRequest() {}

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) {
        this.companyName = (companyName != null && !companyName.isBlank()) ? companyName.trim() : null;
    }

    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = (companyWebsite != null && !companyWebsite.isBlank()) ? companyWebsite.trim() : null;
    }

    public String getCompanyLocation() { return companyLocation; }
    public void setCompanyLocation(String companyLocation) {
        this.companyLocation = (companyLocation != null && !companyLocation.isBlank()) ? companyLocation.trim() : null;
    }

    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = (companyDescription != null && !companyDescription.isBlank()) ? companyDescription.trim() : null;
    }

    public String getWorkEmail() { return workEmail; }
    public void setWorkEmail(String workEmail) {
        this.workEmail = (workEmail != null && !workEmail.isBlank()) ? workEmail.trim() : null;
    }

    public String getLinkedinProfile() { return linkedinProfile; }
    public void setLinkedinProfile(String linkedinProfile) {
        this.linkedinProfile = (linkedinProfile != null && !linkedinProfile.isBlank()) ? linkedinProfile.trim() : null;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}