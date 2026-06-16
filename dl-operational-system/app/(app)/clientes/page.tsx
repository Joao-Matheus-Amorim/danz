"use client";

import * as React from "react";
import { Search, SlidersHorizontal, FileCheck2, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ClientsTable } from "@/components/clientes/ClientsTable";
import { ClientModal } from "@/components/clientes/ClientModal";
import { useToast } from "@/components/ui/toast";
import { clients as initialClients } from "@/lib/mock-data";
import type { Client, ClientStatus } from "@/lib/types";

export default function ClientesPage() {
  const { futureFeature } = useToast();
  const [clients, setClients] = React.useState<Client[]>(initialClients);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ClientStatus | "todos">("todos");
  const [modalOpen, setModalOpen] = React.useState(false);

  const filtered = clients.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.niche.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "todos" || c.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        label="Carteira"
        title="CLIENTES"
        subtitle="Cadastro e gestão da carteira ativa do workspace."
        actions={
          <>
            <Button variant="ghost" onClick={() => futureFeature("POP Cliente Novo")}>
              <FileCheck2 className="h-4 w-4" /> POP Cliente Novo
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Novo cliente
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente ou nicho..."
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ClientStatus | "todos")}
          className="sm:w-44"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="pausado">Pausado</option>
        </Select>
        <Button variant="secondary" onClick={() => futureFeature("Filtros avançados")}>
          <SlidersHorizontal className="h-4 w-4" /> Filtrar
        </Button>
      </div>

      <ClientsTable clients={filtered} />

      <ClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={(c) => setClients((prev) => [c, ...prev])}
      />
    </div>
  );
}
