"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BriefingItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Card "Briefing do mês" com barra de progresso e checklist de clientes.
 * Itens marcáveis em estado local (mock) — persistência na Fase 3.
 */
export function BriefingChecklist({
  monthLabel,
  initialItems,
}: {
  monthLabel: string;
  initialItems: BriefingItem[];
}) {
  const [items, setItems] = React.useState<BriefingItem[]>(initialItems);

  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4">
          <p className="dl-label">Briefing do mês — {monthLabel}</p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={pct} className="flex-1" />
            <span className="text-sm font-medium text-neon">{pct}%</span>
          </div>
          <p className="mt-1.5 text-[11px] text-content-muted">
            {done} de {items.length} clientes com briefing concluído
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3 text-left transition-colors hover:border-neon-border"
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  item.done ? "border-neon bg-neon text-background" : "border-white/15"
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
