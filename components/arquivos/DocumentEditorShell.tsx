"use client";

import * as React from "react";
import { Plus, Search, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type { DocumentItem } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

/**
 * Shell de Documentos: lista lateral + área de edição embutida.
 *
 * No MVP a área central mostra um placeholder. A edição real (Google Docs
 * embutido com todas as funções) chega na Fase 5 — claramente sinalizado.
 */
export function DocumentEditorShell({
  documents,
  loading = false,
}: {
  documents: DocumentItem[];
  loading?: boolean;
}) {
  const { futureFeature } = useToast();
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const visible = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );
  const selected = documents.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
      {/* Lista lateral */}
      <Card className="flex h-[64vh] flex-col">
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <p className="dl-label">Seus documentos</p>
          <Button variant="primary" className="w-full" onClick={() => futureFeature("Novo documento")}>
            <Plus className="h-4 w-4" /> Novo documento
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
                Carregando documentos...
              </p>
            ) : visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-content-muted">
                Nenhum documento encontrado.
              </p>
            ) : (
              visible.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition-colors",
                    selectedId === d.id
                      ? "dl-neon-active"
                      : "border-white/[0.06] bg-surface-muted hover:border-neon-border"
                  )}
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-content-muted" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-content">{d.title}</p>
                    <p className="text-[11px] text-content-muted">
                      {formatDate(d.updatedAt, "dd/MM/yyyy")}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Área central */}
      <Card className="flex h-[64vh] items-center justify-center p-6">
        {selected ? (
          <EmptyState
            icon={FileText}
            title={selected.title}
            description="O editor embutido do Google Docs (com todas as funções) será carregado aqui na Fase 5. No MVP exibimos apenas o cabeçalho do documento selecionado."
          >
            <Button variant="outline" onClick={() => futureFeature("Abrir editor do Docs")}>
              Abrir no editor
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={FileText}
            title="Seus documentos"
            description="Escolha um documento na lista ao lado (ou crie um novo) para abrir e editar aqui dentro, com todas as funções do Google."
          />
        )}
      </Card>
    </div>
  );
}
