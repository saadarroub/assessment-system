import type { SessionSummary } from "@/features/service/dashboardService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Clock, User, BookOpen, Building2, Award } from "lucide-react";
import { formatDistanceToNow } from "../utils/dateUtils";

type RecentSessionsListProps = {
  sessions: SessionSummary[];
};

export function RecentSessionsList({ sessions }: RecentSessionsListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abgeschlossene Sessions</CardTitle>
          <CardDescription>Kürzlich abgeschlossene Assessments</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Keine abgeschlossenen Sessions
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abgeschlossene Sessions</CardTitle>
        <CardDescription>Kürzlich abgeschlossene Assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const scorePercentage = session.maxPossibleScore > 0
              ? (session.totalScore / session.maxPossibleScore) * 100
              : 0;
            
            return (
              <div
                key={session.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{session.workerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>{session.themeName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>{session.companyName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-3 w-3 text-amber-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {session.totalScore} / {session.maxPossibleScore} Punkte
                        </span>
                        <span className="text-xs font-medium">
                          {scorePercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                          style={{ width: `${Math.min(scorePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {session.completedAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Abgeschlossen {formatDistanceToNow(session.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
