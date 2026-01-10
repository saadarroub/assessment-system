package com.assessment.backend.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class JsonbParser {

  private static final ObjectMapper objectMapper = new ObjectMapper();
  private static final DateTimeFormatter DATE_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd");

  /**
   * JSONB -> String
   */
  public static String parseString(String jsonb) {
    JsonNode node = readNode(jsonb);
    if (node == null) return null;

    // Objekt: ersten Wert nehmen
    if (node.isObject()) {
      JsonNode firstValue = node.fields().next().getValue();
      return firstValue.asText().trim();
    }

    // Primitives oder Array: direkt konvertieren
    return node.asText().trim();
  }

  /**
   * JSONB -> Set<String>
   * Erwartet z.B.: ["A", "B", "C"] oder {"values": ["A","B"]}
   */
  public static Set<String> parseStringSet(String jsonb) {
    JsonNode node = readNode(jsonb);
    if (node == null) return Set.of();

    Set<String> result = new HashSet<>();

    if (node.isArray()) {
      node.forEach(n -> result.add(n.asText().trim()));
    } else if (node.isObject()) {
      node.fields().forEachRemaining(entry -> {
        JsonNode valueNode = entry.getValue();
        if (valueNode.isArray()) {
          valueNode.forEach(n -> result.add(n.asText().trim()));
        } else {
          result.add(valueNode.asText().trim());
        }
      });
    } else {
      result.add(node.asText().trim());
    }

    return result;
  }

  /**
   * JSONB -> Long
   */
  public static Long parseLong(String jsonb) {
    JsonNode node = readNode(jsonb);
    if (node == null) return null;

    if (node.isNumber()) {
      return node.asLong();
    } else if (node.isObject()) {
      JsonNode firstValue = node.fields().next().getValue();
      return firstValue.isNumber() ? firstValue.asLong() : null;
    }

    try {
      return Long.parseLong(node.asText().trim());
    } catch (NumberFormatException e) {
      return null;
    }
  }

  /**
   * JSONB -> LocalDate (Format yyyy.MM.dd)
   */
  public static LocalDate parseDate(String jsonb) {
    JsonNode node = readNode(jsonb);
    if (node == null) return null;

    String text;
    if (node.isObject()) {
      text = node.fields().next().getValue().asText().trim();
    } else {
      text = node.asText().trim();
    }

    if (text.isBlank()) return null;

    return LocalDate.parse(text, DATE_FORMAT);
  }

  /**
   * Zentrale JSON-Lese-Logik
   */
  private static JsonNode readNode(String jsonb) {
    if (jsonb == null || jsonb.isBlank()) return null;

    try {
      return objectMapper.readTree(jsonb);
    } catch (Exception e) {
      throw new IllegalArgumentException("Ungültiges JSONB: " + jsonb, e);
    }
  }

  public static Map<String, UUID> readTargetFromDbJson(String targetJson) {
    try {
      if (targetJson == null || targetJson.isBlank()) {
        return Map.of();
      }
      return objectMapper.readValue(targetJson, new TypeReference<Map<String, UUID>>() {});
    } catch (JsonProcessingException e) {
      throw new IllegalArgumentException("target (jsonb) konnte nicht zu Map<String, UUID> geparsed werden", e);
    }
  }
}