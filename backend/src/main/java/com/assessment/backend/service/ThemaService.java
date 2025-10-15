package com.assessment.backend.service;

import com.assessment.backend.entity.Thema;
import com.assessment.backend.repository.ThemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ThemaService {
    
    @Autowired
    private ThemaRepository themaRepository;

    // Create
    public Thema createThema(Thema thema) {
        return themaRepository.save(thema);
    }

    // Read - All
    public List<Thema> getAllThemas() {
        return themaRepository.findAll();
    }

    // Read - By ID
    public Optional<Thema> getThemaById(UUID id) {
        return themaRepository.findById(id);
    }

    // Read - By Name
    public Optional<Thema> getThemaByName(String name) {
        return themaRepository.findByName(name);
    }

    // Read - By Name Containing
    public List<Thema> searchThemasByName(String name) {
        return themaRepository.findByNameContainingIgnoreCase(name);
    }

    // Update
    public Thema updateThema(UUID id, Thema themaDetails) {
        Thema thema = themaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thema not found with id: " + id));

        thema.setName(themaDetails.getName());
        thema.setDescription(themaDetails.getDescription());
        
        return themaRepository.save(thema);
    }

    // Delete
    public void deleteThema(UUID id) {
        Thema thema = themaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thema not found with id: " + id));
        
        themaRepository.delete(thema);
    }

    // Check if exists by ID
    public boolean existsById(UUID id) {
        return themaRepository.existsById(id);
    }

    // Check if exists by Name
    public boolean existsByName(String name) {
        return themaRepository.existsByName(name);
    }

    // Count
    public long count() {
        return themaRepository.count();
    }
}
