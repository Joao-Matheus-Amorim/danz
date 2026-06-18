"use client";

import * as React from "react";
import { Building2, Palette, Users, Plug, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  InviteMemberDialog,
  type InviteMemberInput,
} from "@/components/configuracoes/InviteMemberDialog";
import { INTEGRATION_STATUS_LABEL, INTEGRATION_STATUS_STYLE } from "@/lib/constants";
import { integrations } from "@/lib/mock-data";
import {
  getCurrentWorkspace,
  updateCurrentWorkspace,
} from "@/lib/repositories/workspace";
import {
  getWorkspaceMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
} from "@/lib/repositories/members";
import { emitWorkspaceUpdated } from "@/lib/events/workspace";
import { cn } from "@/lib/utils";
import type { Profile, ProfileRole } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  gestor: "Gestor",
  operador: "Operador",
};

const EDITABLE_ROLES: ProfileRole[] = ["admin", "gestor", "operador"];

export default function ConfiguracoesPage() {
  const { futureFeature, toast } = useToast();
  const [wsName, setWsName] = React.useState("");
  const [wsRole, setWsRole] = React.useState("");
  const [loadingWs, setLoadingWs] = React.useState(true);
  const [savingWs, setSavingWs] = React.useState(false);

  const [members, setMembers] = React.useState<Profile[]>([]);
  const [loadingMembers, setLoadingMembers] = React.useState(true);
  const [savingMemberId, setSavingMemberId] = React.useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<Profile | null>(null);
  const [removing, setRemoving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    getCurrentWorkspace()
      .then((ws) => {
        if (!mounted || !ws) return;
        setWsName(ws.name);
        setWsRole(ws.role);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar o workspace.");
      })
      .finally(() => {
        if (mounted) setLoadingWs(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  React.useEffect(() => {
    let mounted = true;

    getWorkspaceMembers()
      .then((data) => {
        if (mounted) setMembers(data);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar os usuarios.");
      })
      .finally(() => {
        if (mounted) setLoadingMembers(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  async function handleInviteMember(input: InviteMemberInput) {
    const updated = await inviteMember(input);
    setMembers(updated);
    toast("Convite enviado.");
  }

  async function handleRoleChange(profileId: string, role: ProfileRole) {
    setSavingMemberId(profileId);
    try {
      const updated = await updateMemberRole(profileId, role);
      setMembers(updated);
      toast("Função atualizada.");
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel atualizar a função.");
    } finally {
      setSavingMemberId(null);
    }
  }

  async function handleRemoveMember() {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      const updated = await removeMember(memberToRemove.id);
      setMembers(updated);
      toast("Usuário removido do workspace.");
      setMemberToRemove(null);
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Nao foi possivel remover o usuário.");
    } finally {
      setRemoving(false);
    }
  }

  async function handleSaveWorkspace() {
    if (!wsName.trim() || savingWs) return;
    setSavingWs(true);
    try {
      const updated = await updateCurrentWorkspace({ name: wsName, role: wsRole });
      setWsName(updated.name);
      setWsRole(updated.role);
      emitWorkspaceUpdated(updated);
      toast("Workspace atualizado.");
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel salvar. Apenas owner/admin podem editar o workspace.");
    } finally {
      setSavingWs(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Administração"
        title="CONFIGURAÇÕES"
        subtitle="Workspace, preferências, usuários e o status de cada integração."
      />

      {/* Workspace */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Building2 className="h-4 w-4 text-neon-text" />
          <CardTitle>Dados do workspace</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ws-name">Nome do workspace</Label>
            <Input
              id="ws-name"
              value={wsName}
              onChange={(event) => setWsName(event.target.value)}
              disabled={loadingWs || savingWs}
              placeholder={loadingWs ? "Carregando..." : "Nome do workspace"}
            />
          </div>
          <div>
            <Label htmlFor="ws-role">Função / segmento</Label>
            <Input
              id="ws-role"
              value={wsRole}
              onChange={(event) => setWsRole(event.target.value)}
              disabled={loadingWs || savingWs}
              placeholder={loadingWs ? "Carregando..." : "Ex.: Tráfego"}
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              variant="primary"
              onClick={() => void handleSaveWorkspace()}
              disabled={loadingWs || savingWs || !wsName.trim()}
            >
              {savingWs ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferências visuais */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Palette className="h-4 w-4 text-neon-text" />
          <CardTitle>Preferências visuais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3">
            <div>
              <p className="text-sm text-content">Tema escuro premium</p>
              <p className="text-[11px] text-content-muted">Laranja Dental Lead sobre azul institucional.</p>
            </div>
            <Badge className="text-neon-text border-neon-border bg-neon/[0.08]">Ativo</Badge>
          </div>
          <Button variant="secondary" onClick={() => futureFeature("Tema claro")}>
            Alternar tema (em planejamento)
          </Button>
        </CardContent>
      </Card>

      {/* Usuários */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Users className="h-4 w-4 text-neon-text" />
          <CardTitle>Usuários e permissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingMembers && (
            <p className="text-sm text-content-muted">Carregando usuários...</p>
          )}
          {!loadingMembers &&
            members.map((p) => {
              const isOwner = p.role === "owner";
              const saving = savingMemberId === p.id;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3"
                >
                  <Avatar initials={p.initials} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-content">{p.name}</p>
                    <p className="text-[11px] text-content-muted">{p.email}</p>
                  </div>
                  {isOwner ? (
                    <Badge className="text-content-muted border-white/10 bg-white/[0.03]">
                      {ROLE_LABEL[p.role] ?? p.role}
                    </Badge>
                  ) : (
                    <Select
                      className="h-9 w-auto"
                      value={p.role}
                      disabled={saving}
                      onChange={(e) => void handleRoleChange(p.id, e.target.value as ProfileRole)}
                    >
                      {EDITABLE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </Select>
                  )}
                  {!isOwner && (
                    <Button
                      variant="ghost"
                      className="text-content-muted hover:text-alert"
                      onClick={() => setMemberToRemove(p)}
                      aria-label={`Remover ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          <Button variant="secondary" onClick={() => setInviteOpen(true)}>
            Convidar usuário
          </Button>
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={handleInviteMember}
      />

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}
        title="Remover usuário"
        description={`${memberToRemove?.name ?? ""} perderá acesso a este workspace.`}
        confirmLabel="Remover"
        pendingLabel="Removendo..."
        pending={removing}
        onConfirm={() => void handleRemoveMember()}
      />

      {/* Integrações */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Plug className="h-4 w-4 text-neon-text" />
          <CardTitle>Integrações</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {integrations.map((i) => (
            <div
              key={i.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-content">{i.name}</p>
                <p className="mt-0.5 text-[12px] text-content-muted">{i.description}</p>
                <p className="mt-1 text-[11px] text-content-muted">{i.phase}</p>
              </div>
              <Badge className={cn("shrink-0", INTEGRATION_STATUS_STYLE[i.status])}>
                {INTEGRATION_STATUS_LABEL[i.status]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
