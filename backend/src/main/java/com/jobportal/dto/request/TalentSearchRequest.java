package com.jobportal.dto.request;

import java.util.List;

import com.jobportal.domain.Availability;
import com.jobportal.domain.ExperienceLevel;

/**
 * Filter payload for talent/candidate directory search.
 */
public class TalentSearchRequest {

    private String keyword;
    private String skill;
    private List<String> skills;
    private ExperienceLevel experienceLevel;
    private Availability availability;
    private String location;

    public TalentSearchRequest() {}

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }

    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
