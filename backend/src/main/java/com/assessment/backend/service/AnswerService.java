package com.assessment.backend.service;

import com.assessment.backend.entity.Answer;
import com.assessment.backend.repository.AnswerRepository;
import com.assessment.backend.util.JsonUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public Answer upsert(UUID sessionId, UUID questionId, Object valueJson, BigDecimal score) {
        var existing = repository.findBySessionIdAndQuestionId(sessionId, questionId);
        if (existing.isPresent()) {
            var a = existing.get();
            a.setValue(JsonUtil.toJsonString(objectMapper, valueJson));
            if (score != null) a.setScore(score);
            return repository.save(a);
        } else {
            var a = new Answer();
            a.setSessionId(sessionId);
            a.setQuestionId(questionId);
            a.setValue(JsonUtil.toJsonString(objectMapper, valueJson));
            a.setScore(score != null ? score : BigDecimal.ZERO);
            return repository.save(a);
        }
    }

    public long countAnswered(UUID sessionId) {
        return repository.countBySessionId(sessionId);
    }
}