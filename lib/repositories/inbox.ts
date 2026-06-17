import {
  getMessagesByConversation,
  whatsappConversations as mockConversations,
} from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type {
  WhatsAppConversation,
  WhatsAppMessage,
} from "@/lib/types";

interface WhatsAppConversationRow {
  id: string;
  contact_name: string;
  number_label: string;
  last_message: string | null;
  last_message_at: string | null;
  unread: number;
  created_at: string;
}

interface WhatsAppMessageRow {
  id: string;
  conversation_id: string;
  direction: WhatsAppMessage["direction"];
  body: string;
  created_at: string;
}

function mapConversation(row: WhatsAppConversationRow): WhatsAppConversation {
  return {
    id: row.id,
    contactName: row.contact_name,
    lastMessage: row.last_message ?? "",
    lastMessageAt: row.last_message_at ?? row.created_at,
    unread: row.unread,
    numberId: row.number_label,
  };
}

function mapMessage(row: WhatsAppMessageRow): WhatsAppMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    direction: row.direction,
    body: row.body,
    timestamp: row.created_at,
  };
}

async function requireWorkspaceId(): Promise<string> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }
  return workspaceId;
}

export async function listWhatsAppConversations(): Promise<
  WhatsAppConversation[]
> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockConversations;
  }

  const workspaceId = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select(
      "id, contact_name, number_label, last_message, last_message_at, unread, created_at"
    )
    .eq("workspace_id", workspaceId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) =>
    mapConversation(row as WhatsAppConversationRow)
  );
}

export async function listWhatsAppMessages(
  conversationId: string
): Promise<WhatsAppMessage[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return getMessagesByConversation(conversationId);
  }

  const workspaceId = await requireWorkspaceId();
  const { data: conversation, error: conversationError } = await supabase
    .from("whatsapp_conversations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) throw conversationError;
  if (!conversation) return [];

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("id, conversation_id, direction, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapMessage(row as WhatsAppMessageRow));
}
