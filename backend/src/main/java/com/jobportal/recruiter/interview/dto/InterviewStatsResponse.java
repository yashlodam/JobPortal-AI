package com.jobportal.recruiter.interview.dto;

/**
 * Dashboard summary stats for the recruiter's interview management page.
 */
public class InterviewStatsResponse {

    private long totalScheduled;
    private long upcoming;
    private long todaysCount;
    private long completed;
    private long cancelled;
    private long noShow;

    public InterviewStatsResponse() {}

    public InterviewStatsResponse(
            long totalScheduled, long upcoming, long todaysCount,
            long completed, long cancelled, long noShow) {
        this.totalScheduled = totalScheduled;
        this.upcoming       = upcoming;
        this.todaysCount    = todaysCount;
        this.completed      = completed;
        this.cancelled      = cancelled;
        this.noShow         = noShow;
    }

    public long getTotalScheduled() { return totalScheduled; }
    public void setTotalScheduled(long totalScheduled) { this.totalScheduled = totalScheduled; }

    public long getUpcoming() { return upcoming; }
    public void setUpcoming(long upcoming) { this.upcoming = upcoming; }

    public long getTodaysCount() { return todaysCount; }
    public void setTodaysCount(long todaysCount) { this.todaysCount = todaysCount; }

    public long getCompleted() { return completed; }
    public void setCompleted(long completed) { this.completed = completed; }

    public long getCancelled() { return cancelled; }
    public void setCancelled(long cancelled) { this.cancelled = cancelled; }

    public long getNoShow() { return noShow; }
    public void setNoShow(long noShow) { this.noShow = noShow; }
}
