"use client";

import { KeyRound, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CreateClientButton } from "@/components/clientes/CreateClientButton";
import { useToast } from "@/components/ui/toast";

/** Cabeçalho da central de campanhas com ações de token e novo cliente. */
export function CampaignHeader() {
  const { futureFeature } = useToast();

  return (
    <PageHeader
      label="Meta Ads"
      title="CENTRAL DE CAMPANHAS"
      subtitle="Performance, criativos e recargas — Meta Ads."
      actions={
        <>
          <Button variant="secondary" onClick={() => futureFeature("Configurar Token")}>
            <KeyRound className="h-4 w-4" /> Configurar Token
          </Button>
          <CreateClientButton>
            <UserPlus className="h-4 w-4" /> Novo Cliente
          </CreateClientButton>
        </>
      }
    />
  );
}
