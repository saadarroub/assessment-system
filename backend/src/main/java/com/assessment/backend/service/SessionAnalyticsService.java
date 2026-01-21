package com.assessment.backend.service;

import com.assessment.backend.dto.*;
import com.assessment.backend.entity.*;
import com.assessment.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionAnalyticsService {

    private final AssessmentSessionRepository sessionRepository;
    private final AnswerRepository answerRepository;
    private final ThemaRepository themaRepository;
    private final CompanyRepository companyRepository;
    private final WorkerRepository workerRepository;
    private final QuestionRepository questionRepository;
    private final QuestionNodeRepository questionNodeRepository;

    private static final String[] CHART_COLORS = {"#1d4ed8", "#0ea5e9"};

    /**
     * Get list of completed sessions for analytics selection
     */
    public List<CompletedSessionOptionDto> getCompletedSessions() {
        List<AssessmentSession> sessions = sessionRepository.findByStatusOrderByCompletedAtDesc(
                "completed", 
                org.springframework.data.domain.PageRequest.of(0, 100)
        );

        return sessions.stream()
                .map(this::toCompletedSessionOption)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Get time series data for selected sessions within date range
     */
    public SessionTimeSeriesResponseDto getSessionTimeSeries(
            List<UUID> sessionIds,
            LocalDate startDate,
            LocalDate endDate,
            String timeBucket
    ) {
        // Validate date range (max 2 years)
        LocalDate twoYearsAgo = LocalDate.now().minusYears(2);
        if (startDate.isBefore(twoYearsAgo)) {
            startDate = twoYearsAgo;
        }

        List<SessionTimeSeriesDto> seriesList = new ArrayList<>();
        double totalAvgPercent = 0;
        int validSessions = 0;

        for (int i = 0; i < sessionIds.size() && i < 2; i++) {
            UUID sessionId = sessionIds.get(i);
            Optional<AssessmentSession> sessionOpt = sessionRepository.findById(sessionId);
            
            if (sessionOpt.isEmpty()) continue;
            
            AssessmentSession session = sessionOpt.get();
            String themeName = getThemeName(session.getThemaId());
            
            // Generate time series data for this session
            List<SessionTimePointDto> dataPoints = generateTimeSeriesData(
                    session, startDate, endDate, timeBucket
            );

            SessionTimeSeriesDto series = new SessionTimeSeriesDto();
            series.setSessionId(sessionId);
            series.setSessionLabel(themeName);
            series.setThemeColor(CHART_COLORS[i % CHART_COLORS.length]);
            series.setData(dataPoints);
            
            seriesList.add(series);

            // Calculate average for this session
            if (!dataPoints.isEmpty()) {
                double avg = dataPoints.stream()
                        .mapToDouble(SessionTimePointDto::getScorePercent)
                        .average()
                        .orElse(0);
                totalAvgPercent += avg;
                validSessions++;
            }
        }

        double overallAverage = validSessions > 0 ? totalAvgPercent / validSessions : 50.0;

        return new SessionTimeSeriesResponseDto(seriesList, overallAverage);
    }

    /**
     * Get best and worst questions for selected sessions
     */
    public List<SessionQuestionExtremesDto> getQuestionExtremes(
            List<UUID> sessionIds,
            LocalDate startDate,
            LocalDate endDate,
            int limit
    ) {
        List<SessionQuestionExtremesDto> result = new ArrayList<>();

        for (UUID sessionId : sessionIds) {
            Optional<AssessmentSession> sessionOpt = sessionRepository.findById(sessionId);
            if (sessionOpt.isEmpty()) continue;

            AssessmentSession session = sessionOpt.get();
            String themeName = getThemeName(session.getThemaId());

            // Get all answers for this session
            List<Answer> answers = answerRepository.findAllBySessionId(sessionId);
            
            // Group answers by question and calculate scores
            Map<UUID, List<Answer>> answersByQuestion = answers.stream()
                    .collect(Collectors.groupingBy(Answer::getQuestionId));

            List<QuestionScoreExtremeDto> questionScores = new ArrayList<>();
            
            for (Map.Entry<UUID, List<Answer>> entry : answersByQuestion.entrySet()) {
                UUID questionId = entry.getKey();
                List<Answer> questionAnswers = entry.getValue();
                
                Optional<Question> questionOpt = questionRepository.findById(questionId);
                if (questionOpt.isEmpty()) continue;
                
                Question question = questionOpt.get();
                
                // Calculate score percentage for this question
                double totalScore = questionAnswers.stream()
                        .mapToDouble(a -> a.getScore() != null ? a.getScore().doubleValue() : 0)
                        .sum();
                
                // Get max possible score from scoring schema
                double maxScore = getMaxScoreForQuestion(question);
                double scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
                
                // Count correct answers (score > 0)
                int correctAnswers = (int) questionAnswers.stream()
                        .filter(a -> a.getScore() != null && a.getScore().compareTo(BigDecimal.ZERO) > 0)
                        .count();

                QuestionScoreExtremeDto dto = new QuestionScoreExtremeDto();
                dto.setId(questionId);
                dto.setQuestionText(truncateText(question.getText(), 150));
                dto.setThemeId(session.getThemaId());
                dto.setThemeName(themeName);
                dto.setAvgScorePercent(Math.round(scorePercent * 10.0) / 10.0);
                dto.setTotalAnswers(questionAnswers.size());
                dto.setCorrectAnswers(correctAnswers);
                
                questionScores.add(dto);
            }

            // Sort and get worst/best
            List<QuestionScoreExtremeDto> worstQuestions = questionScores.stream()
                    .sorted(Comparator.comparingDouble(QuestionScoreExtremeDto::getAvgScorePercent))
                    .limit(limit)
                    .collect(Collectors.toList());

            List<QuestionScoreExtremeDto> bestQuestions = questionScores.stream()
                    .sorted(Comparator.comparingDouble(QuestionScoreExtremeDto::getAvgScorePercent).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());

            SessionQuestionExtremesDto extremes = new SessionQuestionExtremesDto();
            extremes.setSessionId(sessionId);
            extremes.setSessionLabel(themeName);
            extremes.setWorstQuestions(worstQuestions);
            extremes.setBestQuestions(bestQuestions);
            
            result.add(extremes);
        }

        return result;
    }

    // ========== Helper Methods ==========

    private CompletedSessionOptionDto toCompletedSessionOption(AssessmentSession session) {
        String themeName = getThemeName(session.getThemaId());
        String companyName = getCompanyName(session.getCompanyId());
        String workerName = getWorkerName(session.getWorkerId());
        String catalogName = getCatalogNameForTheme(session.getThemaId());

        double scorePercent = 0;
        if (session.getMaxPossibleScore() != null && 
            session.getMaxPossibleScore().compareTo(BigDecimal.ZERO) > 0) {
            scorePercent = session.getTotalScore()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(session.getMaxPossibleScore(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        CompletedSessionOptionDto dto = new CompletedSessionOptionDto();
        dto.setId(session.getId());
        dto.setThemeName(themeName);
        dto.setCatalogName(catalogName != null ? catalogName : "Unbekannt");
        dto.setCompanyName(companyName);
        dto.setWorkerName(workerName);
        dto.setCompletedAt(session.getCompletedAt());
        dto.setScorePercent(Math.round(scorePercent * 10.0) / 10.0);
        
        return dto;
    }

    private List<SessionTimePointDto> generateTimeSeriesData(
            AssessmentSession session,
            LocalDate startDate,
            LocalDate endDate,
            String timeBucket
    ) {
        List<SessionTimePointDto> dataPoints = new ArrayList<>();
        
        // For a single session, we show the session's score at its completion date
        // In a real implementation, you might aggregate multiple sessions per time bucket
        
        LocalDate sessionDate = session.getCompletedAt() != null 
                ? session.getCompletedAt().toLocalDate() 
                : session.getCreatedAt().toLocalDate();

        // Only include if within date range
        if (sessionDate.isBefore(startDate) || sessionDate.isAfter(endDate)) {
            return dataPoints;
        }

        double scorePercent = 0;
        if (session.getMaxPossibleScore() != null && 
            session.getMaxPossibleScore().compareTo(BigDecimal.ZERO) > 0) {
            scorePercent = session.getTotalScore()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(session.getMaxPossibleScore(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // Get question/answer counts
        long answerCount = answerRepository.countBySessionId(session.getId());
        int questionCount = getQuestionCountForTheme(session.getThemaId());

        SessionTimePointDto point = new SessionTimePointDto();
        point.setDate(normalizeToTimeBucket(sessionDate, timeBucket));
        point.setScorePercent(Math.round(scorePercent * 10.0) / 10.0);
        point.setQuestionCount(questionCount);
        point.setAnswerCount((int) answerCount);
        
        dataPoints.add(point);

        return dataPoints;
    }

    private LocalDate normalizeToTimeBucket(LocalDate date, String timeBucket) {
        switch (timeBucket.toUpperCase()) {
            case "WEEK":
                // Start of week (Monday)
                return date.with(WeekFields.ISO.dayOfWeek(), 1);
            case "MONTH":
                // First day of month
                return date.withDayOfMonth(1);
            case "DAY":
            default:
                return date;
        }
    }

    private String getThemeName(UUID themaId) {
        if (themaId == null) return "Unbekannt";
        return themaRepository.findById(themaId)
                .map(Thema::getName)
                .orElse("Unbekannt");
    }

    private String getCompanyName(UUID companyId) {
        if (companyId == null) return "Unbekannt";
        return companyRepository.findById(companyId)
                .map(Company::getName)
                .orElse("Unbekannt");
    }

    private String getWorkerName(UUID workerId) {
        if (workerId == null) return "Unbekannt";
        return workerRepository.findById(workerId)
                .map(Worker::getName)
                .orElse("Unbekannt");
    }

    private String getCatalogNameForTheme(UUID themaId) {
        if (themaId == null) return null;
        // Try to find a catalog that contains this theme
        // This is a simplified approach; in reality you might need a more complex query
        return "Assessment Katalog"; // Placeholder
    }

    private int getQuestionCountForTheme(UUID themaId) {
        if (themaId == null) return 0;
        return (int) questionNodeRepository.countByThemaId(themaId);
    }

    private double getMaxScoreForQuestion(Question question) {
        // Default max score; in reality this should come from scoring schema
        return 100.0;
    }

    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }
}
