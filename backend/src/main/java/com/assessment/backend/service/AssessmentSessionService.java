package com.assessment.backend.service;

import com.assessment.backend.entity.AssessmentSession;
import com.assessment.backend.repository.AssessmentSessionRepository;
import com.assessment.backend.util.PublicQueryUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
public class AssessmentSessionService {

    private static final Set<String> OPEN = Set.of("started","in_progress");
    private static final Set<String> ALLOWED = Set.of("started","in_progress","completed","cancelled");

    @Autowired
    private AssessmentSessionRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PublicQueryUtil publicQueryUtil;

    @Transactional
    public AssessmentSession getOrCreate(UUID companyId, UUID workerId, UUID themaId) {
        var existing = repository.findFirstByWorkerIdAndThemaIdAndStatusInOrderByCreatedAtDesc(workerId, themaId, OPEN);
        if (existing.isPresent()) return existing.get();

        var s = new AssessmentSession();
        s.setCompanyId(companyId);
        s.setWorkerId(workerId);
        s.setThemaId(themaId);
        s.setStatus("started");
        
        // Max Possible Score berechnen
        BigDecimal maxScore = publicQueryUtil.calculateMaxPossibleScore(themaId);
        s.setMaxPossibleScore(maxScore);
        
        try {
            return repository.save(s);
        } catch (DataIntegrityViolationException e) {
            // Parallelstart – Unique-Index griff; offene Session erneut laden
            return repository
                .findFirstByWorkerIdAndThemaIdAndStatusInOrderByCreatedAtDesc(workerId, themaId, OPEN)
                .orElseThrow(() -> new IllegalStateException("Failed to create or load open session", e));
        }
    }

    @Transactional(readOnly = true)
    public AssessmentSession get(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public AssessmentSession advanceToInProgress(UUID id) {
        var s = repository.findById(id).orElseThrow();
        if ("started".equals(s.getStatus())) {
            s.setStatus("in_progress");
            return repository.save(s);
        }
        return s;
    }

    @Transactional
    public AssessmentSession complete(UUID id) {
        var s = repository.findById(id).orElseThrow();
        if (!"completed".equals(s.getStatus())) {
            s.setStatus("completed");
            s.setCompletedAt(LocalDateTime.now());
        }
        return repository.save(s);
    }

    @Transactional
    public AssessmentSession setStatus(UUID id, String status) {
        if (!ALLOWED.contains(status)) throw new IllegalArgumentException("Invalid status");
        var s = repository.findById(id).orElseThrow();
        s.setStatus(status);
        return repository.save(s);
    }

    @Transactional(readOnly = true)
    public AssessmentSession findLatest(UUID workerId, UUID themaId) {
        return repository.findFirstByWorkerIdAndThemaIdOrderByCreatedAtDesc(workerId, themaId).orElse(null);
    }

    @Transactional
    public void recalculateTotals(UUID sessionId) {
        BigDecimal sum = jdbcTemplate.queryForObject(
            "SELECT COALESCE(SUM(score),0) FROM public.answer WHERE session_id = ?",
            BigDecimal.class, sessionId
        );
        var s = repository.findById(sessionId).orElseThrow();
        s.setTotalScore(sum != null ? sum : BigDecimal.ZERO);
        repository.save(s);
    }
}