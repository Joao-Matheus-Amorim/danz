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
import type { Client, ClientPlan } from "@/lib/types";
import { localId } from "@/lib/utils";

const PLANS: ClientPlan[] = ["Essencial", "Pro", "Premium", "Performance"];

/**
 * Modal de novo cliente. No MVP salva apenas em estado local (callback
 * onCreate) — a persistência real (Supabase) chega na Fase 3.
 */
export function ClientModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (client: Client) => void;
}) {
  const [name, setName] = React.useState("");
  const [niche, setNiche] = React.useState("");
  const [plan, setPlan] = React.useState<ClientPlan>("Essencial");

  const submit = () => {
    if (!name.trim()) return;
    onCreate({
      id: localId("client"),
      name: name.trim().toUpperCase(),
      niche: niche.trim() || "—",
      plan,
      status: "ativo",
      startDate: new Date().toISOString().slice(0, 10),
      tags: ["em-dia"],
    });
    setName("");
    setNiche("");
    setPlan("Essencial");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-content">
            Novo cliente
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            Cadastro local (mock). Será persistido no Supabase na Fase 3.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="c-name">Nome do cliente</Label>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Padaria do Zé"
            />
          </div>
          <div>
            <Label htmlFor="c-niche">Nicho</Label>
            <Input
              id="c-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex.: Alimentação"
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
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit}>
            Criar cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
