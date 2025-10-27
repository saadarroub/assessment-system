package com.assessment.backend.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public final class RatingScaleUtil {

    private RatingScaleUtil() {}

    public static Map<String, Object> normalize(ObjectMapper mapper, Object incoming, JsonNode scoring) {
        double min = scoring != null && scoring.has("min") ? scoring.get("min").asDouble(0.0) : 0.0;
        double max = scoring != null && scoring.has("max") ? scoring.get("max").asDouble(5.0) : 5.0;
        double step = scoring != null && scoring.has("step") ? scoring.get("step").asDouble(1.0) : 1.0;

        double raw = extractNumeric(mapper, incoming);
        raw = Math.max(min, Math.min(max, raw));

        if (step > 0) {
            double stepsFromMin = Math.round((raw - min) / step);
            raw = min + stepsFromMin * step;
            raw = Math.max(min, Math.min(max, raw));
        }

        double denom = (max - min);
        int normalized;
        if (denom <= 0.0) {
            normalized = 0;
        } else {
            double frac = (raw - min) / denom;
            int bucket = (int)Math.round(frac * 5.0);
            normalized = Math.max(0, Math.min(5, bucket));
        }

        Map<String, Object> out = new HashMap<>();
        out.put("rating", toBigDecimal(raw));
        out.put("normalized", normalized);
        out.put("min", toBigDecimal(min));
        out.put("max", toBigDecimal(max));
        out.put("step", toBigDecimal(step));
        return out;
    }

    private static double extractNumeric(ObjectMapper mapper, Object incoming) {
        try {
            if (incoming == null) return 0.0;
            var node = mapper.valueToTree(incoming);
            if (node.isNumber()) return node.asDouble();
            if (node.isTextual()) return Double.parseDouble(node.asText().trim());
            if (node.has("rating")) return node.get("rating").asDouble();
            if (node.has("value")) return node.get("value").asDouble();
        } catch (Exception ignore) {}
        return 0.0;
    }

    private static BigDecimal toBigDecimal(double d) {
        return BigDecimal.valueOf(d).stripTrailingZeros();
    }
}