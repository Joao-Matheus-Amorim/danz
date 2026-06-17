import { Edit3, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/lib/types";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

const COLUMNS = ["Cliente", "Status", "Gasto", "Conversas", "Resultados", "Saldo"];

const STATUS_STYLE: Record<Campaign["status"], string> = {
  ativa: "text-neon-text border-neon-border bg-neon/[0.08]",
  pausada: "text-warning border-warning/30 bg-warning/[0.08]",
  encerrada: "text-content-muted border-white/10 bg-white/[0.03]",
};

const STATUS_LABEL: Record<Campaign["status"], string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  encerrada: "Encerrada",
};

/** Tabela "Clientes & Dados Meta Ads". */
export function CampaignClientsTable({
  campaigns,
  loading = false,
  onEdit,
  onDelete,
  pendingId,
}: {
  campaigns: Campaign[];
  loading?: boolean;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  pendingId?: string | null;
}) {
  const showActions = Boolean(onEdit || onDelete);
  const columns = showActions ? [...COLUMNS, ""] : COLUMNS;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <p className="text-sm font-semibold text-content">Clientes &amp; Dados Meta Ads</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {columns.map((c, index) => (
                <th
                  key={c || `actions-${index}`}
                  className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-label text-content-muted"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-content-muted">
                  Carregando campanhas...
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-content-muted">
                  Nenhuma campanha encontrada neste workspace.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm font-medium text-content">{c.clientName}</td>
                  <td className="px-4 py-3">
                    <Badge className={cn(STATUS_STYLE[c.status])}>{STATUS_LABEL[c.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-content-muted">{formatCurrency(c.spendCents)}</td>
                  <td className="px-4 py-3 text-sm text-content-muted">{formatNumber(c.conversations)}</td>
                  <td className="px-4 py-3 text-sm text-content-muted">{formatNumber(c.results)}</td>
                  <td className="px-4 py-3 text-sm text-neon-text">{formatCurrency(c.balanceCents)}</td>
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => onEdit(c)}
                            aria-label="Editar campanha"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="danger"
                            size="icon"
                            onClick={() => onDelete(c)}
                            disabled={pendingId === c.id}
                            aria-label="Excluir campanha"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
