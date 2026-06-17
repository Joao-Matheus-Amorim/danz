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

export async function listClients(): Promise<Client[]> {
  const supabase = getSupabase();
  if (!supabase) return mockClients;

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
    return {
      id: `client_${crypto.randomUUID()}`,
      ...payload,
      status: "ativo",
      startDate: new Date().toISOString().slice(0, 10),
      tags: ["em-dia"],
    };
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
