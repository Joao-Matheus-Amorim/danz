import { DollarSign, UserPlus, Users, Megaphone, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { growthMetrics } from "@/lib/mock-data";

const ICONS: Record<string, LucideIcon> = {
  g_mrr: DollarSign,
  g_novos: UserPlus,
  g_ativos: Users,
  g_campanhas: Megaphone,
};

/** Seção "Crescimento da empresa". */
export function GrowthOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento da empresa</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 p-5 pt-0 sm:grid-cols-2 xl:grid-cols-4">
        {growthMetrics.map((m) => (
          <MetricCard key={m.id} metric={m} icon={ICONS[m.id] ?? Users} />
        ))}
      </div>
    </Card>
  );
}
