import { clients as mockClients } from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import type { Client, ClientPlan, ClientStatus, ClientTag } from "@/lib/types";

interface ClientRow {
  id: string;
  name: string;
  bandeira: string;
  plan: string;
  status: ClientStatus;
  start_date: string;
  tags: ClientTag[];
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    bandeira: row.bandeira,
    plan: row.plan as ClientPlan,
    status: row.status,
    startDate: row.start_date,
    tags: row.tags ?? [],
  };
}

let mockClientStore: Client[] = [...mockClients];

export interface UpdateClientInput {
  name: string;
  bandeira: string;
  plan: ClientPlan;
  status: ClientStatus;
}

export async function listClients(): Promise<Client[]> {
  const supabase = getSupabase();
  if (!supabase) return [...mockClientStore];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, bandeira, plan, status, start_date, tags")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapClient(row as ClientRow));
}

export async function createClient(input: {
  name: string;
  bandeira: string;
  plan: ClientPlan;
}): Promise<Client> {
  const supabase = getSupabase();
  const payload = {
    name: input.name.trim().toUpperCase(),
    bandeira: input.bandeira.trim() || "-",
    plan: input.plan,
  };

  if (!supabase) {
    const client: Client = {
      id: `client_${crypto.randomUUID()}`,
      ...payload,
      status: "ativo",
      startDate: new Date().toISOString().slice(0, 10),
      tags: ["em-dia"],
    };
    mockClientStore = [client, ...mockClientStore];
    return client;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      workspace_id: workspaceId,
      name: payload.name,
      bandeira: payload.bandeira,
      plan: payload.plan,
      status: "ativo",
      start_date: new Date().toISOString().slice(0, 10),
      tags: ["em-dia"],
    })
    .select("id, name, bandeira, plan, status, start_date, tags")
    .single();

  if (error) throw error;
  return mapClient(data as ClientRow);
}

export async function updateClient(
  clientId: string,
  input: UpdateClientInput
): Promise<Client> {
  const supabase = getSupabase();
  const name = input.name.trim().toUpperCase();
  if (!name) throw new Error("Informe o nome do cliente.");
  const bandeira = input.bandeira.trim() || "-";

  if (!supabase) {
    const existing = mockClientStore.find((item) => item.id === clientId);
    if (!existing) throw new Error("Cliente nao encontrado.");
    const updated: Client = {
      ...existing,
      name,
      bandeira,
      plan: input.plan,
      status: input.status,
    };
    mockClientStore = mockClientStore.map((item) =>
      item.id === clientId ? updated : item
    );
    return updated;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      name,
      bandeira,
      plan: input.plan,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", clientId)
    .select("id, name, bandeira, plan, status, start_date, tags")
    .single();

  if (error) throw error;
  return mapClient(data as ClientRow);
}

export async function deleteClient(clientId: string): Promise<void> {
  const supabase = getSupabase();

  if (!supabase) {
    mockClientStore = mockClientStore.filter((item) => item.id !== clientId);
    return;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", clientId);

  if (error) throw error;
}
