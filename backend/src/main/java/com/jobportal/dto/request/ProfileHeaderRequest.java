package com.jobportal.dto.request;

import com.jobportal.domain.Availability;
import com.jobportal.domain.ExperienceLevel;

public class ProfileHeaderRequest {

    private String name;
    private String headline;
    private String currentCompany;
    private String location;
    private Availability availability;
    private ExperienceLevel experienceLevel;

    public ProfileHeaderRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }


    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }
}
