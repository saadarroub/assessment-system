package com.assessment.backend.controller;

import com.assessment.backend.dto.QuestionDTO;
import com.assessment.backend.entity.Question;
import com.assessment.backend.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {
    
    @Autowired
    private QuestionService questionService;

    // Create - POST /api/questions
    @PostMapping
    public ResponseEntity<QuestionDTO> createQuestion(@RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO createdQuestion = questionService.createQuestion(questionDTO);
            return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read All - GET /api/questions
    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        try {
            List<QuestionDTO> questionsDTO = questionService.getAllQuestions();
            if (questionsDTO.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionsDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By ID - GET /api/questions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable("id") UUID id) {
        try {
            Optional<QuestionDTO> questionDTO = questionService.getQuestionById(id);
            return questionDTO.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Question Type ID - GET /api/questions/type/{typeId}
    @GetMapping("/type/{typeId}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByQuestionTypeId(@PathVariable("typeId") UUID typeId) {
        try {
            List<QuestionDTO> questionsDTO = questionService.getQuestionsByQuestionTypeId(typeId);
            if (questionsDTO.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionsDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search By Text - GET /api/questions/search?text=xyz
    @GetMapping("/search")
    public ResponseEntity<List<QuestionDTO>> searchQuestionsByText(@RequestParam("text") String text) {
        try {
            List<QuestionDTO> questionsDTO = questionService.searchQuestionsByText(text);
            if (questionsDTO.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionsDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Questions with Options - GET /api/questions/with-options
    @GetMapping("/with-options")
    public ResponseEntity<List<QuestionDTO>> getQuestionsWithOptions() {
        try {
            List<QuestionDTO> questionsDTO = questionService.getQuestionsWithOptions();
            if (questionsDTO.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionsDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Questions without Options - GET /api/questions/without-options
    @GetMapping("/without-options")
    public ResponseEntity<List<QuestionDTO>> getQuestionsWithoutOptions() {
        try {
            List<QuestionDTO> questionsDTO = questionService.getQuestionsWithoutOptions();
            if (questionsDTO.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionsDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Questions with Scoring Schema - GET /api/questions/with-scoring
    @GetMapping("/with-scoring")
    public ResponseEntity<List<QuestionDTO>> getQuestionsWithScoringSchema() {
        try {
            List<QuestionDTO> questionsDTO = questionService.getQuestionsWithScoringSchema();
            if (questionsDTO.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionsDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update - PUT /api/questions/{id}
    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable("id") UUID id,
                                                    @RequestBody Question question) {
        try {
            QuestionDTO updatedQuestionDTO = questionService.updateQuestion(id, question);
            return new ResponseEntity<>(updatedQuestionDTO, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete - DELETE /api/questions/{id}
    @DeleteMapping("/{id}")
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
