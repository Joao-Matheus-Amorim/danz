"use client";

import { Building2, Palette, Users, Plug } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { BRAND, INTEGRATION_STATUS_LABEL, INTEGRATION_STATUS_STYLE } from "@/lib/constants";
import { integrations, profiles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  gestor: "Gestor",
  operador: "Operador",
};

export default function ConfiguracoesPage() {
  const { futureFeature } = useToast();

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
          <Building2 className="h-4 w-4 text-neon" />
          <CardTitle>Dados do workspace</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ws-name">Nome do workspace</Label>
            <Input id="ws-name" defaultValue={BRAND.fullName} />
          </div>
          <div>
            <Label htmlFor="ws-role">Função / segmento</Label>
            <Input id="ws-role" defaultValue={BRAND.role} />
          </div>
          <div className="sm:col-span-2">
            <Button variant="primary" onClick={() => futureFeature("Salvar workspace")}>
              Salvar alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferências visuais */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Palette className="h-4 w-4 text-neon" />
          <CardTitle>Preferências visuais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3">
            <div>
              <p className="text-sm text-content">Tema escuro premium</p>
              <p className="text-[11px] text-content-muted">Neon verde-limão sobre preto esverdeado.</p>
            </div>
            <Badge className="text-neon border-neon-border bg-neon/[0.08]">Ativo</Badge>
          </div>
          <Button variant="secondary" onClick={() => futureFeature("Tema claro")}>
            Alternar tema (em planejamento)
          </Button>
        </CardContent>
      </Card>

      {/* Usuários */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Users className="h-4 w-4 text-neon" />
          <CardTitle>Usuários e permissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3"
            >
              <Avatar initials={p.initials} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-content">{p.name}</p>
                <p className="text-[11px] text-content-muted">{p.email}</p>
              </div>
              <Badge className="text-content-muted border-white/10 bg-white/[0.03]">
                {ROLE_LABEL[p.role] ?? p.role}
              </Badge>
            </div>
          ))}
          <Button variant="secondary" onClick={() => futureFeature("Convidar usuário")}>
            Convidar usuário
          </Button>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Plug className="h-4 w-4 text-neon" />
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
