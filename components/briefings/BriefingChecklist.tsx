"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BriefingItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BriefingChecklist({
  monthLabel,
  items,
  loading = false,
  onToggleItem,
  canEdit = true,
}: {
  monthLabel: string;
  items: BriefingItem[];
  loading?: boolean;
  onToggleItem: (item: BriefingItem) => Promise<void> | void;
  canEdit?: boolean;
}) {
  const [pendingItemId, setPendingItemId] = React.useState<string | null>(null);

  const done = items.filter((item) => item.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  async function toggle(item: BriefingItem) {
    if (pendingItemId || !canEdit) return;

    setPendingItemId(item.id);
    try {
      await onToggleItem(item);
    } finally {
      setPendingItemId(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4">
          <p className="dl-label">Briefing do mês - {monthLabel}</p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={pct} className="flex-1" />
            <span className="text-sm font-medium text-neon-text">{pct}%</span>
          </div>
          <p className="mt-1.5 text-[11px] text-content-muted">
            {done} de {items.length} clientes com briefing concluído
          </p>
        </div>

        <div className="space-y-2">
          {loading ? (
            <p className="py-6 text-center text-sm text-content-muted">
              Carregando briefings...
            </p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-content-muted">
              Nenhum briefing encontrado para este mês.
            </p>
          ) : (
            items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => void toggle(item)}
                disabled={pendingItemId === item.id || !canEdit}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3 text-left transition-colors hover:border-neon-border disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    item.done
                      ? "border-neon bg-neon text-content"
                      : "border-white/15"
                  )}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    item.done ? "text-content-muted line-through" : "text-content"
                  )}
                >
                  {item.clientName}
                </span>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
