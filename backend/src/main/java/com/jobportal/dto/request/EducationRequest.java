package com.jobportal.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public class EducationRequest {

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotBlank(message = "College/University name is required")
    private String collegeName;

    private String university;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String grade;

    public EducationRequest() {}

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
}
