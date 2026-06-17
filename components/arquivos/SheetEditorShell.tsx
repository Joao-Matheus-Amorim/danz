"use client";

import * as React from "react";
import { Plus, Search, Sheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type { SheetItem } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

/**
 * Shell de Planilhas: lista lateral + área de edição embutida.
 *
 * No MVP a área central mostra um placeholder. A edição real (Google Sheets
 * embutido com todas as funções) chega na Fase 5 — claramente sinalizado.
 */
export function SheetEditorShell({
  sheets,
  loading = false,
}: {
  sheets: SheetItem[];
  loading?: boolean;
}) {
  const { futureFeature } = useToast();
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const visible = sheets.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );
  const selected = sheets.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="flex h-[64vh] flex-col">
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <p className="dl-label">Suas planilhas</p>
          <Button variant="primary" className="w-full" onClick={() => futureFeature("Nova planilha")}>
            <Plus className="h-4 w-4" /> Nova planilha
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar"
              className="pl-9"
            />
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-sm text-content-muted">
                Carregando planilhas...
              </p>
            ) : visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-content-muted">
                Nenhuma planilha encontrada.
              </p>
            ) : (
              visible.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition-colors",
                    selectedId === s.id
                      ? "dl-neon-active"
                      : "border-white/[0.06] bg-surface-muted hover:border-neon-border"
                  )}
                >
                  <Sheet className="mt-0.5 h-4 w-4 shrink-0 text-content-muted" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-content">{s.title}</p>
                    <p className="text-[11px] text-content-muted">
                      {formatDate(s.updatedAt, "dd/MM/yyyy")}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex h-[64vh] items-center justify-center p-6">
        {selected ? (
          <EmptyState
            icon={Sheet}
            title={selected.title}
            description="O editor embutido do Google Sheets (com todas as funções) será carregado aqui na Fase 5. No MVP exibimos apenas o cabeçalho da planilha selecionada."
          >
            <Button variant="outline" onClick={() => futureFeature("Abrir editor do Sheets")}>
              Abrir no editor
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={Sheet}
            title="Suas planilhas"
            description="Escolha uma planilha na lista ao lado (ou crie uma nova) para abrir e editar aqui dentro, com todas as funções do Google."
          />
        )}
      </Card>
    </div>
  );
}
