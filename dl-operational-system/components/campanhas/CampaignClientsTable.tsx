import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/lib/types";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

const COLUMNS = ["Cliente", "Status", "Gasto", "Conversas", "Resultados", "Saldo"];

const STATUS_STYLE: Record<Campaign["status"], string> = {
  ativa: "text-neon border-neon-border bg-neon/[0.08]",
  pausada: "text-warning border-warning/30 bg-warning/[0.08]",
  encerrada: "text-content-muted border-white/10 bg-white/[0.03]",
};

const STATUS_LABEL: Record<Campaign["status"], string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  encerrada: "Encerrada",
};

/** Tabela "Clientes & Dados Meta Ads". */
export function CampaignClientsTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <p className="text-sm font-semibold text-content">Clientes &amp; Dados Meta Ads</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {COLUMNS.map((c) => (
                <th
                  key={c}
                  className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-label text-content-muted"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-medium text-content">{c.clientName}</td>
                <td className="px-4 py-3">
                  <Badge className={cn(STATUS_STYLE[c.status])}>{STATUS_LABEL[c.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-content-muted">{formatCurrency(c.spendCents)}</td>
                <td className="px-4 py-3 text-sm text-content-muted">{formatNumber(c.conversations)}</td>
                <td className="px-4 py-3 text-sm text-content-muted">{formatNumber(c.results)}</td>
                <td className="px-4 py-3 text-sm text-neon">{formatCurrency(c.balanceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
