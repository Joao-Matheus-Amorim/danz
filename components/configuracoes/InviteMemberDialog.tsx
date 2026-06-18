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
import type { ProfileRole } from "@/lib/types";

const ROLE_OPTIONS: { value: ProfileRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gestor", label: "Gestor" },
  { value: "operador", label: "Operador" },
];

export interface InviteMemberInput {
  name: string;
  email: string;
  role: ProfileRole;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: InviteMemberInput) => Promise<void> | void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<ProfileRole>("operador");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setRole("operador");
    setError(null);
  }, [open]);

  const emailValid = /\S+@\S+\.\S+/.test(email.trim());

  async function submit() {
    if (!name.trim() || !emailValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), role });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel convidar o usuario.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-content">
            Convidar usuário
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            Envia um convite por e-mail e vincula o usuário a este workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="invite-name">Nome</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Joana Pires"
            />
          </div>
          <div>
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joana@dental-lead.com.br"
            />
            {email.trim() && !emailValid && (
              <p className="mt-1 text-xs text-alert">Informe um e-mail válido.</p>
            )}
          </div>
          <div>
            <Label htmlFor="invite-role">Função</Label>
            <Select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as ProfileRole)}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          {error && <p className="text-xs text-alert">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void submit()}
            disabled={submitting || !name.trim() || !emailValid}
          >
            {submitting ? "Convidando..." : "Convidar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
