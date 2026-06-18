"use client";

import * as React from "react";
import { Search, SlidersHorizontal, FileCheck2, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ClientsTable } from "@/components/clientes/ClientsTable";
import { ClientModal } from "@/components/clientes/ClientModal";
import { CreateClientButton } from "@/components/clientes/CreateClientButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useRole } from "@/lib/role/RoleContext";
import {
  deleteClient,
  listClients,
  updateClient,
  type UpdateClientInput,
} from "@/lib/repositories/clients";
import type { Client, ClientStatus } from "@/lib/types";

export default function ClientesPage() {
  const { futureFeature, toast } = useToast();
  const { canEdit, canDelete } = useRole();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ClientStatus | "todos">("todos");
  const [loading, setLoading] = React.useState(true);
  const [editingClient, setEditingClient] = React.useState<Client | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    listClients()
      .then((items) => {
        if (mounted) setClients(items);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar clientes do Supabase.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  function openEditModal(client: Client) {
    setEditingClient(client);
    setModalOpen(true);
  }

  async function handleUpdate(input: UpdateClientInput) {
    if (!editingClient) return;
    try {
      const updated = await updateClient(editingClient.id, input);
      setClients((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      toast("Cliente atualizado.");
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel salvar o cliente.");
      throw error;
    }
  }

  async function handleConfirmDelete() {
    const client = clientToDelete;
    if (!client || pendingId) return;
    const previous = clients;
    setPendingId(client.id);
    setClients((prev) => prev.filter((item) => item.id !== client.id));

    try {
      await deleteClient(client.id);
      toast("Cliente excluido.");
      setClientToDelete(null);
    } catch (error) {
      console.error(error);
      setClients(previous);
      toast("Nao foi possivel excluir o cliente.");
    } finally {
      setPendingId(null);
    }
  }

  const filtered = clients.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.bandeira.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "todos" || c.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        label="Carteira"
        title="CLIENTES"
        subtitle="Cadastro e gestao da carteira ativa do workspace."
        actions={
          <>
            <Button variant="ghost" onClick={() => futureFeature("POP Cliente Novo")}>
              <FileCheck2 className="h-4 w-4" /> POP Cliente Novo
            </Button>
            {canEdit && (
              <CreateClientButton onCreated={(client) => setClients((prev) => [client, ...prev])}>
                <Plus className="h-4 w-4" /> Novo cliente
              </CreateClientButton>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente ou bandeira..."
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
        <Button variant="secondary" onClick={() => futureFeature("Filtros avancados")}>
          <SlidersHorizontal className="h-4 w-4" /> Filtrar
        </Button>
      </div>

      <ClientsTable
        clients={filtered}
        loading={loading}
        onEdit={canEdit ? openEditModal : undefined}
        onDelete={canDelete ? setClientToDelete : undefined}
        pendingId={pendingId}
      />

      <ClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={editingClient}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={clientToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setClientToDelete(null);
        }}
        title="Excluir cliente"
        description={
          <>
            Tem certeza que deseja excluir
            {clientToDelete ? ` ${clientToDelete.name}` : " este cliente"}? Essa
            acao nao pode ser desfeita.
          </>
        }
        confirmLabel="Excluir cliente"
        pendingLabel="Excluindo..."
        pending={pendingId !== null}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
