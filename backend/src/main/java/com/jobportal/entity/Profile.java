package com.jobportal.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;

import com.jobportal.domain.Availability;
import com.jobportal.domain.ExperienceLevel;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

/**
 * Aggregate root for a user's professional profile.
 *
 * <h3>Lazy-loading strategy</h3>
 * All collections are LAZY (correct default — never EAGER). When a full
 * ProfileResponse is needed, {@code ProfileRepository.findByUserEmailWithDetails}
 * loads the {@code @OneToOne} associations ({@code user}, {@code resume}) via
 * EntityGraph, and all {@code @ElementCollection} / {@code @OneToMany} bags are
 * loaded by Hibernate's {@code @BatchSize} mechanism.
 *
 * <p>{@code @BatchSize(size = 25)} on each collection means: once any
 * collection-element is accessed, Hibernate issues a single
 * {@code WHERE profile_id IN (…)} query for up to 25 profiles at once —
 * eliminating N+1 without a Cartesian JOIN FETCH.</p>
 */
@Entity
@Table(name = "profiles")
public class Profile extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Header fields ────────────────────────────────────────────────────────

    private String headline;
    private String currentCompany;
    private String location;

    @Enumerated(EnumType.STRING)
    private Availability availability;

    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;

    // ── Element Collections ──────────────────────────────────────────────────

    /**
     * @BatchSize(25): when skills are accessed, Hibernate loads them for up to
     * 25 profile IDs at once via a single IN-clause query.
     * @CollectionTable + @Column: explicit DDL so column names are predictable.
     * @OrderColumn: preserves insertion order; avoids "bag" vs "list" ambiguity.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "profile_skills",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "skill")
    @OrderColumn(name = "skill_order")
    @BatchSize(size = 25)
    private List<String> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "profile_languages",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "language")
    @OrderColumn(name = "language_order")
    @BatchSize(size = 25)
    private List<String> languages = new ArrayList<>();

    // ── Scalar fields ─────────────────────────────────────────────────────────

    @Column(columnDefinition = "TEXT")
    private String about;
    @Column(columnDefinition = "TEXT")
    private String profileImage;
    @Column(columnDefinition = "TEXT")
    private String bannerImage;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    // ── One-to-Many Collections ───────────────────────────────────────────────

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 25)
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 25)
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 25)
    private List<Certification> certifications = new ArrayList<>();

    // ── One-to-One Associations ───────────────────────────────────────────────

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 25)
    private List<Resume> resumes = new ArrayList<>();

    @OneToOne(mappedBy = "profile", fetch = FetchType.LAZY)
    private User user;

    public Profile() {}

    // ── Helper Methods ───────────────────────────────────────────────────────

    public void addExperience(Experience experience) {
        experiences.add(experience);
        experience.setProfile(this);
    }

    public void removeExperience(Experience experience) {
        experiences.remove(experience);
        experience.setProfile(null);
    }

    public void addEducation(Education education) {
        educations.add(education);
        education.setProfile(this);
    }

    public void removeEducation(Education education) {
        educations.remove(education);
        education.setProfile(null);
    }

    public void addCertification(Certification certification) {
        certifications.add(certification);
        certification.setProfile(this);
    }

    public void removeCertification(Certification certification) {
        certifications.remove(certification);
        certification.setProfile(null);
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public List<Experience> getExperiences() { return experiences; }
    public void setExperiences(List<Experience> experiences) { this.experiences = experiences; }

    public List<Education> getEducations() { return educations; }
    public void setEducations(List<Education> educations) { this.educations = educations; }

    public List<Certification> getCertifications() { return certifications; }
    public void setCertifications(List<Certification> certifications) { this.certifications = certifications; }

    public void addResume(Resume resume) {
        resumes.add(resume);
        resume.setProfile(this);
    }

    public void removeResume(Resume resume) {
        resumes.remove(resume);
        resume.setProfile(null);
    }

    public List<Resume> getResumes() { return resumes; }
    public void setResumes(List<Resume> resumes) { this.resumes = resumes; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}