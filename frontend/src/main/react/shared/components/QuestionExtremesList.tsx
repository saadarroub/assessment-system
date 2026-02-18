import { TrendingDown, TrendingUp, MessageSquare, CheckCircle2, XCircle, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { ThemeQuestionExtremes, QuestionScoreExtreme } from "@/shared/service/api/types";
import { cn } from "@/lib/utils";

const BRAND = {
  navy: "#264555",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
};

// Colors for theme badges (matching chart colors)
const THEME_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
];

type QuestionExtremesListProps = {
  data: ThemeQuestionExtremes[];
  loading?: boolean;
  maxQuestionsPerSection?: number;
};

// Extended type to track theme info
type QuestionWithTheme = QuestionScoreExtreme & {
  themeIndex: number;
};

function QuestionCard({
  question,
  type,
  showThemeBadge,
}: {
  question: QuestionWithTheme;
  type: "best" | "worst";
  showThemeBadge: boolean;
}) {
  const isBest = type === "best";
  const themeColor = THEME_COLORS[question.themeIndex % THEME_COLORS.length];

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 transition hover:shadow-md",
        isBest
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-red-200 bg-red-50/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isBest ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          )}
        >
          {isBest ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Theme Badge - only show when multiple themes */}
          {showThemeBadge && (
            <div className="mb-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
                  themeColor.bg,
                  themeColor.text,
                  themeColor.border
                )}
              >
                <Tag className="h-3 w-3" />
                {question.themeName}
              </span>
            </div>
          )}

          <p
            className="text-sm font-medium leading-snug line-clamp-2"
            style={{ color: BRAND.navy }}
          >
            {question.questionText}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            {/* Score */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                isBest
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {isBest ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              Ø {question.avgScorePercent.toFixed(0)}%
            </span>

            {/* Answers */}
            <span className="inline-flex items-center gap-1 text-slate-500">
              <MessageSquare className="h-3 w-3" />
              {question.correctAnswers}/{question.totalAnswers} richtig
            </span>

            {/* Theme Badge (inline if not showing above) */}
            {!showThemeBadge && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                {question.themeName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionSection({
  title,
  description,
  questions,
  type,
  loading,
  showThemeBadge,
}: {
  title: string;
  description: string;
  questions: QuestionWithTheme[];
  type: "best" | "worst";
  loading?: boolean;
  showThemeBadge: boolean;
}) {
  const isBest = type === "best";
  const Icon = isBest ? TrendingUp : TrendingDown;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-5 w-5",
                isBest ? "text-emerald-500" : "text-red-500"
              )}
            />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-5 w-5",
                isBest ? "text-emerald-500" : "text-red-500"
              )}
            />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          Keine Daten verfügbar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2"
          style={{ color: BRAND.navy }}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              isBest ? "text-emerald-500" : "text-red-500"
            )}
          />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              type={type} 
              showThemeBadge={showThemeBadge}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuestionExtremesList({
  data,
  loading = false,
  maxQuestionsPerSection = 3,
}: QuestionExtremesListProps) {
  // Determine if we're showing multiple themes
  const hasMultipleThemes = data.length > 1;

  // Aggregate all questions from all themes with theme info
  const allWorst: QuestionWithTheme[] = [];
  const allBest: QuestionWithTheme[] = [];

  data.forEach((theme, themeIndex) => {
    theme.worstQuestions.forEach((q) => {
      allWorst.push({
        ...q,
        themeIndex,
      });
    });
    theme.bestQuestions.forEach((q) => {
      allBest.push({
        ...q,
        themeIndex,
      });
    });
  });

  // Sort and limit
  const worstQuestions = allWorst
    .sort((a, b) => a.avgScorePercent - b.avgScorePercent)
    .slice(0, Math.min(maxQuestionsPerSection * 2, 6)); // Max 6

  const bestQuestions = allBest
    .sort((a, b) => b.avgScorePercent - a.avgScorePercent)
    .slice(0, Math.min(maxQuestionsPerSection * 2, 6)); // Max 6

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <QuestionSection
        title="Schwächste Fragen"
        description="Fragen mit dem niedrigsten Durchschnittsscore über alle Sessions"
        questions={worstQuestions}
        type="worst"
        loading={loading}
        showThemeBadge={hasMultipleThemes}
      />
      <QuestionSection
        title="Stärkste Fragen"
        description="Fragen mit dem höchsten Durchschnittsscore über alle Sessions"
        questions={bestQuestions}
        type="best"
        loading={loading}
        showThemeBadge={hasMultipleThemes}
      />
    </div>
  );
}
