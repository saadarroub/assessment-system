import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type QuickStatsProps = {
  completionRate: number;
  avgDaysToComplete: number;
  activeWorkers: number;
};

export function QuickStats({ completionRate, avgDaysToComplete, activeWorkers }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abschlussrate</CardTitle>
          {completionRate >= 75 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : completionRate >= 50 ? (
            <Minus className="h-4 w-4 text-yellow-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            der Zuweisungen abgeschlossen
          </p>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                completionRate >= 75
                  ? "bg-green-600"
                  : completionRate >= 50
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ø Bearbeitungszeit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgDaysToComplete.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground mt-1">Tage bis Abschluss</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktive Mitarbeiter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeWorkers}</div>
          <p className="text-xs text-muted-foreground mt-1">mit offenen Zuweisungen</p>
        </CardContent>
      </Card>
    </div>
  );
}
