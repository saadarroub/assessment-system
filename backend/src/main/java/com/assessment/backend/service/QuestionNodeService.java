package com.assessment.backend.service;

import com.assessment.backend.entity.QuestionNode;
import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.Thema;
import com.assessment.backend.repository.QuestionNodeRepository;
import com.assessment.backend.repository.QuestionRepository;
import com.assessment.backend.repository.ThemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuestionNodeService {
    
    @Autowired
    private QuestionNodeRepository questionNodeRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private ThemaRepository themaRepository;

    // Create
    @Transactional
    public QuestionNode createQuestionNode(QuestionNode questionNode) {
        // Validate Thema exists
        if (questionNode.getThema() != null && questionNode.getThema().getId() != null) {
            Thema thema = themaRepository.findById(questionNode.getThema().getId())
                    .orElseThrow(() -> new RuntimeException("Thema not found with id: " + questionNode.getThema().getId()));
            questionNode.setThema(thema);
        } else {
            throw new RuntimeException("Thema is required");
        }
        
        // Validate Question exists
        if (questionNode.getQuestion() != null && questionNode.getQuestion().getId() != null) {
            Question question = questionRepository.findById(questionNode.getQuestion().getId())
                    .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionNode.getQuestion().getId()));
            questionNode.setQuestion(question);
        } else {
            throw new RuntimeException("Question is required");
        }
        
        // Validate Parent Node if provided
        if (questionNode.getParentNode() != null && questionNode.getParentNode().getId() != null) {
            QuestionNode parentNode = questionNodeRepository.findById(questionNode.getParentNode().getId())
                    .orElseThrow(() -> new RuntimeException("Parent Node not found with id: " + questionNode.getParentNode().getId()));
            questionNode.setParentNode(parentNode);
        }
        
        // Check if node already exists
        if (questionNodeRepository.existsByQuestionIdAndThemaId(
                questionNode.getQuestion().getId(), 
                questionNode.getThema().getId())) {
            throw new RuntimeException("Question already exists in this Thema");
        }
        
        // Always auto-assign orderIndex (ignore client value, always append to siblings with GAP strategy)
        UUID parentId = questionNode.getParentNode() == null ? null : questionNode.getParentNode().getId();
        List<QuestionNode> siblings = questionNodeRepository.findByParentNodeIdOrderByOrderIndexAsc(parentId);
        final int GAP = 10;
        if (siblings.isEmpty()) {
            questionNode.setOrderIndex(GAP);
        } else {
            Integer maxIndex = siblings.get(siblings.size() - 1).getOrderIndex();
            questionNode.setOrderIndex(maxIndex + GAP);
        }
        
        return questionNodeRepository.save(questionNode);
    }

    // Read - All
    public List<QuestionNode> getAllQuestionNodes() {
        return questionNodeRepository.findAll();
    }

    // Read - By ID
    public Optional<QuestionNode> getQuestionNodeById(UUID id) {
        return questionNodeRepository.findById(id);
    }

    // Read - By Thema
    public List<QuestionNode> getQuestionNodesByThemaId(UUID themaId) {
        return questionNodeRepository.findByThemaIdOrderByOrderIndexAsc(themaId);
    }

    // Read - By Thema with Details (EAGER)
    public List<QuestionNode> getQuestionNodesByThemaIdWithDetails(UUID themaId) {
        return questionNodeRepository.findByThemaIdWithDetails(themaId);
    }

    // Read - Root Nodes by Thema
    public List<QuestionNode> getRootNodesByThemaId(UUID themaId) {
        return questionNodeRepository.findRootNodesByThemaId(themaId);
    }

    // Read - Root Nodes by Thema with Details
    public List<QuestionNode> getRootNodesByThemaIdWithDetails(UUID themaId) {
        return questionNodeRepository.findRootNodesByThemaIdWithDetails(themaId);
    }

    // Read - Child Nodes by Parent
    public List<QuestionNode> getChildNodesByParentId(UUID parentNodeId) {
        return questionNodeRepository.findByParentNodeIdOrderByOrderIndexAsc(parentNodeId);
    }

    // Read - Child Nodes by Parent with Details
    public List<QuestionNode> getChildNodesByParentIdWithDetails(UUID parentNodeId) {
        return questionNodeRepository.findByParentNodeIdWithDetails(parentNodeId);
    }

    // Read - By Question
    public List<QuestionNode> getQuestionNodesByQuestionId(UUID questionId) {
        return questionNodeRepository.findByQuestionId(questionId);
    }

    // Read - By Question and Thema
    public Optional<QuestionNode> getQuestionNodeByQuestionAndThema(UUID questionId, UUID themaId) {
        return questionNodeRepository.findByQuestionIdAndThemaId(questionId, themaId);
    }

    // Read - Required Nodes by Thema
    public List<QuestionNode> getRequiredNodesByThemaId(UUID themaId) {
        return questionNodeRepository.findRequiredNodesByThemaId(themaId);
    }

    // Read - Optional Nodes by Thema
    public List<QuestionNode> getOptionalNodesByThemaId(UUID themaId) {
        return questionNodeRepository.findOptionalNodesByThemaId(themaId);
    }

    // Update
    @Transactional
    public QuestionNode updateQuestionNode(UUID id, QuestionNode questionNodeDetails) {
        QuestionNode questionNode = questionNodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuestionNode not found with id: " + id));
        
        // Update Thema if provided
        if (questionNodeDetails.getThema() != null && questionNodeDetails.getThema().getId() != null) {
            Thema thema = themaRepository.findById(questionNodeDetails.getThema().getId())
                    .orElseThrow(() -> new RuntimeException("Thema not found with id: " + questionNodeDetails.getThema().getId()));
            questionNode.setThema(thema);
        }
        
        // Update Question if provided
        if (questionNodeDetails.getQuestion() != null && questionNodeDetails.getQuestion().getId() != null) {
            Question question = questionRepository.findById(questionNodeDetails.getQuestion().getId())
                    .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionNodeDetails.getQuestion().getId()));
            questionNode.setQuestion(question);
        }
        
        // Update Parent Node if provided
        if (questionNodeDetails.getParentNode() != null && questionNodeDetails.getParentNode().getId() != null) {
            QuestionNode parentNode = questionNodeRepository.findById(questionNodeDetails.getParentNode().getId())
                    .orElseThrow(() -> new RuntimeException("Parent Node not found with id: " + questionNodeDetails.getParentNode().getId()));
            questionNode.setParentNode(parentNode);
        }
        
        // Update other fields
        if (questionNodeDetails.getOrderIndex() != null) {
            questionNode.setOrderIndex(questionNodeDetails.getOrderIndex());
        }
        if (questionNodeDetails.getIsRequired() != null) {
            questionNode.setIsRequired(questionNodeDetails.getIsRequired());
        }
        
        return questionNodeRepository.save(questionNode);
    }

    // Update Order Index
    @Transactional
    public QuestionNode updateOrderIndex(UUID id, Integer newOrderIndex) {
        QuestionNode questionNode = questionNodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuestionNode not found with id: " + id));
        
        questionNode.setOrderIndex(newOrderIndex);
        return questionNodeRepository.save(questionNode);
    }

    // Update Required Status
    @Transactional
    public QuestionNode updateRequiredStatus(UUID id, Boolean isRequired) {
        QuestionNode questionNode = questionNodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuestionNode not found with id: " + id));
        
        questionNode.setIsRequired(isRequired);
        return questionNodeRepository.save(questionNode);
    }

    // Delete
    @Transactional
    public void deleteQuestionNode(UUID id) {
        QuestionNode questionNode = questionNodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuestionNode not found with id: " + id));
        
        questionNodeRepository.delete(questionNode);
    }

    // Delete all nodes by Thema
    @Transactional
    public void deleteAllNodesByThemaId(UUID themaId) {
        questionNodeRepository.deleteByThemaId(themaId);
    }

    // Delete all nodes by Question
    @Transactional
    public void deleteAllNodesByQuestionId(UUID questionId) {
        questionNodeRepository.deleteByQuestionId(questionId);
    }

    // Check if exists
    public boolean existsByQuestionAndThema(UUID questionId, UUID themaId) {
        return questionNodeRepository.existsByQuestionIdAndThemaId(questionId, themaId);
    }

    // Count
    public long count() {
        return questionNodeRepository.count();
    }

    // Count by Thema
    public long countByThemaId(UUID themaId) {
        return questionNodeRepository.countByThemaId(themaId);
    }

    // Count by Parent Node
    public long countByParentNodeId(UUID parentNodeId) {
        return questionNodeRepository.countByParentNodeId(parentNodeId);
    }

    // Count Required by Thema
    public long countRequiredByThemaId(UUID themaId) {
        return questionNodeRepository.countRequiredNodesByThemaId(themaId);
    }

    // Move node to new parent and position (position is 0-based index among siblings)
    @Transactional
    public QuestionNode moveQuestionNode(UUID nodeId, UUID newParentNodeId, Integer targetPosition) {
        QuestionNode node = questionNodeRepository.findById(nodeId)
                .orElseThrow(() -> new RuntimeException("QuestionNode not found with id: " + nodeId));

        // Validate new parent if provided
        QuestionNode newParent = null;
        if (newParentNodeId != null) {
            newParent = questionNodeRepository.findById(newParentNodeId)
                    .orElseThrow(() -> new RuntimeException("Parent Node not found with id: " + newParentNodeId));
            // Thema must match
            if (!newParent.getThema().getId().equals(node.getThema().getId())) {
                throw new RuntimeException("Thema mismatch when moving node");
            }
            // no cycles
            if (isDescendant(newParent.getId(), node.getId())) {
                throw new RuntimeException("Move would create cycle");
            }
        }

        // load siblings under new parent ordered (EXCLUDE the node being moved!)
        List<QuestionNode> siblings = questionNodeRepository.findByParentNodeIdOrderByOrderIndexAsc(
                newParent == null ? null : newParent.getId());
        
        // Remove the node being moved from siblings list (if it's already there)
        siblings.removeIf(s -> s.getId().equals(nodeId));

        final int GAP = 10; // integer gap strategy to avoid frequent reindex
        Integer newIndex;
        if (siblings == null || siblings.isEmpty()) {
            newIndex = GAP;
        } else {
            if (targetPosition == null || targetPosition >= siblings.size()) {
                // append to end
                Integer last = siblings.get(siblings.size() - 1).getOrderIndex();
                newIndex = last + GAP;
            } else if (targetPosition <= 0) {
                Integer first = siblings.get(0).getOrderIndex();
                newIndex = first - GAP;
                if (newIndex <= 0) {
                    // ensure positive orderIndex by reindexing
                    reindexSiblings(newParent == null ? null : newParent.getId());
                    siblings = questionNodeRepository.findByParentNodeIdOrderByOrderIndexAsc(
                            newParent == null ? null : newParent.getId());
                    newIndex = siblings.get(0).getOrderIndex() - GAP;
                }
            } else {
                Integer prev = siblings.get(targetPosition - 1).getOrderIndex();
                Integer next = siblings.get(targetPosition).getOrderIndex();
                if (next - prev > 1) {
                    newIndex = prev + (next - prev) / 2;
                } else {
                    // no gap -> reindex siblings to create gaps then recompute
                    reindexSiblings(newParent == null ? null : newParent.getId());
                    siblings = questionNodeRepository.findByParentNodeIdOrderByOrderIndexAsc(
                            newParent == null ? null : newParent.getId());
                    prev = siblings.get(targetPosition - 1).getOrderIndex();
                    next = siblings.get(targetPosition).getOrderIndex();
                    newIndex = prev + (next - prev) / 2;
                    if (newIndex.equals(prev) || newIndex.equals(next)) {
                        // fallback: place after prev
                        newIndex = prev + GAP;
                    }
                }
            }
        }

        // Apply move
        node.setParentNode(newParent);
        node.setOrderIndex(newIndex);
        return questionNodeRepository.save(node);
    }

    // Reindex siblings to 10,20,30,... to restore gaps
    @Transactional
    public void reindexSiblings(UUID parentNodeId) {
        List<QuestionNode> siblings = questionNodeRepository.findByParentNodeIdOrderByOrderIndexAsc(parentNodeId);
        final int GAP = 10;
        int idx = GAP;
        for (QuestionNode s : siblings) {
            s.setOrderIndex(idx);
            idx += GAP;
        }
        if (!siblings.isEmpty()) questionNodeRepository.saveAll(siblings);
    }

    // Check if possibleParentId is a descendant of nodeId (to prevent cycles)
    public boolean isDescendant(UUID possibleParentId, UUID nodeId) {
        UUID current = possibleParentId;
        while (current != null) {
            if (current.equals(nodeId)) return true;
            Optional<QuestionNode> p = questionNodeRepository.findById(current);
            if (p.isEmpty()) break;
            current = p.get().getParentNode() == null ? null : p.get().getParentNode().getId();
        }
        return false;
    }
}
