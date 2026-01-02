import * as React from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";

import { ThemeSelector } from "./ThemeSelector";
import { AnalyticsDateRangePicker } from "./AnalyticsDateRangePicker";
import { ThemeAreaChart } from "./SessionAreaChart";
import { QuestionExtremesList } from "./QuestionExtremesList";
import { Button } from "@/components/ui/button";

import type {
  ThemeOption,
  ThemeTimeSeriesResponse,
  ThemeQuestionExtremes,
  TimeBucket,
} from "@/api/types";

import {
  getMockThemes,
  getMockThemeTimeSeries,
  getMockThemeQuestionExtremes,
  fetchThemes,
  fetchThemeTimeSeries,
  fetchThemeQuestionExtremes,
} from "@/api/themeAnalyticsApi";

const BRAND = {
  navy: "#264555",
  gold: "#E3BB62",
};

const CSS = {
  border: "hsl(var(--border,30 15% 85%))",
};

// Set to false to use real backend API
const USE_MOCK_DATA = false;

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
  const [timeSeriesData, setTimeSeriesData] = React.useState<ThemeTimeSeriesResponse | null>(null);
  const [questionExtremes, setQuestionExtremes] = React.useState<ThemeQuestionExtremes[]>([]);

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
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #38bdf8, #1d4ed8)" }}
          >
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="m-0 text-xl font-semibold" style={{ color: BRAND.navy }}>
              Themen-Analyse
            </h2>
            <p className="text-sm text-slate-500">
              Vergleichen Sie bis zu 2 Themen im Zeitverlauf
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={selectedThemeIds.length === 0 || loadingChart}
          className="border-[#e5e7eb]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingChart ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters Card */}
      <div
        className="mb-5 rounded-2xl border bg-white p-5 shadow-[0_10px_26px_rgba(0,0,0,0.06)]"
        style={{ borderColor: CSS.border }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          {/* Theme Selector */}
          <div className="flex-1 min-w-0">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: BRAND.navy }}>
              Themen auswählen (max. 3)
            </label>
            <ThemeSelector
              themes={themes}
              selectedIds={selectedThemeIds}
              onSelect={setSelectedThemeIds}
              maxSelections={3}
              placeholder={loadingThemes ? "Laden..." : "Themen auswählen..."}
              disabled={loadingThemes}
            />
          </div>

          {/* Date Range & Bucket */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: BRAND.navy }}>
              Zeitraum & Auflösung
            </label>
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

      {/* Empty State when no themes selected */}
      {selectedThemeIds.length === 0 && (
        <div
          className="rounded-2xl border bg-white p-8 text-center shadow-[0_10px_26px_rgba(0,0,0,0.06)]"
          style={{ borderColor: CSS.border }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(29,78,216,0.1))" }}
          >
            <BarChart3 className="h-8 w-8 text-sky-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold" style={{ color: BRAND.navy }}>
            Kein Thema ausgewählt
          </h3>
          <p className="text-sm text-slate-500">
            Wählen Sie ein oder zwei Themen aus, um deren durchschnittliche Ergebnisse im Zeitverlauf zu analysieren.
          </p>
        </div>
      )}

      {/* Chart */}
      {selectedThemeIds.length > 0 && (
        <div
          className="mb-5 rounded-2xl border bg-white p-5 shadow-[0_10px_26px_rgba(0,0,0,0.06)]"
          style={{ borderColor: CSS.border }}
        >
          <ThemeAreaChart
            series={timeSeriesData?.series ?? []}
            overallAveragePercent={timeSeriesData?.overallAveragePercent ?? 50}
            title="Session-Progress Timeline"
            description="Individuelle Session-Ergebnisse pro Mitarbeiter im zeitlichen Verlauf"
            loading={loadingChart}
          />
        </div>
      )}

      {/* Question Extremes */}
      {selectedThemeIds.length > 0 && (
        <QuestionExtremesList
          data={questionExtremes}
          loading={loadingQuestions}
          maxQuestionsPerSection={3}
        />
      )}
    </section>
  );
}
