package com.jobportal.validation;

import com.jobportal.dto.request.JobRequest;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidSalaryRangeValidator
        implements ConstraintValidator<ValidSalaryRange, JobRequest> {

    @Override
    public boolean isValid(JobRequest request, ConstraintValidatorContext context) {
        if (request.getMinimumSalary() == null || request.getMaximumSalary() == null) {
            return true; // null check is handled by field-level @Min
        }
        return request.getMinimumSalary() <= request.getMaximumSalary();
    }
}
