package com.jobportal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jobportal.domain.AccountType;

public class UserDTO {

    private String name;
    private String email;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    private AccountType accountType;
    
    private Long profileId;
    

    public Long getProfileId() {
		return profileId;
	}

	public void setProfileId(Long profileId) {
		this.profileId = profileId;
	}

	public UserDTO() {
    }

    public UserDTO(String name, String email, String password, AccountType accountType,Long profileId) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.accountType = accountType;
        this.profileId = profileId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }
    
    
    
    
    
    
    
    
    
}