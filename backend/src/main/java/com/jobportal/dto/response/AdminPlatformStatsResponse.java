package com.jobportal.dto.response;

/**
 * System-wide platform aggregate statistics for Admin Overview.
 */
public class AdminPlatformStatsResponse {

    private long totalUsers;
    private long totalApplicants;
    private long totalRecruiters;
    private long totalAdmins;
    private long activeUsers;

    private long totalJobs;
    private long activeJobs;
    private long closedJobs;

    private long totalApplications;
    private long totalCompanies;

    private long pendingVerifications;
    private long approvedRecruiters;
    private long rejectedRecruiters;
    private long suspendedRecruiters;

    public AdminPlatformStatsResponse() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalApplicants() { return totalApplicants; }
    public void setTotalApplicants(long totalApplicants) { this.totalApplicants = totalApplicants; }

    public long getTotalRecruiters() { return totalRecruiters; }
    public void setTotalRecruiters(long totalRecruiters) { this.totalRecruiters = totalRecruiters; }

    public long getTotalAdmins() { return totalAdmins; }
    public void setTotalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getClosedJobs() { return closedJobs; }
    public void setClosedJobs(long closedJobs) { this.closedJobs = closedJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getTotalCompanies() { return totalCompanies; }
    public void setTotalCompanies(long totalCompanies) { this.totalCompanies = totalCompanies; }

    public long getPendingVerifications() { return pendingVerifications; }
    public void setPendingVerifications(long pendingVerifications) { this.pendingVerifications = pendingVerifications; }

    public long getApprovedRecruiters() { return approvedRecruiters; }
    public void setApprovedRecruiters(long approvedRecruiters) { this.approvedRecruiters = approvedRecruiters; }

    public long getRejectedRecruiters() { return rejectedRecruiters; }
    public void setRejectedRecruiters(long rejectedRecruiters) { this.rejectedRecruiters = rejectedRecruiters; }

    public long getSuspendedRecruiters() { return suspendedRecruiters; }
    public void setSuspendedRecruiters(long suspendedRecruiters) { this.suspendedRecruiters = suspendedRecruiters; }
}
