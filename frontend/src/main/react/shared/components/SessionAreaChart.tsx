import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { ThemeTimeSeries } from "@/api/types";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

// Brand-aligned gradient colors for Area Charts (3 themes)
const CHART_COLORS = {
  primary: {
    stroke: "hsl(221, 83%, 53%)", // Blue 600
    fillStart: "hsl(221, 83%, 53%)",
    fillEnd: "hsl(221, 83%, 53%)",
  },
  secondary: {
    stroke: "hsl(199, 89%, 48%)", // Sky 500
    fillStart: "hsl(199, 89%, 48%)",
    fillEnd: "hsl(199, 89%, 48%)",
  },
  tertiary: {
    stroke: "hsl(262, 83%, 58%)", // Purple/Violet 500
    fillStart: "hsl(262, 83%, 58%)",
    fillEnd: "hsl(262, 83%, 58%)",
  },
};

const BRAND = {
  navy: "#264555",
  mutedFg: "hsl(var(--muted-foreground, 215 16% 47%))",
};

type ThemeAreaChartProps = {
  series: ThemeTimeSeries[];
  overallAveragePercent?: number;
  title: string;
  description?: string;
  loading?: boolean;
};

type ChartDataPoint = {
  timestamp: number;
  timeLabel: string;
  workerName: string;
  companyName: string;
  [key: string]: number | string;
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-xl min-w-[200px]">
      <p className="mb-2 text-sm font-medium text-foreground">
        {data.timeLabel}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: entry.stroke }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium tabular-nums" style={{ color: entry.stroke }}>
              {entry.value?.toFixed(1)}%
            </span>
          </div>
        ))}
        {data.workerName && data.workerName !== "Unbekannt" && (
          <div className="pt-1.5 mt-1.5 border-t text-xs text-muted-foreground space-y-0.5">
            <div className="flex justify-between">
              <span>Mitarbeiter:</span>
              <span className="text-foreground">{data.workerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Firma:</span>
              <span className="text-foreground">{data.companyName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ThemeAreaChart({
  series,
  overallAveragePercent = 50,
  title,
  description,
  loading = false,
}: ThemeAreaChartProps) {
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!series || series.length === 0 || series.every((s) => s.data.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-muted-foreground">
          Keine Daten verfügbar
        </CardContent>
      </Card>
    );
  }

  // Transform data - merge all sessions into unified timeline
  const colorPalette = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary];
  const dataMap = new Map<number, ChartDataPoint>();
  
  series.forEach((s) => {
    s.data.forEach((point) => {
      const timestamp = parseISO(point.timestamp).getTime();
      const existing = dataMap.get(timestamp) || {
        timestamp,
        timeLabel: format(parseISO(point.timestamp), "dd. MMM yyyy, HH:mm", { locale: de }),
        workerName: point.workerName,
        companyName: point.companyName,
      };
      existing[`score_${s.themeId}`] = point.scorePercent;
      existing.workerName = point.workerName;
      existing.companyName = point.companyName;
      dataMap.set(timestamp, existing);
    });
  });

  const chartData = Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-muted-foreground">
          Keine Daten verfügbar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: BRAND.navy }}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <defs>
              {series.map((s, idx) => {
                const colors = colorPalette[idx % colorPalette.length];
                return (
                  <linearGradient
                    key={`gradient_${s.themeId}`}
                    id={`gradient_${s.themeId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={colors.fillStart} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors.fillEnd} stopOpacity={0.05} />
                  </linearGradient>
                );
              })}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border, 214 32% 91%))"
              vertical={false}
            />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              tick={{ fill: BRAND.mutedFg, fontSize: 11 }}
              tickFormatter={(value) => format(new Date(value), "dd.MM HH:mm", { locale: de })}
              dy={10}
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: BRAND.mutedFg, fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }} />

            {/* Reference Line for average */}
            <ReferenceLine
              y={overallAveragePercent}
              stroke="hsl(var(--muted-foreground, 215 16% 47%))"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `${overallAveragePercent.toFixed(0)}% Ø`,
                position: "insideTopRight",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />

            {/* Area for each theme with gradient fill */}
            {series.map((s, idx) => {
              const colors = colorPalette[idx % colorPalette.length];
              return (
                <Area
                  key={s.themeId}
                  type="monotone"
                  dataKey={`score_${s.themeId}`}
                  name={s.themeName}
                  stroke={colors.stroke}
                  strokeWidth={2}
                  fill={`url(#gradient_${s.themeId})`}
                  dot={{
                    fill: "hsl(var(--background, 0 0% 100%))",
                    stroke: colors.stroke,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: colors.stroke,
                    stroke: "hsl(var(--background, 0 0% 100%))",
                    strokeWidth: 2,
                    r: 6,
                  }}
                  connectNulls={true}
                  isAnimationActive={true}
                />
              );
            })}

            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
