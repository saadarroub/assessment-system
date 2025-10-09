package com.assessment.backend.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to require specific permission for method execution
 * 
 * Usage:
 * @RequirePermission("create_assessment")
 * public void createAssessment(...) { }
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    
    /**
     * Required permission name(s)
     */
    String[] value();
    
    /**
     * If true, user needs ALL permissions (AND logic)
     * If false, user needs ANY permission (OR logic)
     * Default: false (OR logic)
     */
    boolean requireAll() default false;
}

