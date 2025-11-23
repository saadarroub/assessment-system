package com.assessment.backend.service;

import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionNode;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.repository.QuestionNodeRepository;
import com.assessment.backend.repository.QuestionRepository;
import com.assessment.backend.repository.ThemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ThemaService {
    
    @Autowired
    private ThemaRepository themaRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionNodeRepository questionNodeRepository;

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

    // Duplicate Thema with all Questions and QuestionNodes
    @Transactional
    public Thema duplicateThema(UUID themaId) {
        // 1. Find original Thema
        Thema originalThema = themaRepository.findById(themaId)
                .orElseThrow(() -> new RuntimeException("Thema not found with id: " + themaId));

        // 2. Create new Thema with "(Kopie)" suffix
        Thema newThema = new Thema();
        newThema.setName(originalThema.getName() + " (Kopie)");
        newThema.setDescription(originalThema.getDescription());
        newThema.setStatus(originalThema.getStatus());
        newThema = themaRepository.save(newThema);

        // 3. Get all QuestionNodes from original Thema
        List<QuestionNode> originalNodes = questionNodeRepository.findByThemaIdOrderByOrderIndexAsc(themaId);

        // 4. Create maps for UUID remapping
        Map<UUID, UUID> oldToNewQuestionId = new HashMap<>();
        Map<UUID, UUID> oldToNewNodeId = new HashMap<>();

        // 5. First pass: Copy all Questions
        for (QuestionNode originalNode : originalNodes) {
            Question originalQuestion = originalNode.getQuestion();
            UUID oldQuestionId = originalQuestion.getId();

            // Check if we already copied this question
            if (!oldToNewQuestionId.containsKey(oldQuestionId)) {
                // Create new Question (deep copy)
                Question newQuestion = new Question();
                newQuestion.setText(originalQuestion.getText());
                newQuestion.setQuestionType(originalQuestion.getQuestionType());
                newQuestion.setOptions(originalQuestion.getOptions());
                newQuestion.setScoringSchema(originalQuestion.getScoringSchema());
                newQuestion = questionRepository.save(newQuestion);

                // Store mapping
                oldToNewQuestionId.put(oldQuestionId, newQuestion.getId());
            }
        }

        // 6. Second pass: Copy all QuestionNodes with remapped references
        for (QuestionNode originalNode : originalNodes) {
            // Create new QuestionNode
            QuestionNode newNode = new QuestionNode();
            newNode.setThema(newThema);

            // Get the copied Question
            UUID oldQuestionId = originalNode.getQuestion().getId();
            UUID newQuestionId = oldToNewQuestionId.get(oldQuestionId);
            Question newQuestion = questionRepository.findById(newQuestionId)
                    .orElseThrow(() -> new RuntimeException("Copied question not found"));
            newNode.setQuestion(newQuestion);

            // Set order_index and is_required
            newNode.setOrderIndex(originalNode.getOrderIndex());
            newNode.setIsRequired(originalNode.getIsRequired());

            // Parent will be set later (null for now)
            newNode.setParentNode(null);

            // Save and store mapping
            newNode = questionNodeRepository.save(newNode);
            oldToNewNodeId.put(originalNode.getId(), newNode.getId());
        }

        // 7. Third pass: Update parent_node_id references
        for (QuestionNode originalNode : originalNodes) {
            if (originalNode.getParentNode() != null) {
                UUID oldNodeId = originalNode.getId();
                UUID newNodeId = oldToNewNodeId.get(oldNodeId);

                UUID oldParentId = originalNode.getParentNode().getId();
                UUID newParentId = oldToNewNodeId.get(oldParentId);

                if (newNodeId != null && newParentId != null) {
                    QuestionNode newNode = questionNodeRepository.findById(newNodeId)
                            .orElseThrow(() -> new RuntimeException("Copied node not found"));
                    QuestionNode newParent = questionNodeRepository.findById(newParentId)
                            .orElseThrow(() -> new RuntimeException("Copied parent node not found"));

                    newNode.setParentNode(newParent);
                    questionNodeRepository.save(newNode);
                }
            }
        }

        return newThema;
    }
}
