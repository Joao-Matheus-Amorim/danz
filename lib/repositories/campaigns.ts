import { campaigns as mockCampaigns } from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type { Campaign, CampaignStatus } from "@/lib/types";

interface CampaignRow {
  id: string;
  client_id: string | null;
  status: CampaignStatus;
  spend_cents: number;
  conversations: number;
  results: number;
  sent: number;
  balance_cents: number;
  clients: { name: string | null } | { name: string | null }[] | null;
}

function getClientName(
  client: { name: string | null } | { name: string | null }[] | null
): string {
  const value = Array.isArray(client) ? client[0] : client;
  return value?.name ?? "Cliente sem vinculo";
}

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    clientId: row.client_id ?? "",
    clientName: getClientName(row.clients),
    status: row.status,
    spendCents: Number(row.spend_cents),
    conversations: row.conversations,
    results: row.results,
    sent: row.sent,
    balanceCents: Number(row.balance_cents),
  };
}

const campaignSelect =
  "id, client_id, status, spend_cents, conversations, results, sent, balance_cents, clients(name)";

let mockCampaignStore: Campaign[] = [...mockCampaigns];

export interface CampaignInput {
  status: CampaignStatus;
  balanceCents: number;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return [...mockCampaignStore];
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("campaigns")
    .select(campaignSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapCampaign(row as CampaignRow));
}

export async function updateCampaign(
  campaignId: string,
  input: CampaignInput
): Promise<Campaign> {
  const supabase = getSupabase();
  const balanceCents = Math.max(0, Math.round(input.balanceCents));

  if (!supabase) {
    const existing = mockCampaignStore.find((item) => item.id === campaignId);
    if (!existing) throw new Error("Campanha nao encontrada.");
    const updated: Campaign = {
      ...existing,
      status: input.status,
      balanceCents,
    };
    mockCampaignStore = mockCampaignStore.map((item) =>
      item.id === campaignId ? updated : item
    );
    return updated;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("campaigns")
    .update({
      status: input.status,
      balance_cents: balanceCents,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", campaignId)
    .select(campaignSelect)
    .single();

  if (error) throw error;
  return mapCampaign(data as CampaignRow);
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const supabase = getSupabase();

  if (!supabase) {
    mockCampaignStore = mockCampaignStore.filter(
      (item) => item.id !== campaignId
    );
    return;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", campaignId);

  if (error) throw error;
}
