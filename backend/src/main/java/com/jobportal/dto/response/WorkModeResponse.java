package com.jobportal.dto.response;

import com.jobportal.domain.WorkingMode;

public class WorkModeResponse {

    private WorkingMode workingMode;
    private Long jobCount;

    public WorkModeResponse() {
    }

    public WorkModeResponse(WorkingMode workingMode, Long jobCount) {
        this.workingMode = workingMode;
        this.jobCount = jobCount;
    }

    public WorkingMode getWorkingMode() {
        return workingMode;
    }

    public void setWorkingMode(WorkingMode workingMode) {
        this.workingMode = workingMode;
    }

    public Long getJobCount() {
        return jobCount;
    }

    public void setJobCount(Long jobCount) {
        this.jobCount = jobCount;
    }
}