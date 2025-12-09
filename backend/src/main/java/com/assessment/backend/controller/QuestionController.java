package com.assessment.backend.controller;

import com.assessment.backend.dto.QuestionDTO;
import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionType;
import com.assessment.backend.repository.QuestionTypeRepository;
import com.assessment.backend.service.QuestionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {
    
    @Autowired
    private QuestionService questionService;
    
    @Autowired
    private QuestionTypeRepository questionTypeRepository;
    
    @Autowired
    private ObjectMapper objectMapper;

    // Create - POST /api/questions (mit DTO - automatische JSON-Konvertierung)
    @PostMapping
    @PreAuthorize("hasAuthority('questions.create')")
    public ResponseEntity<?> createQuestion(@RequestBody QuestionDTO dto) {
        try {
            // DTO → Entity konvertieren
            Question question = new Question();
            question.setText(dto.getText());
            
            // QuestionType laden
            if (dto.getQuestionType() != null && dto.getQuestionType().getId() != null) {
                QuestionType questionType = questionTypeRepository.findById(dto.getQuestionType().getId())
                    .orElseThrow(() -> new RuntimeException("QuestionType not found"));
                question.setQuestionType(questionType);
            }
            
            // JSON-Objekte → String (automatisch serialisiert)
            if (dto.getOptions() != null) {
                question.setOptions(objectMapper.writeValueAsString(dto.getOptions()));
            }
            if (dto.getScoringSchema() != null) {
                question.setScoringSchema(objectMapper.writeValueAsString(dto.getScoringSchema()));
            }
            
            // isScorable setzen (default: true)
            question.setIsScorable(dto.getIsScorable() != null ? dto.getIsScorable() : true);
            
            Question createdQuestion = questionService.createQuestion(question);
            
            // Response mit deserialisierten JSON-Objekten (HashMap erlaubt null-Werte)
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", createdQuestion.getId());
            response.put("text", createdQuestion.getText());
            response.put("questionType", createdQuestion.getQuestionType());
            response.put("options", parseJsonSafe(createdQuestion.getOptions()));
            response.put("scoringSchema", parseJsonSafe(createdQuestion.getScoringSchema()));
            response.put("isScorable", createdQuestion.getIsScorable());
            response.put("createdAt", createdQuestion.getCreatedAt());
            response.put("updatedAt", createdQuestion.getUpdatedAt());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid JSON format: " + e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    private Object parseJsonSafe(String json) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json; // Fallback: Return as string
        }
    }

    // Read All - GET /api/questions
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        try {
            List<Question> questions = questionService.getAllQuestions();
            if (questions.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By ID - GET /api/questions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable("id") UUID id) {
        try {
            Optional<Question> question = questionService.getQuestionById(id);
            return question.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Question Type ID - GET /api/questions/type/{typeId}
    @GetMapping("/type/{typeId}")
    public ResponseEntity<List<Question>> getQuestionsByQuestionTypeId(@PathVariable("typeId") UUID typeId) {
        try {
            List<Question> questions = questionService.getQuestionsByQuestionTypeId(typeId);
            if (questions.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search By Text - GET /api/questions/search?text=xyz
    @GetMapping("/search")
    public ResponseEntity<List<Question>> searchQuestionsByText(@RequestParam("text") String text) {
        try {
            List<Question> questions = questionService.searchQuestionsByText(text);
            if (questions.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Questions with Options - GET /api/questions/with-options
    @GetMapping("/with-options")
    public ResponseEntity<List<Question>> getQuestionsWithOptions() {
        try {
            List<Question> questions = questionService.getQuestionsWithOptions();
            if (questions.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Questions without Options - GET /api/questions/without-options
    @GetMapping("/without-options")
    public ResponseEntity<List<Question>> getQuestionsWithoutOptions() {
        try {
            List<Question> questions = questionService.getQuestionsWithoutOptions();
            if (questions.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Questions with Scoring Schema - GET /api/questions/with-scoring
    @GetMapping("/with-scoring")
    public ResponseEntity<List<Question>> getQuestionsWithScoringSchema() {
        try {
            List<Question> questions = questionService.getQuestionsWithScoringSchema();
            if (questions.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update - PUT /api/questions/{id} (mit DTO - automatische JSON-Konvertierung)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('questions.edit')")
    public ResponseEntity<?> updateQuestion(@PathVariable("id") UUID id, @RequestBody QuestionDTO dto) {
        try {
            // Existierende Question laden
            Question question = questionService.getQuestionById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
            
            // DTO → Entity konvertieren
            if (dto.getText() != null) {
                question.setText(dto.getText());
            }
            
            // QuestionType aktualisieren
            if (dto.getQuestionType() != null && dto.getQuestionType().getId() != null) {
                QuestionType questionType = questionTypeRepository.findById(dto.getQuestionType().getId())
                    .orElseThrow(() -> new RuntimeException("QuestionType not found"));
                question.setQuestionType(questionType);
            }
            
            // JSON-Objekte → String (automatisch serialisiert)
            if (dto.getOptions() != null) {
                question.setOptions(objectMapper.writeValueAsString(dto.getOptions()));
            }
            if (dto.getScoringSchema() != null) {
                question.setScoringSchema(objectMapper.writeValueAsString(dto.getScoringSchema()));
            }
            
            // isScorable aktualisieren (wenn gesetzt)
            if (dto.getIsScorable() != null) {
                question.setIsScorable(dto.getIsScorable());
            }
            
            Question updatedQuestion = questionService.updateQuestionEntity(question);
            
            // Response mit deserialisierten JSON-Objekten
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", updatedQuestion.getId());
            response.put("text", updatedQuestion.getText());
            response.put("questionType", updatedQuestion.getQuestionType());
            response.put("options", parseJsonSafe(updatedQuestion.getOptions()));
            response.put("scoringSchema", parseJsonSafe(updatedQuestion.getScoringSchema()));
            response.put("isScorable", updatedQuestion.getIsScorable());
            response.put("createdAt", updatedQuestion.getCreatedAt());
            response.put("updatedAt", updatedQuestion.getUpdatedAt());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>(
                Map.of("error", "Invalid JSON format: " + e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage()),
                HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Internal server error: " + e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Delete - DELETE /api/questions/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('questions.delete')")
    public ResponseEntity<HttpStatus> deleteQuestion(@PathVariable("id") UUID id) {
        try {
            questionService.deleteQuestion(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete All - DELETE /api/questions
    @DeleteMapping
    @PreAuthorize("hasAuthority('questions.delete')")
    public ResponseEntity<HttpStatus> deleteAllQuestions() {
        try {
            questionService.getAllQuestions().forEach(question -> questionService.deleteQuestion(question.getId()));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count - GET /api/questions/count
    @GetMapping("/count")
    public ResponseEntity<Long> countQuestions() {
        try {
            long count = questionService.count();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count by Question Type - GET /api/questions/count/type/{typeId}
    @GetMapping("/count/type/{typeId}")
    public ResponseEntity<Long> countQuestionsByType(@PathVariable("typeId") UUID typeId) {
        try {
            long count = questionService.countByQuestionTypeId(typeId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check Exists - GET /api/questions/exists/{id}
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> questionExists(@PathVariable("id") UUID id) {
        try {
            boolean exists = questionService.existsById(id);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
