package com.assessment.backend.controller;

import com.assessment.backend.entity.QuestionType;
import com.assessment.backend.service.QuestionTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/question-types")
@CrossOrigin(origins = "*")
public class QuestionTypeController {
    
    @Autowired
    private QuestionTypeService questionTypeService;

    // Read All - GET /api/question-types
    @GetMapping
    public ResponseEntity<List<QuestionType>> getAllQuestionTypes() {
        try {
            List<QuestionType> questionTypes = questionTypeService.getAllQuestionTypes();
            if (questionTypes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionTypes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By ID - GET /api/question-types/{id}
    @GetMapping("/{id}")
    public ResponseEntity<QuestionType> getQuestionTypeById(@PathVariable("id") UUID id) {
        try {
            Optional<QuestionType> questionType = questionTypeService.getQuestionTypeById(id);
            return questionType.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Name - GET /api/question-types/name/{name}
    @GetMapping("/name/{name}")
    public ResponseEntity<QuestionType> getQuestionTypeByName(@PathVariable("name") String name) {
        try {
            Optional<QuestionType> questionType = questionTypeService.getQuestionTypeByName(name);
            return questionType.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count - GET /api/question-types/count
    @GetMapping("/count")
    public ResponseEntity<Long> countQuestionTypes() {
        try {
            long count = questionTypeService.count();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}