package com.jobportal.copilot.dto;

import java.util.ArrayList;
import java.util.List;

public class CopilotChatResponse {

    private String reply;
    private List<String> suggestedFollowUps = new ArrayList<>();
    private String actionType; // "JOBS_LIST", "NAVIGATE", "ATS_TIP", "INTERVIEW_DRILL", "NONE"
    private List<CopilotJobCardDto> matchedJobs = new ArrayList<>();
    private String actionLink;

    public CopilotChatResponse() {}

    public CopilotChatResponse(String reply, List<String> suggestedFollowUps, String actionType, List<CopilotJobCardDto> matchedJobs, String actionLink) {
        this.reply = reply;
        this.suggestedFollowUps = suggestedFollowUps != null ? suggestedFollowUps : new ArrayList<>();
        this.actionType = actionType != null ? actionType : "NONE";
        this.matchedJobs = matchedJobs != null ? matchedJobs : new ArrayList<>();
        this.actionLink = actionLink;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public List<String> getSuggestedFollowUps() { return suggestedFollowUps; }
    public void setSuggestedFollowUps(List<String> suggestedFollowUps) { this.suggestedFollowUps = suggestedFollowUps; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public List<CopilotJobCardDto> getMatchedJobs() { return matchedJobs; }
    public void setMatchedJobs(List<CopilotJobCardDto> matchedJobs) { this.matchedJobs = matchedJobs; }

    public String getActionLink() { return actionLink; }
    public void setActionLink(String actionLink) { this.actionLink = actionLink; }
}
