"use client";

import { KeyRound, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Aviso de configuração do Token do Meta.
 *
 * No MVP não há integração real com a Meta Ads API. O botão apenas sinaliza
 * que a configuração real (token salvo no navegador / variável) chega na Fase 5.
 */
export function MetaTokenNotice() {
  const { futureFeature } = useToast();

  return (
    <Card className="border-warning/30 bg-warning/[0.05]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-content">
              Configure seu Token do Meta antes de começar
            </p>
            <p className="mt-1 text-sm text-content-muted">
              Para puxar os dados automaticamente, insira seu Access Token da API do
              Meta. Fica salvo só no seu navegador.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          className="shrink-0"
          onClick={() => futureFeature("Configuração do Token Meta")}
        >
          <KeyRound className="h-4 w-4" /> Configurar Token Agora
        </Button>
      </CardContent>
    </Card>
  );
}
