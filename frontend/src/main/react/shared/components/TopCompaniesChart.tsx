import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type CompanyData = {
  name: string;
  count: number;
};

type TopCompaniesChartProps = {
  data: CompanyData[];
  title?: string;
  description?: string;
};

// ICA / Dashboard Palette (wie bei den anderen Cards)
const COLORS = ["#264555", "#56768f", "#808080", "#d2c9b9", "#4F6B7E"];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: CompanyData }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl border bg-white px-3 py-2 text-sm shadow-lg">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="mt-1 text-slate-600">
        <span className="font-semibold text-slate-900 tabular-nums">{value}</span> Zuweisungen
      </div>
    </div>
  );
}

export function TopCompaniesChart({ data, title, description }: TopCompaniesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="items-start pb-0 text-left">
          <CardTitle>{title ?? "Top 5 Firmen"}</CardTitle>
          <CardDescription>{description ?? "Firmen mit den meisten Zuweisungen"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center text-muted-foreground min-h-[320px]">
          Keine Daten verfügbar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="items-start pb-0 text-left">
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      {/* flex-1 sorgt dafür, dass die Card die gleiche Höhe wie Session-Status sauber füllt */}
      <CardContent className="flex-1 pt-2">
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 6, right: 24, left: 8, bottom: 6 }}
              barCategoryGap={18}
              barGap={6}
            >

              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />

              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-slate-500"
              />

              <YAxis
                type="category"
                dataKey="name"
                width={95}
                tickLine={false}
                axisLine={false}
                className="text-xs fill-slate-500"
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.15)" }} />

              <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={44}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
