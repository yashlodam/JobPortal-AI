package com.jobportal.domain;

public enum JobStatus {

    DRAFT,             // Saved but not published

    OPEN,              // Published and accepting applications

    PAUSED,            // Temporarily not accepting applications

    CLOSED,            // Closed manually by recruiter

    EXPIRED,           // Deadline has passed

    FILLED,            // Position has been filled

    CANCELLED          // Job cancelled by recruiter/admin

}
