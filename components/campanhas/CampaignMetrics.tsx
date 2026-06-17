import { Users, DollarSign, MessageSquare, Target, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Campaign } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** Faixa de métricas consolidadas das campanhas (Meta Ads). */
export function CampaignMetrics({
  campaigns,
  loading = false,
}: {
  campaigns: Campaign[];
  loading?: boolean;
}) {
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spendCents,
      conversations: acc.conversations + c.conversations,
      results: acc.results + c.results,
      sent: acc.sent + c.sent,
    }),
    { spend: 0, conversations: 0, results: 0, sent: 0 }
  );

  const metrics = [
    { label: "Clientes", value: formatNumber(campaigns.length), icon: Users },
    { label: "Gasto total", value: formatCurrency(totals.spend), icon: DollarSign },
    { label: "Conversas", value: formatNumber(totals.conversations), icon: MessageSquare },
    { label: "Resultados", value: formatNumber(totals.results), icon: Target },
    { label: "Enviados", value: formatNumber(totals.sent), icon: Send },
  ].map((metric) => ({
    ...metric,
    value: loading ? "..." : metric.value,
  }));

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {metrics.map((m) => (
        <Card key={m.label} className="p-4">
          <div className="flex items-center justify-between">
            <p className="dl-label">{m.label}</p>
            <m.icon className="h-4 w-4 text-content-muted" />
          </div>
          <p className="mt-2 text-xl font-bold text-content">{m.value}</p>
        </Card>
      ))}
    </div>
  );
}
