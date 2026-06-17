import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryStat {
  label: string;
  value: number;
  tone?: "default" | "alert" | "neon";
}

/** Faixa de métricas do meu painel (A fazer hoje, Esta semana, etc.). */
export function TaskSummary({ stats }: { stats: SummaryStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-5">
          <p className="dl-label">{s.label}</p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold",
              s.tone === "alert" && "text-alert",
              s.tone === "neon" && "text-neon",
              (!s.tone || s.tone === "default") && "text-content"
            )}
          >
            {s.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
