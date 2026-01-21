package com.assessment.backend.service;

import com.assessment.backend.dto.*;
import com.assessment.backend.entity.*;
import com.assessment.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThemeAnalyticsService {

    private final AssessmentSessionRepository sessionRepository;
    private final AnswerRepository answerRepository;
    private final ThemaRepository themaRepository;
    private final QuestionRepository questionRepository;
    private final QuestionNodeRepository questionNodeRepository;
    private final ThemaCatalogRepository themaCatalogRepository;
    private final WorkerRepository workerRepository;
    private final CompanyRepository companyRepository;

    private static final String[] CHART_COLORS = {"#1d4ed8", "#0ea5e9", "#8b5cf6"};

    /**
     * Get list of themes that have completed sessions for analytics selection.
     * Aggregates session count and average score per theme.
     */
    public List<ThemeOptionDto> getThemesWithCompletedSessions() {
        // Get all completed sessions
        List<AssessmentSession> completedSessions = sessionRepository.findByStatus("completed");

        // Group sessions by theme
        Map<UUID, List<AssessmentSession>> sessionsByTheme = completedSessions.stream()
                .filter(s -> s.getThemaId() != null)
                .collect(Collectors.groupingBy(AssessmentSession::getThemaId));

        List<ThemeOptionDto> result = new ArrayList<>();

        for (Map.Entry<UUID, List<AssessmentSession>> entry : sessionsByTheme.entrySet()) {
            UUID themeId = entry.getKey();
            List<AssessmentSession> themeSessions = entry.getValue();

            Optional<Thema> themaOpt = themaRepository.findById(themeId);
            if (themaOpt.isEmpty()) continue;

            Thema thema = themaOpt.get();
            String catalogName = getCatalogNameForTheme(themeId);

            // Calculate average score across all sessions
            double avgScorePercent = calculateAverageScore(themeSessions);

            ThemeOptionDto dto = new ThemeOptionDto();
            dto.setId(themeId);
            dto.setName(thema.getName());
            dto.setCatalogName(catalogName != null ? catalogName : "Unbekannt");
            dto.setTotalSessions(themeSessions.size());
            dto.setAvgScorePercent(Math.round(avgScorePercent * 10.0) / 10.0);

            result.add(dto);
        }

        // Sort by total sessions descending
        result.sort(Comparator.comparingInt(ThemeOptionDto::getTotalSessions).reversed());

        return result;
    }

    /**
     * Get time series data for selected themes within date range.
     * Shows average scores per time bucket aggregated across all sessions of each theme.
     */
    public ThemeTimeSeriesResponseDto getThemeTimeSeries(
            List<UUID> themeIds,
            LocalDate startDate,
            LocalDate endDate,
            String timeBucket
    ) {
        // Validate date range (max 2 years)
        LocalDate twoYearsAgo = LocalDate.now().minusYears(2);
        if (startDate.isBefore(twoYearsAgo)) {
            startDate = twoYearsAgo;
        }

        List<ThemeTimeSeriesDto> seriesList = new ArrayList<>();
        double totalAvgPercent = 0;
        int validThemes = 0;

        for (int i = 0; i < themeIds.size() && i < 3; i++) {
            UUID themeId = themeIds.get(i);
            Optional<Thema> themaOpt = themaRepository.findById(themeId);

            if (themaOpt.isEmpty()) continue;

            Thema thema = themaOpt.get();

            // Get all completed sessions for this theme within date range
            List<AssessmentSession> themeSessions = sessionRepository
                    .findByThemaIdAndStatusAndCompletedAtBetween(
                            themeId, 
                            "completed", 
                            startDate.atStartOfDay(), 
                            endDate.plusDays(1).atStartOfDay()
                    );

            // Generate time series data for this theme
            List<ThemeTimePointDto> dataPoints = generateThemeTimeSeriesData(
                    themeSessions, startDate, endDate, timeBucket, themeId
            );

            ThemeTimeSeriesDto series = new ThemeTimeSeriesDto();
            series.setThemeId(themeId);
            series.setThemeName(thema.getName());
            series.setThemeColor(CHART_COLORS[i % CHART_COLORS.length]);
            series.setData(dataPoints);

            seriesList.add(series);

            // Calculate average for this theme (across all individual sessions)
            if (!dataPoints.isEmpty()) {
                double avg = dataPoints.stream()
                        .mapToDouble(ThemeTimePointDto::getScorePercent)
                        .average()
                        .orElse(0);
                totalAvgPercent += avg;
                validThemes++;
            }
        }

        double overallAverage = validThemes > 0 ? totalAvgPercent / validThemes : 50.0;

        return new ThemeTimeSeriesResponseDto(seriesList, overallAverage);
    }

    /**
     * Get best and worst questions for selected themes based on average score
     * across all sessions of each theme.
     */
    public List<ThemeQuestionExtremesDto> getThemeQuestionExtremes(
            List<UUID> themeIds,
            LocalDate startDate,
            LocalDate endDate,
            int limit
    ) {
        List<ThemeQuestionExtremesDto> result = new ArrayList<>();

        for (UUID themeId : themeIds) {
            Optional<Thema> themaOpt = themaRepository.findById(themeId);
            if (themaOpt.isEmpty()) continue;

            Thema thema = themaOpt.get();

            // Get all completed sessions for this theme within date range
            List<AssessmentSession> themeSessions = sessionRepository
                    .findByThemaIdAndStatusAndCompletedAtBetween(
                            themeId, 
                            "completed", 
                            startDate.atStartOfDay(), 
                            endDate.plusDays(1).atStartOfDay()
                    );

            if (themeSessions.isEmpty()) continue;

            // Collect session IDs
            List<UUID> sessionIds = themeSessions.stream()
                    .map(AssessmentSession::getId)
                    .collect(Collectors.toList());

            // Get all answers for these sessions
            List<Answer> allAnswers = answerRepository.findAllBySessionIdIn(sessionIds);

            // Group answers by question and calculate average scores
            Map<UUID, List<Answer>> answersByQuestion = allAnswers.stream()
                    .collect(Collectors.groupingBy(Answer::getQuestionId));

            List<QuestionScoreExtremeDto> questionScores = new ArrayList<>();

            for (Map.Entry<UUID, List<Answer>> entry : answersByQuestion.entrySet()) {
                UUID questionId = entry.getKey();
                List<Answer> questionAnswers = entry.getValue();

                Optional<Question> questionOpt = questionRepository.findById(questionId);
                if (questionOpt.isEmpty()) continue;

                Question question = questionOpt.get();

                // Calculate average score percentage for this question across all sessions
                double avgScorePercent = calculateQuestionAverageScore(questionAnswers, question);

                // Count correct answers (score > 0)
                int correctAnswers = (int) questionAnswers.stream()
                        .filter(a -> a.getScore() != null && a.getScore().compareTo(BigDecimal.ZERO) > 0)
                        .count();

                QuestionScoreExtremeDto dto = new QuestionScoreExtremeDto();
                dto.setId(questionId);
                dto.setQuestionText(truncateText(question.getText(), 150));
                dto.setThemeId(themeId);
                dto.setThemeName(thema.getName());
                dto.setAvgScorePercent(Math.round(avgScorePercent * 10.0) / 10.0);
                dto.setTotalAnswers(questionAnswers.size());
                dto.setCorrectAnswers(correctAnswers);

                questionScores.add(dto);
            }

            // Sort and get worst/best - ensure no overlap (a question can only be top OR flop)
            List<QuestionScoreExtremeDto> sortedByScore = questionScores.stream()
                    .sorted(Comparator.comparingDouble(QuestionScoreExtremeDto::getAvgScorePercent))
                    .collect(Collectors.toList());

            // Worst questions (lowest scores)
            List<QuestionScoreExtremeDto> worstQuestions = sortedByScore.stream()
                    .limit(limit)
                    .collect(Collectors.toList());

            // Best questions (highest scores) - exclude any that are already in worst
            Set<UUID> worstIds = worstQuestions.stream()
                    .map(QuestionScoreExtremeDto::getId)
                    .collect(Collectors.toSet());

            List<QuestionScoreExtremeDto> bestQuestions = sortedByScore.stream()
                    .sorted(Comparator.comparingDouble(QuestionScoreExtremeDto::getAvgScorePercent).reversed())
                    .filter(q -> !worstIds.contains(q.getId()))
                    .limit(limit)
                    .collect(Collectors.toList());

            ThemeQuestionExtremesDto extremes = new ThemeQuestionExtremesDto();
            extremes.setThemeId(themeId);
            extremes.setThemeName(thema.getName());
            extremes.setWorstQuestions(worstQuestions);
            extremes.setBestQuestions(bestQuestions);

            result.add(extremes);
        }

        return result;
    }

    // ========== Helper Methods ==========

    private List<ThemeTimePointDto> generateThemeTimeSeriesData(
            List<AssessmentSession> sessions,
            LocalDate startDate,
            LocalDate endDate,
            String timeBucket,
            UUID themeId
    ) {
        if (sessions.isEmpty()) {
            return Collections.emptyList();
        }

        int questionCount = getQuestionCountForTheme(themeId);
        List<ThemeTimePointDto> dataPoints = new ArrayList<>();

        // Create a data point for each individual session with exact timestamp
        for (AssessmentSession session : sessions) {
            if (session.getCompletedAt() == null) continue;

            double scorePercent = 0;
            if (session.getMaxPossibleScore() != null && 
                session.getMaxPossibleScore().compareTo(BigDecimal.ZERO) > 0) {
                scorePercent = session.getTotalScore()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(session.getMaxPossibleScore(), 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            String workerName = getWorkerName(session.getWorkerId());
            String companyName = getCompanyName(session.getCompanyId());

            ThemeTimePointDto point = new ThemeTimePointDto();
            point.setTimestamp(session.getCompletedAt());
            point.setScorePercent(Math.round(scorePercent * 10.0) / 10.0);
            point.setWorkerName(workerName);
            point.setCompanyName(companyName);
            point.setQuestionCount(questionCount);

            dataPoints.add(point);
        }

        // Sort by timestamp
        dataPoints.sort(Comparator.comparing(ThemeTimePointDto::getTimestamp));

        return dataPoints;
    }

    private String getWorkerName(UUID workerId) {
        if (workerId == null) return "Unbekannt";
        return workerRepository.findById(workerId)
                .map(Worker::getName)
                .orElse("Unbekannt");
    }

    private String getCompanyName(UUID companyId) {
        if (companyId == null) return "Unbekannt";
        return companyRepository.findById(companyId)
                .map(Company::getName)
                .orElse("Unbekannt");
    }

    /**
     * Calculate average score by first averaging per company, then averaging company averages.
     * This ensures each company has equal weight regardless of session count.
     */
    private double calculateAverageScoreByCompany(Map<UUID, List<AssessmentSession>> sessionsByCompany) {
        if (sessionsByCompany.isEmpty()) return 0;

        double totalCompanyAvg = 0;
        int validCompanies = 0;

        for (List<AssessmentSession> companySessions : sessionsByCompany.values()) {
            double companyAvg = calculateAverageScore(companySessions);
            if (companyAvg > 0) {
                totalCompanyAvg += companyAvg;
                validCompanies++;
            }
        }

        return validCompanies > 0 ? totalCompanyAvg / validCompanies : 0;
    }

    private double calculateAverageScore(List<AssessmentSession> sessions) {
        if (sessions.isEmpty()) return 0;

        double totalScore = 0;
        int validSessions = 0;

        for (AssessmentSession session : sessions) {
            if (session.getMaxPossibleScore() != null && 
                session.getMaxPossibleScore().compareTo(BigDecimal.ZERO) > 0) {
                double scorePercent = session.getTotalScore()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(session.getMaxPossibleScore(), 2, RoundingMode.HALF_UP)
                        .doubleValue();
                totalScore += scorePercent;
                validSessions++;
            }
        }

        return validSessions > 0 ? totalScore / validSessions : 0;
    }

    private double calculateQuestionAverageScore(List<Answer> answers, Question question) {
        if (answers.isEmpty()) return 0;

        double maxScore = getMaxScoreForQuestion(question);
        if (maxScore <= 0) return 0;

        double totalScorePercent = 0;
        for (Answer answer : answers) {
            if (answer.getScore() != null) {
                double scorePercent = answer.getScore().doubleValue() / maxScore * 100;
                totalScorePercent += scorePercent;
            }
        }

        return totalScorePercent / answers.size();
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

    private String getCatalogNameForTheme(UUID themeId) {
        if (themeId == null) return null;
        
        // Find catalog through ThemaCatalog relationship
        List<ThemaCatalog> themaCatalogs = themaCatalogRepository.findByThemaId(themeId);
        if (themaCatalogs.isEmpty()) return null;
        
        // Get the first catalog's title directly
        ThemaCatalog themaCatalog = themaCatalogs.get(0);
        if (themaCatalog.getCatalog() == null) return null;
        return themaCatalog.getCatalog().getTitle();
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
