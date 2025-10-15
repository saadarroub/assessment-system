package com.assessment.backend.service;

import com.assessment.backend.entity.QuestionType;
import com.assessment.backend.repository.QuestionTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuestionTypeService {
    
    @Autowired
    private QuestionTypeRepository questionTypeRepository;

    // Read All
    public List<QuestionType> getAllQuestionTypes() {
        return questionTypeRepository.findAll();
    }

    // Read By ID
    public Optional<QuestionType> getQuestionTypeById(UUID id) {
        return questionTypeRepository.findById(id);
    }

    // Read By Name
    public Optional<QuestionType> getQuestionTypeByName(String name) {
        return questionTypeRepository.findByName(name);
    }

    // Read By Input Type
    public Optional<QuestionType> getQuestionTypeByInputType(String inputType) {
        return questionTypeRepository.findByInputType(inputType);
    }

    // Count
    public long count() {
        return questionTypeRepository.count();
    }
}
