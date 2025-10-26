package com.assessment.backend.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class JsonUtil {

    private JsonUtil() {}

    public static String toJsonString(ObjectMapper objectMapper, Object value) {
        if (value == null) return "null";
        if (value instanceof String s) {
            String trimmed = s.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[") ||
                "null".equals(trimmed) || "true".equals(trimmed) || "false".equals(trimmed) ||
                trimmed.matches("-?\\d+(\\.\\d+)?")) {
                return trimmed;
            }
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "\"" + String.valueOf(value).replace("\"","\\\"") + "\"";
        }
    }
}