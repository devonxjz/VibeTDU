package com.example.virtualchemistrylab.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Thin wrapper around Jackson ObjectMapper for safe JSON serialization/deserialization.
 * Centralises ObjectMapper instance to reduce redundant instantiation.
 */
public class JsonUtil {

    private static final Logger log = LoggerFactory.getLogger(JsonUtil.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonUtil() {}

    /** Serialize any object to JSON string. Returns null on failure. */
    public static String toJson(Object obj) {
        try {
            return MAPPER.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("JSON serialization failed: {}", e.getMessage());
            return null;
        }
    }

    /** Deserialize JSON string to the specified class. Returns null on failure. */
    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return MAPPER.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.warn("JSON deserialization failed for class {}: {}", clazz.getSimpleName(), e.getMessage());
            return null;
        }
    }
}
