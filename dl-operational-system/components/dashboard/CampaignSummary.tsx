import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { campaigns } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

/** Resumo de campanhas ativas no dashboard. */
export function CampaignSummary() {
  const ativas = campaigns.filter((c) => c.status === "ativa");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Campanhas ativas</CardTitle>
        <Link
          href={ROUTES.campanhas}
          className="inline-flex items-center gap-1 text-xs text-neon hover:underline"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {ativas.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-4 text-sm text-content-muted">
            <Megaphone className="h-4 w-4 text-content-muted" />
            Nenhuma campanha em veiculação no momento.
          </div>
        ) : (
          ativas.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3"
            >
              <span className="text-sm text-content">{c.clientName}</span>
              <span className="text-sm font-medium text-neon">
                {formatCurrency(c.spendCents)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
