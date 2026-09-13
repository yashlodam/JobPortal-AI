package com.jobportal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity representing a user's uploaded resume document.
 * A single profile can have multiple resumes, with one marked as default.
 */
@Entity
@Table(
    name = "resumes",
    indexes = {
        @jakarta.persistence.Index(name = "idx_resumes_profile_id", columnList = "profile_id"),
        @jakarta.persistence.Index(name = "idx_resumes_is_default", columnList = "is_default"),
        @jakarta.persistence.Index(name = "idx_resumes_created_at", columnList = "created_at")
    }
)
public class Resume extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String resumeName;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String resumeUrl;

    private Long fileSizeBytes;

    private String contentType;

    @Column(nullable = false)
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    public Resume() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResumeName() { return resumeName; }
    public void setResumeName(String resumeName) { this.resumeName = resumeName; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }
}