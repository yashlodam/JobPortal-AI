package com.jobportal.entity;

import java.time.LocalDate;

import com.jobportal.domain.ExperienceType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(
    name = "experiences",
    indexes = {
        @jakarta.persistence.Index(name = "idx_experiences_profile_id", columnList = "profile_id")
    }
)
public class Experience extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String company;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean working;
    private String description;

    @Enumerated(EnumType.STRING)
    private ExperienceType employmentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    public Experience() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Boolean getWorking() { return working; }
    public void setWorking(Boolean working) { this.working = working; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ExperienceType getEmploymentType() { return employmentType; }
    public void setEmploymentType(ExperienceType employmentType) { this.employmentType = employmentType; }

    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }
}