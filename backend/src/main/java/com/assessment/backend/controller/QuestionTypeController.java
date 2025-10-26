package com.assessment.backend.controller;

import com.assessment.backend.dto.QuestionTypeDTO;
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
    public ResponseEntity<List<QuestionTypeDTO>> getAllQuestionTypes() {
        try {
            List<QuestionTypeDTO> questionTypesDTO = questionTypeService.getAllQuestionTypes();
            if (questionTypesDTO.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(questionTypesDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By ID - GET /api/question-types/{id}
    @GetMapping("/{id}")
    public ResponseEntity<QuestionTypeDTO> getQuestionTypeById(@PathVariable("id") UUID id) {
        try {
            Optional<QuestionTypeDTO> questionTypeDTO = questionTypeService.getQuestionTypeById(id);
            return questionTypeDTO.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Name - GET /api/question-types/name/{name}
    @GetMapping("/name/{name}")
    public ResponseEntity<QuestionTypeDTO> getQuestionTypeByName(@PathVariable("name") String name) {
        try {
            Optional<QuestionTypeDTO> questionTypeDTO =
                questionTypeService.getQuestionTypeByName(name);
            return questionTypeDTO.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
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