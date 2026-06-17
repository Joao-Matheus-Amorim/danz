import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MiniLineChart } from "@/components/dashboard/MiniLineChart";
import type { DashboardMetric } from "@/lib/types";
import { formatDelta } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Card de KPI premium com mini gráfico e ícone. */
export function MetricCard({
  metric,
  icon: Icon,
}: {
  metric: DashboardMetric;
  icon: LucideIcon;
}) {
  const positive = (metric.deltaPct ?? 0) >= 0;
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="dl-label">{metric.label}</p>
          <p className="mt-2 text-3xl font-bold text-content">{metric.value}</p>
          <p className="mt-1 text-xs text-content-muted">{metric.hint}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-border bg-neon/[0.08] text-neon">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <MiniLineChart data={metric.series} />
      </div>

      {metric.deltaPct !== null && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-medium",
            positive ? "text-neon" : "text-alert"
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {formatDelta(metric.deltaPct)}
        </div>
      )}
    </Card>
  );
}
