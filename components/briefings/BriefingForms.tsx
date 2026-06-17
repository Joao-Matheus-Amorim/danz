"use client";

import * as React from "react";
import { Copy, Eye, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { BRIEFING_FORM_FIELDS } from "@/lib/briefing-form";
import type { BriefingItem } from "@/lib/types";

/** Aba "Formulários do cliente": link público por cliente, status e resposta. */
export function BriefingForms({
  items,
  loading = false,
}: {
  items: BriefingItem[];
  loading?: boolean;
}) {
  const { toast } = useToast();
  const [viewing, setViewing] = React.useState<BriefingItem | null>(null);

  async function copyLink(item: BriefingItem) {
    if (!item.publicToken) return;
    const url = `${window.location.origin}/b/${item.publicToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado.");
    } catch (error) {
      console.error(error);
      toast("Não foi possível copiar o link.");
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-content-muted">
          Carregando formulários...
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-content-muted">
          Nenhum cliente no briefing deste mês.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-white/[0.06]">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Link2 className="h-4 w-4 shrink-0 text-content-muted" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-content">
                      {item.clientName}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      Referência {item.monthRef}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={
                      item.submitted
                        ? "border-neon-border bg-neon/[0.10] text-neon-text"
                        : "border-warning/30 bg-warning/[0.08] text-warning"
                    }
                  >
                    {item.submitted ? "Respondido" : "Pendente"}
                  </Badge>

                  {item.submitted && item.response && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewing(item)}
                    >
                      <Eye className="h-4 w-4" /> Ver resposta
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void copyLink(item)}
                    disabled={!item.publicToken}
                  >
                    <Copy className="h-4 w-4" /> Copiar link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-content">
              Resposta — {viewing?.clientName}
            </DialogTitle>
            <DialogDescription className="text-sm text-content-muted">
              Briefing enviado pelo cliente para {viewing?.monthRef}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {BRIEFING_FORM_FIELDS.map((field) => {
              const value = viewing?.response?.[field.key]?.trim();
              return (
                <div key={field.key}>
                  <p className="dl-label">{field.label}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-content">
                    {value ? value : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
