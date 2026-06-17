"use client";

import { MessageCircle } from "lucide-react";
import type { WhatsAppConversation } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

/** Lista lateral de conversas do WhatsApp. */
export function ConversationInbox({
  conversations,
  activeId,
  loading = false,
  onSelect,
}: {
  conversations: WhatsAppConversation[];
  activeId: string | null;
  loading?: boolean;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-content-muted">
        Carregando conversas...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-muted">
        Nenhuma conversa encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto">
      {conversations.map((c) => (
        <button
          type="button"
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn(
            "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
            activeId === c.id
              ? "dl-neon-active"
              : "border-white/[0.06] bg-surface-muted hover:border-neon-border"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-content-muted">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-content">{c.contactName}</p>
              <span className="shrink-0 text-[10px] text-content-muted">
                {formatDate(c.lastMessageAt, "HH:mm")}
              </span>
            </div>
            <p className="truncate text-[12px] text-content-muted">{c.lastMessage}</p>
          </div>
          {c.unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neon px-1 text-[10px] font-semibold text-content">
              {c.unread}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
