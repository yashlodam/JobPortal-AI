package com.jobportal.chat.dto.response;

/**
 * Minimal user info embedded inside MessageResponse and ConversationParticipantResponse.
 * Only exposes what the chat UI needs - no sensitive fields.
 */
public class SenderResponse {

    private Long id;
    private String name;
    private String email;
    private String profileImage;
    private String accountType;

    public SenderResponse() {}

    public SenderResponse(Long id, String name, String email, String profileImage, String accountType) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profileImage = profileImage;
        this.accountType = accountType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
}
