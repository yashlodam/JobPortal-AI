package com.jobportal.dto.response;

public class CategoryResponse {

    private String title;

    private Long count;

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Long getCount() {
		return count;
	}

	public void setCount(Long count) {
		this.count = count;
	}

	public CategoryResponse(String title, Long count) {
		super();
		this.title = title;
		this.count = count;
	}
	
	
	public CategoryResponse() {
		
	}
    
	
    

}
