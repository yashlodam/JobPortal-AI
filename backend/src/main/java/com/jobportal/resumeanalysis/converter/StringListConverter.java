package com.jobportal.resumeanalysis.converter;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter that stores a {@code List<String>} as a JSON array string
 * in a single TEXT database column.
 *
 * <h3>Why this instead of @ElementCollection?</h3>
 * <p>{@code @ElementCollection} creates a separate child table per collection.
 * When multiple EAGER element collections exist on the same entity, Hibernate 6.x
 * defers their loading to post-load batch SELECTs to avoid a Cartesian product.
 * These post-load SELECTs run AFTER the Hibernate session closes (since
 * {@code spring.jpa.open-in-view=false}), causing:</p>
 * <pre>LazyInitializationException: Cannot lazily initialize collection — no session</pre>
 *
 * <p>With this converter, each list is a simple TEXT column in the main
 * {@code resume_analysis} table. It is loaded in the same SELECT as the entity
 * row — guaranteed, no session required, no lazy loading at all.</p>
 *
 * <h3>Database representation</h3>
 * <pre>
 * Java:     ["Java", "Spring Boot", "Docker"]
 * Database: ["Java","Spring Boot","Docker"]   (TEXT column)
 * </pre>
 *
 * <h3>Why not comma-separated?</h3>
 * <p>Skills and improvements often contain commas (e.g., "Python, R, MATLAB"),
 * which would corrupt a CSV representation. JSON is unambiguous.</p>
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    /** Static instance — safe: ObjectMapper is thread-safe after configuration. */
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final TypeReference<List<String>> LIST_TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return MAPPER.readValue(json, LIST_TYPE);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
