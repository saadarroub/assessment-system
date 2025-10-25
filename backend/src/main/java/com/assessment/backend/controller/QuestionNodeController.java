package com.assessment.backend.controller;

import com.assessment.backend.entity.QuestionNode;
import com.assessment.backend.service.QuestionNodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/question-nodes")
@CrossOrigin(origins = "*")
public class QuestionNodeController {
    
    @Autowired
    private QuestionNodeService questionNodeService;

    // Create - POST /api/question-nodes
    @PostMapping
    public ResponseEntity<QuestionNode> createQuestionNode(@RequestBody QuestionNode questionNode) {
        try {
            QuestionNode createdNode = questionNodeService.createQuestionNode(questionNode);
            return new ResponseEntity<>(createdNode, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read All - GET /api/question-nodes
    @GetMapping
    public ResponseEntity<List<QuestionNode>> getAllQuestionNodes() {
        try {
            List<QuestionNode> nodes = questionNodeService.getAllQuestionNodes();
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By ID - GET /api/question-nodes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<QuestionNode> getQuestionNodeById(@PathVariable("id") UUID id) {
        try {
            Optional<QuestionNode> node = questionNodeService.getQuestionNodeById(id);
            return node.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Thema - GET /api/question-nodes/thema/{themaId}
    @GetMapping("/thema/{themaId}")
    public ResponseEntity<List<QuestionNode>> getQuestionNodesByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            // Use WithDetails to avoid lazy loading issues
            List<QuestionNode> nodes = questionNodeService.getQuestionNodesByThemaIdWithDetails(themaId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Thema with Details - GET /api/question-nodes/thema/{themaId}/details
    @GetMapping("/thema/{themaId}/details")
    public ResponseEntity<List<QuestionNode>> getQuestionNodesByThemaIdWithDetails(@PathVariable("themaId") UUID themaId) {
        try {
            List<QuestionNode> nodes = questionNodeService.getQuestionNodesByThemaIdWithDetails(themaId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read Root Nodes by Thema - GET /api/question-nodes/thema/{themaId}/root
    @GetMapping("/thema/{themaId}/root")
    public ResponseEntity<List<QuestionNode>> getRootNodesByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            // Use WithDetails to avoid lazy loading issues (question will be loaded)
            List<QuestionNode> nodes = questionNodeService.getRootNodesByThemaIdWithDetails(themaId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read Root Nodes by Thema with Details - GET /api/question-nodes/thema/{themaId}/root/details
    @GetMapping("/thema/{themaId}/root/details")
    public ResponseEntity<List<QuestionNode>> getRootNodesByThemaIdWithDetails(@PathVariable("themaId") UUID themaId) {
        try {
            List<QuestionNode> nodes = questionNodeService.getRootNodesByThemaIdWithDetails(themaId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read Child Nodes by Parent - GET /api/question-nodes/parent/{parentNodeId}/children
    @GetMapping("/parent/{parentNodeId}/children")
    public ResponseEntity<List<QuestionNode>> getChildNodesByParentId(@PathVariable("parentNodeId") UUID parentNodeId) {
        try {
            // Use WithDetails to avoid lazy loading issues
            List<QuestionNode> nodes = questionNodeService.getChildNodesByParentIdWithDetails(parentNodeId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read Child Nodes by Parent with Details - GET /api/question-nodes/parent/{parentNodeId}/children/details
    @GetMapping("/parent/{parentNodeId}/children/details")
    public ResponseEntity<List<QuestionNode>> getChildNodesByParentIdWithDetails(@PathVariable("parentNodeId") UUID parentNodeId) {
        try {
            List<QuestionNode> nodes = questionNodeService.getChildNodesByParentIdWithDetails(parentNodeId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Question - GET /api/question-nodes/question/{questionId}
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<QuestionNode>> getQuestionNodesByQuestionId(@PathVariable("questionId") UUID questionId) {
        try {
            List<QuestionNode> nodes = questionNodeService.getQuestionNodesByQuestionId(questionId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Question and Thema - GET /api/question-nodes/question/{questionId}/thema/{themaId}
    @GetMapping("/question/{questionId}/thema/{themaId}")
    public ResponseEntity<QuestionNode> getQuestionNodeByQuestionAndThema(
            @PathVariable("questionId") UUID questionId,
            @PathVariable("themaId") UUID themaId) {
        try {
            Optional<QuestionNode> node = questionNodeService.getQuestionNodeByQuestionAndThema(questionId, themaId);
            return node.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read Required Nodes by Thema - GET /api/question-nodes/thema/{themaId}/required
    @GetMapping("/thema/{themaId}/required")
    public ResponseEntity<List<QuestionNode>> getRequiredNodesByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            List<QuestionNode> nodes = questionNodeService.getRequiredNodesByThemaId(themaId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read Optional Nodes by Thema - GET /api/question-nodes/thema/{themaId}/optional
    @GetMapping("/thema/{themaId}/optional")
    public ResponseEntity<List<QuestionNode>> getOptionalNodesByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            List<QuestionNode> nodes = questionNodeService.getOptionalNodesByThemaId(themaId);
            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update - PUT /api/question-nodes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<QuestionNode> updateQuestionNode(
            @PathVariable("id") UUID id,
            @RequestBody QuestionNode questionNode) {
        try {
            QuestionNode updatedNode = questionNodeService.updateQuestionNode(id, questionNode);
            return new ResponseEntity<>(updatedNode, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update Order Index - PATCH /api/question-nodes/{id}/order
    @PatchMapping("/{id}/order")
    public ResponseEntity<QuestionNode> updateOrderIndex(
            @PathVariable("id") UUID id,
            @RequestParam("orderIndex") Integer orderIndex) {
        try {
            QuestionNode updatedNode = questionNodeService.updateOrderIndex(id, orderIndex);
            return new ResponseEntity<>(updatedNode, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Move Node - PATCH /api/question-nodes/{id}/move
    @PatchMapping("/{id}/move")
    public ResponseEntity<QuestionNode> moveQuestionNode(
            @PathVariable("id") UUID id,
            @RequestParam(value = "newParentId", required = false) UUID newParentId,
            @RequestParam(value = "position", required = false) Integer position) {
        try {
            QuestionNode moved = questionNodeService.moveQuestionNode(id, newParentId, position);
            return new ResponseEntity<>(moved, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update Required Status - PATCH /api/question-nodes/{id}/required
    @PatchMapping("/{id}/required")
    public ResponseEntity<QuestionNode> updateRequiredStatus(
            @PathVariable("id") UUID id,
            @RequestParam("isRequired") Boolean isRequired) {
        try {
            QuestionNode updatedNode = questionNodeService.updateRequiredStatus(id, isRequired);
            return new ResponseEntity<>(updatedNode, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete - DELETE /api/question-nodes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteQuestionNode(@PathVariable("id") UUID id) {
        try {
            questionNodeService.deleteQuestionNode(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all by Thema - DELETE /api/question-nodes/thema/{themaId}
    @DeleteMapping("/thema/{themaId}")
    public ResponseEntity<HttpStatus> deleteAllNodesByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            questionNodeService.deleteAllNodesByThemaId(themaId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all by Question - DELETE /api/question-nodes/question/{questionId}
    @DeleteMapping("/question/{questionId}")
    public ResponseEntity<HttpStatus> deleteAllNodesByQuestionId(@PathVariable("questionId") UUID questionId) {
        try {
            questionNodeService.deleteAllNodesByQuestionId(questionId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check Exists - GET /api/question-nodes/exists?questionId={questionId}&themaId={themaId}
    @GetMapping("/exists")
    public ResponseEntity<Boolean> existsByQuestionAndThema(
            @RequestParam("questionId") UUID questionId,
            @RequestParam("themaId") UUID themaId) {
        try {
            boolean exists = questionNodeService.existsByQuestionAndThema(questionId, themaId);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count - GET /api/question-nodes/count
    @GetMapping("/count")
    public ResponseEntity<Long> countQuestionNodes() {
        try {
            long count = questionNodeService.count();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count by Thema - GET /api/question-nodes/count/thema/{themaId}
    @GetMapping("/count/thema/{themaId}")
    public ResponseEntity<Long> countByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            long count = questionNodeService.countByThemaId(themaId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count by Parent Node - GET /api/question-nodes/count/parent/{parentNodeId}
    @GetMapping("/count/parent/{parentNodeId}")
    public ResponseEntity<Long> countByParentNodeId(@PathVariable("parentNodeId") UUID parentNodeId) {
        try {
            long count = questionNodeService.countByParentNodeId(parentNodeId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count Required by Thema - GET /api/question-nodes/count/thema/{themaId}/required
    @GetMapping("/count/thema/{themaId}/required")
    public ResponseEntity<Long> countRequiredByThemaId(@PathVariable("themaId") UUID themaId) {
        try {
            long count = questionNodeService.countRequiredByThemaId(themaId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
