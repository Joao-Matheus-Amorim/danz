"use client";

import * as React from "react";
import { Search, Plus, HardDrive, Clock, Users, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { FileCard } from "@/components/arquivos/FileCard";
import { useToast } from "@/components/ui/toast";
import type { DriveFile } from "@/lib/types";

const SECTIONS = [
  { key: "meu-drive", label: "Meu Drive", icon: HardDrive },
  { key: "recentes", label: "Recentes", icon: Clock },
  { key: "compartilhados", label: "Compartilhados", icon: Users },
  { key: "estrela", label: "Com estrela", icon: Star },
  { key: "lixeira", label: "Lixeira", icon: Trash2 },
] as const;

const FILTERS = ["Tipo", "Pessoas", "Modificado", "Fonte"];

/**
 * Explorador do Drive (mock). Os dados vêm de mock-data e estão claramente
 * isolados — a integração real com o Google Drive chega na Fase 5.
 */
export function DriveExplorer({
  files,
  loading = false,
}: {
  files: DriveFile[];
  loading?: boolean;
}) {
  const { futureFeature } = useToast();
  const [section, setSection] = React.useState<string>("meu-drive");
  const [query, setQuery] = React.useState("");

  const matchesSection = (f: DriveFile): boolean => {
    // A lixeira é exclusiva: arquivos descartados não aparecem em outras seções.
    if (section === "lixeira") return Boolean(f.trashed);
    if (f.trashed) return false;
    if (section === "estrela") return Boolean(f.starred);
    // Demais seções filtram pela origem real do arquivo.
    return f.source === section;
  };

  const visible = files.filter(
    (f) =>
      matchesSection(f) &&
      f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      {/* Lateral de seções */}
      <div className="space-y-1">
        <Button variant="primary" className="mb-2 w-full" onClick={() => futureFeature("Novo no Drive")}>
          <Plus className="h-4 w-4" /> Novo
        </Button>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              section === s.key
                ? "dl-neon-active text-content"
                : "text-content-muted hover:bg-white/[0.04] hover:text-content"
            }`}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquise no Drive..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Select
              key={f}
              className="w-auto"
              onChange={() => futureFeature(`Filtro: ${f}`)}
              defaultValue=""
            >
              <option value="" disabled>
                {f}
              </option>
              <option value="all">Todos</option>
            </Select>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {loading ? (
            <p className="col-span-full py-10 text-center text-sm text-content-muted">
              Carregando arquivos...
            </p>
          ) : visible.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm text-content-muted">
              Nada por aqui ainda.
            </p>
          ) : (
            visible.map((f) => <FileCard key={f.id} file={f} />)
          )}
        </div>
      </div>
    </div>
  );
}
