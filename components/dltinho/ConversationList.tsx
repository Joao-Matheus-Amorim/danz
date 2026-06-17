"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatConversation } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/** Sidebar interna de conversas do DLtinho. */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <Button variant="primary" className="w-full" onClick={onNew}>
        <Plus className="h-4 w-4" />
        Nova conversa
      </Button>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {conversations.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
              activeId === c.id
                ? "dl-neon-active"
                : "border-white/[0.06] bg-surface-muted hover:border-neon-border"
            )}
          >
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-content-muted" />
            <div className="min-w-0">
              <p className="truncate text-sm text-content">{c.title}</p>
              <p className="text-[11px] text-content-muted">
                {formatDate(c.updatedAt, "dd 'de' MMM · HH:mm")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
