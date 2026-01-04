import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const STATUS_COLORS: Record<string, string> = {
  assigned: "#E3BB62",       // gold (ICA)
  in_progress: "#56768f",    // steel
  completed: "#264555",      // navy
  expired: "#d2c9b9",        // sand
  started: "#808080",        // gray
  cancelled: "#e5e7eb",      // fog
};

const STATUS_LABELS: Record<string, string> = {
  assigned: "Zugewiesen",
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  expired: "Abgelaufen",
  started: "Gestartet",
  cancelled: "Abgebrochen",
};

type StatusDistributionChartProps = {
  data: Record<string, number>;
  title: string;
  description?: string;
};

type DetailItem = {
  status: string;
  name: string;
  value: number;
  fill: string;
};

type SummaryItem = {
  status: "completed_group" | "open_group";
  name: string;
  summary: number;
  fill: string;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { fill?: string; name?: string };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const p = payload[0];
  const name = p?.payload?.name ?? p?.name ?? "";
  const value = p?.value ?? 0;
  const fill = p?.payload?.fill ?? "#808080";

  return (
    <div
      className="rounded-xl border bg-white px-3 py-2 text-sm shadow-lg"
      style={{ borderColor: "rgba(210,201,185,0.7)" }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: fill }} />
        <span className="font-semibold text-slate-800">{name}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-6 text-slate-600">
        <span>Anzahl</span>
        <span className="font-semibold text-slate-800">{value}</span>
      </div>
    </div>
  );
}

export function StatusDistributionChart({ data, title, description }: StatusDistributionChartProps) {
  // Outer ring = echte Verteilung (wie vorher)
  const chartData: DetailItem[] = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      status: key,
      name: STATUS_LABELS[key] || key,
      value,
      fill: STATUS_COLORS[key] || "#808080",
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Keine Daten verfügbar
        </CardContent>
      </Card>
    );
  }

  // Summary ring = Abgeschlossen vs Offen (nur Deko, aber verständlich)
  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);
  const completed = data.completed ?? 0;
  const open = Math.max(total - completed, 0);
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const summaryData: SummaryItem[] = [
    {
      status: "completed_group" as const,
      name: "Abgeschlossen",
      summary: completed,
      fill: STATUS_COLORS.completed,
    },
    {
      status: "open_group" as const,
      name: "Offen",
      summary: open,
      fill: STATUS_COLORS.expired,
    },
  ].filter((x) => x.summary > 0);


  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start pb-0 text-left">

        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1 pb-0">

        {/* Chart */}
        <div className="mx-auto aspect-square max-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />

              {/* Outer ring: Details */}
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={92}
                innerRadius={62}
                paddingAngle={2}
                stroke="white"
                strokeWidth={3}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>

              {/* Inner ring: Summary */}
              <Pie
                data={summaryData}
                dataKey="summary"
                nameKey="name"
                innerRadius={42}
                outerRadius={58}
                paddingAngle={2}
                stroke="white"
                strokeWidth={3}
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`inner-${index}`} fill={entry.fill} />
                ))}

                {/* Center label (TS-safe: x/y/width/height) */}
                <Label
                  position="center"
                  content={(props) => {
                    const vb = props.viewBox as
                      | { x: number; y: number; width: number; height: number }
                      | undefined;

                    if (!vb) return null;

                    const cx = vb.x + vb.width / 2;
                    const cy = vb.y + vb.height / 2;

                    return (
                      <g>
                        <text
                          x={cx}
                          y={cy - 4}
                          textAnchor="middle"
                          className="fill-foreground text-lg font-semibold"
                        >
                          {completedPct}%
                        </text>
                        <text
                          x={cx}
                          y={cy + 14}
                          textAnchor="middle"
                          className="fill-muted-foreground text-xs"
                        >
                          abgeschlossen
                        </text>
                      </g>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Verständliche Anzeige statt doppelter Legend */}
      {/* ✅ Unterer Bereich: Chips direkt unter dem Kreis + Detail darunter */}
<div className="w-full">
  {/* Summary chips: direkt nach dem Kreis */}
  <div className="-mt-3 w-full max-w-[300px] mx-auto flex flex-wrap justify-center gap-2 text-sm">
    <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 shadow-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS.completed }} />
      <span className="text-slate-700">Abgeschlossen:</span>
      <span className="font-semibold text-slate-900">{completed}</span>
    </span>

    <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 shadow-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS.expired }} />
      <span className="text-slate-700">Offen:</span>
      <span className="font-semibold text-slate-900">{open}</span>
    </span>
  </div>

  {/* Detail list (unter Chips) */}
  <div className="mt-3 w-full max-w-[300px] mx-auto">
    <div className="overflow-hidden rounded-2xl border bg-white">
      {chartData.map((s, idx) => (
        <div
          key={s.status}
          className={[
            "flex items-center justify-center px-4 py-2 text-sm",
            idx !== 0 ? "border-t" : "",
          ].join(" ")}
        >
          <div className="inline-flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
            <span className="text-slate-700">{s.name}</span>
            <span className="font-semibold tabular-nums text-slate-900">{s.value}</span>
          </div>
        </div>
      ))}
    </div>
  </div>

  <div className="mt-3 mb-4 text-center text-sm text-muted-foreground">
    Gesamt: <span className="font-medium text-foreground">{total}</span> Sessions
  </div>
</div>

      </CardContent>
    </Card>
  );
}
