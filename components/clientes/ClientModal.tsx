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

const PLANS: ClientPlan[] = ["Essencial", "Pro", "Premium", "Performance"];

export function ClientModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (client: Pick<Client, "name" | "niche" | "plan">) => Promise<void> | void;
}) {
  const [name, setName] = React.useState("");
  const [niche, setNiche] = React.useState("");
  const [plan, setPlan] = React.useState<ClientPlan>("Essencial");
  const [submitting, setSubmitting] = React.useState(false);

  async function submit() {
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim().toUpperCase(),
        niche: niche.trim() || "-",
        plan,
      });
      setName("");
      setNiche("");
      setPlan("Essencial");
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
            Novo cliente
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            Cadastro persistido no Supabase quando a integracao estiver configurada.
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
            <Label htmlFor="c-niche">Nicho</Label>
            <Input
              id="c-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex.: Alimentacao"
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
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => void submit()} disabled={submitting}>
            {submitting ? "Criando..." : "Criar cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
