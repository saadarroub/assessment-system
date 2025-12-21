package com.assessment.backend.service;

import com.assessment.backend.entity.ReifegradInterval;
import com.assessment.backend.entity.ReifegradModel;
import com.assessment.backend.repository.ReifegradModelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReifegradModelService {

    private final ReifegradModelRepository modelRepository;

    public ReifegradModelService(ReifegradModelRepository modelRepository) {
        this.modelRepository = modelRepository;
    }

    public List<ReifegradModel> findAll() {
        return modelRepository.findAll();
    }

    public ReifegradModel findById(UUID id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReifegradModel not found: " + id));
    }

    @Transactional
    public ReifegradModel create(ReifegradModel model) {
        // assurer la relation bidirectionnelle
        if (model.getIntervals() != null) {
            for (ReifegradInterval interval : model.getIntervals()) {
                interval.setModel(model);
            }
        }
        return modelRepository.save(model);
    }

    @Transactional
    public ReifegradModel update(UUID id, ReifegradModel input) {
        ReifegradModel existing = findById(id);

        existing.setName(input.getName());
        existing.setDescription(input.getDescription());

        // on remplace complètement la liste (simple et clair)
        existing.getIntervals().clear();
        if (input.getIntervals() != null) {
            int i = 0;
            for (ReifegradInterval interval : input.getIntervals()) {
                interval.setModel(existing);
                if (interval.getSortOrder() == null) {
                    interval.setSortOrder(i);
                }
                existing.getIntervals().add(interval);
                i++;
            }
        }

        // updatedAt
        // si tu n’as pas de setUpdatedAt, tu peux laisser ça, vu que tu le mets via setName/setDescription
        return modelRepository.save(existing);
    }

    public void delete(UUID id) {
        modelRepository.deleteById(id);
    }
}
