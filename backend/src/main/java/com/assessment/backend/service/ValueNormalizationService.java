package com.assessment.backend.service;

import com.assessment.backend.util.RatingScaleUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ValueNormalizationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public Object normalizeForQuestion(UUID questionId, Object incoming) {
        var meta = jdbcTemplate.query(
            "SELECT type, scoring FROM public.question WHERE id = ? LIMIT 1",
            ps -> ps.setObject(1, questionId),
            rs -> rs.next()
                ? new Meta(rs.getString("type"), parseJsonSafe(rs.getString("scoring")))
                : null
        );
        if (meta == null) return incoming;

        String type = normalizeType(meta.type());
        if (isRating(type)) {
            return RatingScaleUtil.normalize(objectMapper, incoming, meta.scoring());
        }
        return incoming;
    }

    private static boolean isRating(String type) {
        return switch (type) {
            case "rating_scale", "rating", "range" -> true;
            default -> false;
        };
    }

    private String normalizeType(String t) {
        String s = t == null ? "" : t.toLowerCase();
        return switch (s) {
            case "rating", "range" -> "rating_scale";
            default -> s;
        };
    }

    private JsonNode parseJsonSafe(String json) {
        try { return json == null ? null : objectMapper.readTree(json); }
        catch (Exception e) { return null; }
    }

    private record Meta(String type, JsonNode scoring) {}
}