// =====================================================
// Session Analytics Types
// =====================================================

/**
 * Time bucket for aggregating session data
 */
export type TimeBucket = "DAY" | "WEEK" | "MONTH";

/**
 * A theme/topic option for the selector
 */
export interface ThemeOption {
  id: string;
  name: string;
  catalogName: string;
  totalSessions: number;
  avgScorePercent: number;
}

/**
 * A single data point in the theme time series - represents one session
 */
export interface ThemeTimePoint {
  timestamp: string; // ISO datetime string with time
  scorePercent: number; // 0-100 score
  workerName: string;
  companyName: string;
  questionCount: number;
}

/**
 * Time series data for a single theme
 */
export interface ThemeTimeSeries {
  themeId: string;
  themeName: string;
  themeColor: string;
  data: ThemeTimePoint[];
}

/**
 * Response containing time series for one or two themes
 */
export interface ThemeTimeSeriesResponse {
  series: ThemeTimeSeries[];
  overallAveragePercent: number; // Overall average for reference line
}

/**
 * A question with its average score statistics across all sessions
 */
export interface QuestionScoreExtreme {
  id: string;
  questionText: string;
  themeId: string;
  themeName: string;
  avgScorePercent: number; // 0-100 average across all sessions
  totalAnswers: number;
  correctAnswers: number;
}

/**
 * Top and bottom questions for a theme
 */
export interface ThemeQuestionExtremes {
  themeId: string;
  themeName: string;
  worstQuestions: QuestionScoreExtreme[];
  bestQuestions: QuestionScoreExtreme[];
}

/**
 * Filter parameters for theme analytics
 */
export interface ThemeAnalyticsFilter {
  themeIds: string[];
  startDate: string; // ISO date
  endDate: string; // ISO date
  timeBucket: TimeBucket;
}

/**
 * Date range with preset options
 */
export interface DateRangePreset {
  label: string;
  getValue: () => { start: Date; end: Date };
}
