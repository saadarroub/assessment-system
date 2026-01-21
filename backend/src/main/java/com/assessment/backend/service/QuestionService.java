package com.assessment.backend.service;

import com.assessment.backend.entity.Question;
import com.assessment.backend.entity.QuestionType;
import com.assessment.backend.repository.QuestionRepository;
import com.assessment.backend.repository.QuestionTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuestionService {
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private QuestionTypeRepository questionTypeRepository;

    @Autowired
    private AuditLogService auditLogService;

    // Create
    @Transactional
    public Question createQuestion(Question question) {
        // Validate QuestionType exists
        if (question.getQuestionType() != null && question.getQuestionType().getId() != null) {
            QuestionType questionType = questionTypeRepository.findById(question.getQuestionType().getId())
                    .orElseThrow(() -> new RuntimeException("QuestionType not found with id: " + question.getQuestionType().getId()));
            question.setQuestionType(questionType);
        }
        
        // Validate options based on QuestionType
        if (question.getQuestionType() != null && question.getQuestionType().getHasOptions()) {
            if (question.getOptions() == null || question.getOptions().trim().isEmpty()) {
                throw new RuntimeException("Options are required for question type: " + question.getQuestionType().getName());
            }
        }
        
        Question saved = questionRepository.save(question);
        String details = String.format("Text: %.50s..., Type: %s", 
            saved.getText(), 
            saved.getQuestionType() != null ? saved.getQuestionType().getName() : "N/A");
        auditLogService.log("CREATE", "question", saved.getId(), details, null);
        return saved;
    }

    // Read - All
    public List<Question> getAllQuestions() {
        return questionRepository.findAllWithQuestionType();  // ⬅️ Verwende neue Methode
    }

    // Read - By ID
    public Optional<Question> getQuestionById(UUID id) {
        return questionRepository.findById(id);
    }

    // Read - By Question Type
    public List<Question> getQuestionsByQuestionType(QuestionType questionType) {
        return questionRepository.findByQuestionType(questionType);
    }

    // Read - By Question Type ID
    public List<Question> getQuestionsByQuestionTypeId(UUID questionTypeId) {
        return questionRepository.findByQuestionTypeId(questionTypeId);
    }

    // Read - Search by text
    public List<Question> searchQuestionsByText(String text) {
        return questionRepository.findByTextContainingIgnoreCase(text);
    }

    // Read - Questions with options
    public List<Question> getQuestionsWithOptions() {
        return questionRepository.findQuestionsWithOptions();
    }

    // Read - Questions without options
    public List<Question> getQuestionsWithoutOptions() {
        return questionRepository.findQuestionsWithoutOptions();
    }

    // Read - Questions with scoring schema
    public List<Question> getQuestionsWithScoringSchema() {
        return questionRepository.findQuestionsWithScoringSchema();
    }

    // Update (für DTO-basiertes Update)
    @Transactional
    public Question updateQuestionEntity(Question question) {
        Question updated = questionRepository.save(question);
        String details = String.format("Text: %.50s...", updated.getText());
        auditLogService.log("UPDATE", "question", updated.getId(), details, null);
        return updated;
    }

    // Delete
    @Transactional
    public void deleteQuestion(UUID id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        String details = String.format("Deleted question: %.50s...", question.getText());
        auditLogService.log("DELETE", "question", id, details, null);
        questionRepository.delete(question);
    }

    // Check if exists
    public boolean existsById(UUID id) {
        return questionRepository.existsById(id);
    }

    // Count
    public long count() {
        return questionRepository.count();
    }

    // Count by QuestionType
    public long countByQuestionTypeId(UUID questionTypeId) {
        return questionRepository.countByQuestionTypeId(questionTypeId);
    }
}
