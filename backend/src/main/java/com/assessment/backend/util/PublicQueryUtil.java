package com.assessment.backend.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class PublicQueryUtil {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int countQuestionsByThema(UUID themaId) {
        Integer c = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM public.question_node WHERE thema_id = ?",
                Integer.class, themaId
        );
        return c != null ? c : 0;
    }

    public boolean questionBelongsToThema(UUID questionId, UUID themaId) {
        Integer c = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM public.question_node WHERE thema_id = ? AND question_id = ?",
                Integer.class, themaId, questionId
        );
        return c != null && c > 0;
    }

    @Nullable
    public Map<String, Object> findNextQuestion(UUID sessionId, UUID themaId) {
        return jdbcTemplate.query(
                """
                SELECT qn.question_id, qn.order_index
                FROM public.question_node qn
                LEFT JOIN public.answer a
                  ON a.session_id = ? AND a.question_id = qn.question_id
                WHERE qn.thema_id = ? AND a.id IS NULL
                ORDER BY qn.order_index ASC
                LIMIT 1
                """,
                ps -> { ps.setObject(1, sessionId); ps.setObject(2, themaId); },
                rs -> rs.next() ? Map.of(
                        "questionId", UUID.fromString(rs.getString("question_id")),
                        "index", rs.getInt("order_index")
                ) : null
        );
    }

    @Nullable
    public Integer findOrderIndex(UUID themaId, UUID questionId) {
        return jdbcTemplate.query(
                "SELECT order_index FROM public.question_node WHERE thema_id = ? AND question_id = ? LIMIT 1",
                ps -> { ps.setObject(1, themaId); ps.setObject(2, questionId); },
                rs -> rs.next() ? rs.getInt("order_index") : null
        );
    }
}