"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Client, ClientPlan, ClientStatus } from "@/lib/types";

const PLANS: ClientPlan[] = ["Essencial", "Pro", "Premium", "Performance"];

export interface ClientFormInput {
  name: string;
  bandeira: string;
  plan: ClientPlan;
  status: ClientStatus;
}

export function ClientModal({
  open,
  onOpenChange,
  client,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSubmit: (input: ClientFormInput) => Promise<void> | void;
}) {
  const [name, setName] = React.useState("");
  const [bandeira, setBandeira] = React.useState("");
  const [plan, setPlan] = React.useState<ClientPlan>("Essencial");
  const [status, setStatus] = React.useState<ClientStatus>("ativo");
  const [submitting, setSubmitting] = React.useState(false);

  const isEditing = Boolean(client);

  React.useEffect(() => {
    if (!open) return;
    setName(client?.name ?? "");
    setBandeira(client?.bandeira && client.bandeira !== "-" ? client.bandeira : "");
    setPlan(client?.plan ?? "Essencial");
    setStatus(client?.status ?? "ativo");
  }, [open, client]);

  async function submit() {
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim().toUpperCase(),
        bandeira: bandeira.trim() || "-",
        plan,
        status,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-content">
            {isEditing ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            {isEditing
              ? "Atualize os dados da carteira deste cliente."
              : "Cadastro persistido no Supabase quando a integracao estiver configurada."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="c-name">Nome do cliente</Label>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Padaria do Ze"
            />
          </div>
          <div>
            <Label htmlFor="c-bandeira">Bandeira</Label>
            <Input
              id="c-bandeira"
              value={bandeira}
              onChange={(e) => setBandeira(e.target.value)}
              placeholder="Ex.: Mais Sorriso"
            />
          </div>
          <div>
            <Label htmlFor="c-plan">Plano</Label>
            <Select
              id="c-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value as ClientPlan)}
            >
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          {isEditing && (
            <div>
              <Label htmlFor="c-status">Status</Label>
              <Select
                id="c-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
              >
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => void submit()} disabled={submitting}>
            {submitting
              ? "Salvando..."
              : isEditing
                ? "Salvar cliente"
                : "Criar cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
