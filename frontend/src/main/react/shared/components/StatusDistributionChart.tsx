import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const STATUS_COLORS: Record<string, string> = {
  assigned: "#808080",       // brand-gray
  in_progress: "#56768f",    // brand-steel
  completed: "#264555",      // brand-navy
  expired: "#d2c9b9",        // brand-sand
  started: "#808080",
  cancelled: "#e5e7eb",
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

export function StatusDistributionChart({ data, title, description }: StatusDistributionChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
