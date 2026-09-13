package com.jobportal.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Cross-field constraint ensuring minimumSalary &le; maximumSalary.
 * Applied at class level so the validator can access both fields.
 */
@Documented
@Constraint(validatedBy = ValidSalaryRangeValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSalaryRange {

    String message() default "Maximum salary must be greater than or equal to minimum salary";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
