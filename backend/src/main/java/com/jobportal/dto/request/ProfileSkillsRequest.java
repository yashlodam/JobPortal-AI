package com.jobportal.dto.request;

import java.util.List;

public class ProfileSkillsRequest {

    private List<String> skills;

    public ProfileSkillsRequest() {}

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
}
