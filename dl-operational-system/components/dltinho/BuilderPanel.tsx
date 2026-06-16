"use client";

import { Hammer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { DLTINHO_ACTIONS } from "@/lib/openai";

/**
 * Aba "Construtor": catálogo das ações que o DLtinho poderá executar.
 * No MVP cada ação apenas sinaliza que a execução chega na Fase 4.
 */
export function BuilderPanel() {
  const { futureFeature } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-neon-border bg-neon/[0.06] p-4">
        <Hammer className="mt-0.5 h-5 w-5 text-neon" />
        <div>
          <p className="text-sm font-medium text-content">
            Pedidos de construção
          </p>
          <p className="text-sm text-content-muted">
            Descreva o que quer construir e o DLtinho monta no sistema. A execução
            real das ações chega na Fase 4 (integração OpenAI).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DLTINHO_ACTIONS.map((action) => (
          <Card
            key={action.type}
            className="cursor-pointer p-4 transition-colors hover:border-neon-border"
            onClick={() => futureFeature(`Ação "${action.label}"`)}
          >
            <p className="text-sm font-medium text-content">{action.label}</p>
            <p className="mt-1 text-xs text-content-muted">{action.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
