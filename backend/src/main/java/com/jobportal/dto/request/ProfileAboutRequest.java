package com.jobportal.dto.request;

import jakarta.validation.constraints.Size;

public class ProfileAboutRequest {

    @Size(max = 2000, message = "About section cannot exceed 2000 characters")
    private String about;

    public ProfileAboutRequest() {}

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
}
