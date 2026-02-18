import * as React from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";

import { ThemeSelector } from "./ThemeSelector";
import { AnalyticsDateRangePicker } from "./AnalyticsDateRangePicker";
import { ThemeAreaChart } from "./SessionAreaChart";
import { QuestionExtremesList } from "./QuestionExtremesList";
import { Button } from "@/shared/components/ui/button";

import type {
  ThemeOption,
  ThemeTimeSeriesResponse,
  ThemeQuestionExtremes,
  TimeBucket,
} from "@/shared/service/api/types";

import {
  getMockThemes,
  getMockThemeTimeSeries,
  getMockThemeQuestionExtremes,
  fetchThemes,
  fetchThemeTimeSeries,
  fetchThemeQuestionExtremes,
} from "@/shared/service/api/themeAnalyticsApi";

const BRAND = {
  navy: "#264555",
  sand: "#d2c9b9",
  gold: "#E3BB62",
};

const CSS = {
  border: "hsl(var(--border,30 15% 85%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
};

// Set to false to use real backend API
const USE_MOCK_DATA = false;

/** ===== Layout-only wrappers (keine Logik) ===== */
function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-3xl border bg-white/55 backdrop-blur-[2px]",
        "shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden",
        className,
      ].join(" ")}
      style={{ borderColor: BRAND.sand }}
    >
      {children}
    </div>
  );
}

function InnerCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white p-5",
        "shadow-[0_10px_26px_rgba(0,0,0,0.06)]",
        className,
      ].join(" ")}
      style={{ borderColor: CSS.border }}
    >
      {children}
    </div>
  );
}

function SectionHeaderRow({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div
          className="
            flex h-11 w-11 items-center justify-center
            rounded-2xl border bg-white/80
            shadow-[0_6px_16px_rgba(0,0,0,0.06)]
          "
          style={{ borderColor: BRAND.sand, color: BRAND.navy }}
        >
          <BarChart3 className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2
            className="m-0 text-[22px] font-semibold leading-tight"
            style={{ color: BRAND.navy }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm" style={{ color: CSS.mutedFg }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {right ? <div className="flex items-center gap-2 sm:pt-0">{right}</div> : null}
    </div>
  );
}

export function SessionAnalyticsSection() {
  // Filter state
  const [selectedThemeIds, setSelectedThemeIds] = React.useState<string[]>([]);
  const [dateRange, setDateRange] = React.useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [timeBucket, setTimeBucket] = React.useState<TimeBucket>("DAY");

  // Data state
  const [themes, setThemes] = React.useState<ThemeOption[]>([]);
  const [timeSeriesData, setTimeSeriesData] =
    React.useState<ThemeTimeSeriesResponse | null>(null);
  const [questionExtremes, setQuestionExtremes] =
    React.useState<ThemeQuestionExtremes[]>([]);

  // Loading states
  const [loadingThemes, setLoadingThemes] = React.useState(true);
  const [loadingChart, setLoadingChart] = React.useState(false);
  const [loadingQuestions, setLoadingQuestions] = React.useState(false);

  // Error state
  const [error, setError] = React.useState<string | null>(null);

  // Load available themes on mount and auto-select a random one
  React.useEffect(() => {
    const loadThemes = async () => {
      try {
        setLoadingThemes(true);
        setError(null);

        let loadedThemes: ThemeOption[];
        if (USE_MOCK_DATA) {
          // Simulate network delay
          await new Promise((r) => setTimeout(r, 500));
          loadedThemes = getMockThemes();
        } else {
          loadedThemes = await fetchThemes();
        }

        setThemes(loadedThemes);

        // Auto-select a random theme if available
        if (loadedThemes.length > 0) {
          const randomIndex = Math.floor(Math.random() * loadedThemes.length);
          setSelectedThemeIds([loadedThemes[randomIndex].id]);
        }
      } catch (err: any) {
        console.error("Error loading themes:", err);
        setError("Fehler beim Laden der Themen");
      } finally {
        setLoadingThemes(false);
      }
    };

    loadThemes();
  }, []);

  // Load chart and question data when filters change
  React.useEffect(() => {
    if (selectedThemeIds.length === 0) {
      setTimeSeriesData(null);
      setQuestionExtremes([]);
      return;
    }

    const loadAnalyticsData = async () => {
      try {
        setLoadingChart(true);
        setLoadingQuestions(true);
        setError(null);

        const startDate = format(dateRange.start, "yyyy-MM-dd");
        const endDate = format(dateRange.end, "yyyy-MM-dd");

        if (USE_MOCK_DATA) {
          // Simulate network delay
          await new Promise((r) => setTimeout(r, 800));

          const tsData = getMockThemeTimeSeries(
            selectedThemeIds,
            startDate,
            endDate,
            timeBucket
          );
          setTimeSeriesData(tsData);

          const qData = getMockThemeQuestionExtremes(selectedThemeIds);
          setQuestionExtremes(qData);
        } else {
          const [tsData, qData] = await Promise.all([
            fetchThemeTimeSeries({
              themeIds: selectedThemeIds,
              startDate,
              endDate,
              timeBucket,
            }),
            fetchThemeQuestionExtremes(selectedThemeIds, startDate, endDate, 3),
          ]);
          setTimeSeriesData(tsData);
          setQuestionExtremes(qData);
        }
      } catch (err: any) {
        console.error("Error loading analytics data:", err);
        setError("Fehler beim Laden der Analysedaten");
      } finally {
        setLoadingChart(false);
        setLoadingQuestions(false);
      }
    };

    loadAnalyticsData();
  }, [selectedThemeIds, dateRange, timeBucket]);

  const handleRefresh = () => {
    // Trigger reload by toggling a dependency
    setSelectedThemeIds([...selectedThemeIds]);
  };

  return (
    <section className="mb-8">
      {/* Outer shell (nur Layout geändert) */}
      <Panel>
        {/* Header Bar (nur Layout geändert) */}
        <div className="px-6 pt-6">
          <SectionHeaderRow
            title="Themen-Analyse"
            subtitle="Vergleichen Sie bis zu 2 Themen im Zeitverlauf"
            right={
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={selectedThemeIds.length === 0 || loadingChart}
                className="rounded-xl border-[#e5e7eb] bg-white shadow-sm hover:bg-slate-50"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loadingChart ? "animate-spin" : ""}`}
                />
                Aktualisieren
              </Button>
            }
          />
        </div>

        {/* dezente Linie wie Dashboard */}
        <div
          className="mx-6 mt-4 h-px"
          style={{
            background:
              "linear-gradient(to right, rgba(210,201,185,0.9), rgba(210,201,185,0.25), transparent)",
          }}
        />

        {/* Error Message (unverändert, nur Container bleibt) */}
        {error && (
          <div className="px-6 pt-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Filters (nur Wrapper geändert) */}
        <div className="px-6 pt-5">
          <InnerCard>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
              {/* Theme Selector */}
              <div className="lg:col-span-7 min-w-0">
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: BRAND.navy }}
                >
                  Themen auswählen (max. 3)
                </label>

                {/* Input-style wrapper bleibt wie vorher */}
                <div
                  className="rounded-xl border bg-white/80 p-1"
                  style={{ borderColor: CSS.border }}
                >
                  <ThemeSelector
                    themes={themes}
                    selectedIds={selectedThemeIds}
                    onSelect={setSelectedThemeIds}
                    maxSelections={3}
                    placeholder={loadingThemes ? "Laden..." : "Themen auswählen..."}
                    disabled={loadingThemes}
                  />
                </div>
              </div>

              {/* Date Range & Bucket */}
              <div className="lg:col-span-5 min-w-0">
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: BRAND.navy }}
                >
                  Zeitraum & Auflösung
                </label>

                <div
                  className="rounded-xl border bg-white/80 p-1"
                  style={{ borderColor: CSS.border }}
                >
                  <AnalyticsDateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    timeBucket={timeBucket}
                    onTimeBucketChange={setTimeBucket}
                    disabled={loadingThemes}
                  />
                </div>
              </div>
            </div>
          </InnerCard>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6 pt-5">
          {/* Empty State when no themes selected (nur Wrapper geändert) */}
          {selectedThemeIds.length === 0 && (
            <InnerCard className="p-10 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(29,78,216,0.10))",
                }}
              >
                <BarChart3 className="h-8 w-8 text-sky-500" />
              </div>

              <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: BRAND.navy }}
              >
                Keine Daten verfügbar
              </h3>
              <p className="mx-auto max-w-xl text-sm" style={{ color: CSS.mutedFg }}>
                Wählen Sie ein oder zwei Themen aus, um deren durchschnittliche
                Ergebnisse im Zeitverlauf zu analysieren.
              </p>
            </InnerCard>
          )}

          {/* Chart (nur Wrapper geändert) */}
          {selectedThemeIds.length > 0 && (
            <InnerCard className="mb-5 p-5">
              <ThemeAreaChart
                series={timeSeriesData?.series ?? []}
                overallAveragePercent={timeSeriesData?.overallAveragePercent ?? 50}
                title="Session-Progress Timeline"
                description="Individuelle Session-Ergebnisse pro Mitarbeiter im zeitlichen Verlauf"
                loading={loadingChart}
              />
            </InnerCard>
          )}

          {/* Question Extremes (unverändert) */}
          {selectedThemeIds.length > 0 && (
            <QuestionExtremesList
              data={questionExtremes}
              loading={loadingQuestions}
              maxQuestionsPerSection={3}
            />
          )}
        </div>
      </Panel>
    </section>
  );
}
