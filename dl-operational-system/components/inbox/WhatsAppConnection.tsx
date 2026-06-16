"use client";

import { QrCode, Webhook, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { WhatsAppNumber } from "@/lib/types";

/**
 * Card de conexão do WhatsApp via QR Code.
 *
 * No MVP NÃO há conexão real. A integração real será feita na Fase 5 via
 * Evolution API, Z-API, Baileys ou provedor homologado. Os botões sinalizam
 * isso claramente.
 */
export function WhatsAppConnection({ numbers }: { numbers: WhatsAppNumber[] }) {
  const { futureFeature } = useToast();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="p-5">
          <p className="dl-label">Conectar WhatsApp (QR Code)</p>
          <p className="mt-2 text-sm text-content-muted">
            Conecte o número da empresa ou o seu escaneando o QR — igual ao
            WhatsApp Web.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-neon-border bg-neon/[0.04]">
              <QrCode className="h-12 w-12 text-neon" />
            </div>
            <Button variant="primary" onClick={() => futureFeature("Conexão via QR Code")}>
              <Plus className="h-4 w-4" /> Conectar número
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="dl-label">Números conectados</p>
          {numbers.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3"
            >
              <div>
                <p className="text-sm font-medium text-content">{n.label}</p>
                <p className="text-[11px] text-content-muted">{n.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-neon border-neon-border bg-neon/[0.08]">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon" /> on
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => futureFeature("Replicar webhook")}
                >
                  <Webhook className="h-3.5 w-3.5" /> Replicar webhook
                </Button>
              </div>
            </div>
          ))}
          <Button variant="secondary" className="w-full" onClick={() => futureFeature("Conectar número")}>
            <Plus className="h-4 w-4" /> Conectar número
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
