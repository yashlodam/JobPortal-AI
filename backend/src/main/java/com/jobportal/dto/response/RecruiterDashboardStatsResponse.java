package com.jobportal.dto.response;

/**
 * Response DTO for recruiter dashboard real-time statistics.
 */
public class RecruiterDashboardStatsResponse {

    private long activeJobs;
    private long featuredJobs;
    private long totalApplications;
    private long newApplications;
    private long shortlistedApplications;
    private long interviewApplications;
    private long offeredApplications;
    private long hiredApplications;
    private long rejectedApplications;

    public RecruiterDashboardStatsResponse() {}

    public RecruiterDashboardStatsResponse(
            long activeJobs,
            long featuredJobs,
            long totalApplications,
            long newApplications,
            long shortlistedApplications,
            long interviewApplications,
            long offeredApplications,
            long hiredApplications,
            long rejectedApplications) {
        this.activeJobs = activeJobs;
        this.featuredJobs = featuredJobs;
        this.totalApplications = totalApplications;
        this.newApplications = newApplications;
        this.shortlistedApplications = shortlistedApplications;
        this.interviewApplications = interviewApplications;
        this.offeredApplications = offeredApplications;
        this.hiredApplications = hiredApplications;
        this.rejectedApplications = rejectedApplications;
    }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getFeaturedJobs() { return featuredJobs; }
    public void setFeaturedJobs(long featuredJobs) { this.featuredJobs = featuredJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getNewApplications() { return newApplications; }
    public void setNewApplications(long newApplications) { this.newApplications = newApplications; }

    public long getShortlistedApplications() { return shortlistedApplications; }
    public void setShortlistedApplications(long shortlistedApplications) { this.shortlistedApplications = shortlistedApplications; }

    public long getInterviewApplications() { return interviewApplications; }
    public void setInterviewApplications(long interviewApplications) { this.interviewApplications = interviewApplications; }

    public long getOfferedApplications() { return offeredApplications; }
    public void setOfferedApplications(long offeredApplications) { this.offeredApplications = offeredApplications; }

    public long getHiredApplications() { return hiredApplications; }
    public void setHiredApplications(long hiredApplications) { this.hiredApplications = hiredApplications; }

    public long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }
}
