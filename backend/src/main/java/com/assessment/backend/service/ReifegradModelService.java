package com.assessment.backend.service;

import com.assessment.backend.dto.ReifegradIntervalDTO;
import com.assessment.backend.dto.ReifegradModelDTO;
import com.assessment.backend.entity.ReifegradModel;
import com.assessment.backend.repository.ReifegradModelRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReifegradModelService {

    private final ReifegradModelRepository modelRepository;
    private final ObjectMapper objectMapper;

    public ReifegradModelService(ReifegradModelRepository modelRepository, ObjectMapper objectMapper) {
        this.modelRepository = modelRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Alle Modelle als DTOs zurückgeben
     */
    public List<ReifegradModelDTO> findAll() {
        return modelRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Ein Modell per ID als DTO
     */
    public ReifegradModelDTO findById(UUID id) {
        ReifegradModel model = modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReifegradModel not found: " + id));
        return toDTO(model);
    }

    /**
     * Entity per ID laden (für interne Nutzung, z.B. Catalog-Verknüpfung)
     */
    public ReifegradModel findEntityById(UUID id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReifegradModel not found: " + id));
    }

    /**
     * Neues Modell erstellen
     */
    @Transactional
    public ReifegradModelDTO create(ReifegradModelDTO dto) {
        ReifegradModel entity = new ReifegradModel();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setIntervalsJson(intervalsToJson(dto.getIntervals()));

        ReifegradModel saved = modelRepository.save(entity);
        return toDTO(saved);
    }

    /**
     * Bestehendes Modell aktualisieren
     */
    @Transactional
    public ReifegradModelDTO update(UUID id, ReifegradModelDTO dto) {
        ReifegradModel existing = modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReifegradModel not found: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setIntervalsJson(intervalsToJson(dto.getIntervals()));

        ReifegradModel saved = modelRepository.save(existing);
        return toDTO(saved);
    }

    /**
     * Modell löschen
     */
    @Transactional
    public void delete(UUID id) {
        if (!modelRepository.existsById(id)) {
            throw new RuntimeException("ReifegradModel not found: " + id);
        }
        modelRepository.deleteById(id);
    }

    // ========== Mapping Helpers ==========

    private ReifegradModelDTO toDTO(ReifegradModel entity) {
        ReifegradModelDTO dto = new ReifegradModelDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIntervals(jsonToIntervals(entity.getIntervalsJson()));
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private String intervalsToJson(List<ReifegradIntervalDTO> intervals) {
        if (intervals == null || intervals.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(intervals);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Fehler beim Serialisieren der Intervalle", e);
        }
    }

    private List<ReifegradIntervalDTO> jsonToIntervals(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<ReifegradIntervalDTO>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Fehler beim Parsen der Intervalle aus JSON", e);
        }
    }
}
