"use client";

import * as React from "react";
import { Plus, Search, FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useRole } from "@/lib/role/RoleContext";
import { releaseDocumentToAdmin, unreleaseDocumentFromAdmin } from "@/lib/repositories/files";
import { getWorkspaceMembers } from "@/lib/repositories/members";
import type { DocumentItem, Profile } from "@/lib/types";
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
  onDocumentsChange,
}: {
  documents: DocumentItem[];
  loading?: boolean;
  onDocumentsChange?: (documents: DocumentItem[]) => void;
}) {
  const { futureFeature, toast } = useToast();
  const { role } = useRole();
  // Apenas owner/gestor liberam documento para admin (admin nao pode
  // repassar a propria liberacao para outros admins).
  const canManageDocumentAccess = role === "owner" || role === "gestor";
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [admins, setAdmins] = React.useState<Profile[]>([]);
  const [accessOpen, setAccessOpen] = React.useState(false);
  const [accessSaving, setAccessSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!canManageDocumentAccess) return;
    getWorkspaceMembers()
      .then((members) => setAdmins(members.filter((member) => member.role === "admin")))
      .catch((error) => console.error(error));
  }, [canManageDocumentAccess]);

  const visible = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );
  const selected = documents.find((d) => d.id === selectedId) ?? null;

  async function toggleAdminRelease(profileId: string, released: boolean) {
    if (!selected) return;
    setAccessSaving(profileId);
    try {
      if (released) {
        await unreleaseDocumentFromAdmin(selected.id, profileId);
      } else {
        await releaseDocumentToAdmin(selected.id, profileId);
      }
      const nextReleasedAdminIds = released
        ? selected.releasedAdminIds.filter((id) => id !== profileId)
        : [...selected.releasedAdminIds, profileId];
      onDocumentsChange?.(
        documents.map((d) =>
          d.id === selected.id ? { ...d, releasedAdminIds: nextReleasedAdminIds } : d
        )
      );
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel atualizar o acesso ao documento.");
    } finally {
      setAccessSaving(null);
    }
  }

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
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={() => futureFeature("Abrir editor do Docs")}>
                Abrir no editor
              </Button>
              {canManageDocumentAccess && (
                <Button variant="ghost" onClick={() => setAccessOpen(true)}>
                  <Users className="h-4 w-4" /> Liberar para admins
                </Button>
              )}
            </div>
          </EmptyState>
        ) : (
          <EmptyState
            icon={FileText}
            title="Seus documentos"
            description="Escolha um documento na lista ao lado (ou crie um novo) para abrir e editar aqui dentro, com todas as funções do Google."
          />
        )}
      </Card>

      <Dialog open={accessOpen} onOpenChange={setAccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-content">
              Acesso de admins ao documento
            </DialogTitle>
            <DialogDescription className="text-sm text-content-muted">
              {selected ? `Escolha quais admins podem ver "${selected.title}".` : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {admins.length === 0 ? (
              <p className="text-sm text-content-muted">Nenhum admin no workspace.</p>
            ) : (
              admins.map((admin) => {
                const released = selected?.releasedAdminIds.includes(admin.id) ?? false;
                return (
                  <label
                    key={admin.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-content hover:bg-white/[0.04]"
                  >
                    <input
                      type="checkbox"
                      checked={released}
                      disabled={accessSaving === admin.id}
                      onChange={() => void toggleAdminRelease(admin.id, released)}
                    />
                    {admin.name}
                  </label>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccessOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
