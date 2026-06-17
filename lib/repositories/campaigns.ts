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

export async function listCampaigns(): Promise<Campaign[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockCampaigns;
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
