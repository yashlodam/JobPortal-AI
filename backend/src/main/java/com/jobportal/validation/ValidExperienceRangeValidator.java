package com.jobportal.validation;

import com.jobportal.dto.request.JobRequest;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidExperienceRangeValidator
        implements ConstraintValidator<ValidExperienceRange, JobRequest> {

    @Override
    public boolean isValid(JobRequest request, ConstraintValidatorContext context) {
        if (request.getMinimumExperience() == null || request.getMaximumExperience() == null) {
            return true; // null fields allowed; min=0 check handled by @Min
        }
        return request.getMinimumExperience() <= request.getMaximumExperience();
    }
}
