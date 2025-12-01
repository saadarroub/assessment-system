import type { AssignmentSummary } from "@/features/service/dashboardService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Clock, User, Folder, Building2 } from "lucide-react";
import { formatDistanceToNow } from "../utils/dateUtils";

type RecentAssignmentsListProps = {
  assignments: AssignmentSummary[];
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  assigned: { label: "Zugewiesen", className: "bg-gray-100 text-gray-800" },
  in_progress: { label: "In Bearbeitung", className: "bg-blue-100 text-blue-800" },
  completed: { label: "Abgeschlossen", className: "bg-green-100 text-green-800" },
  expired: { label: "Abgelaufen", className: "bg-red-100 text-red-800" },
};

export function RecentAssignmentsList({ assignments }: RecentAssignmentsListProps) {
  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Letzte Zuweisungen</CardTitle>
          <CardDescription>Kürzlich zugewiesene Kataloge</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Keine Zuweisungen vorhanden
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Letzte Zuweisungen</CardTitle>
        <CardDescription>Kürzlich zugewiesene Kataloge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const statusBadge = STATUS_BADGES[assignment.status] || STATUS_BADGES.assigned;
            
            return (
              <div
                key={assignment.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{assignment.workerName}</span>
                    <span
                      className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Folder className="h-3 w-3" />
                    <span>{assignment.catalogTitle}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>{assignment.companyName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Zugewiesen {formatDistanceToNow(assignment.assignedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
