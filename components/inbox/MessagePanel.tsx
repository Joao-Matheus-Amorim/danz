"use client";

import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type { WhatsAppConversation, WhatsAppMessage } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

/**
 * Painel central de mensagens.
 *
 * No MVP o envio apenas sinaliza integração futura — não há provedor de
 * WhatsApp conectado (Fase 5).
 */
export function MessagePanel({
  conversation,
  messages,
  loading = false,
}: {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  loading?: boolean;
}) {
  const { futureFeature } = useToast();

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={MessageSquare}
          title="Selecione uma conversa"
          description="Selecione uma conversa para ver as mensagens e responder."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] pb-3">
        <p className="text-sm font-semibold text-content">{conversation.contactName}</p>
        <p className="text-[11px] text-content-muted">WhatsApp · {conversation.id}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-content-muted">
            Carregando mensagens...
          </p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-content-muted">
            Nenhuma mensagem encontrada.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.direction === "out" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  m.direction === "out"
                    ? "bg-neon/[0.12] text-content"
                    : "border border-white/[0.06] bg-surface-muted text-content"
                )}
              >
                <p>{m.body}</p>
                <p className="mt-1 text-right text-[10px] text-content-muted">
                  {formatDate(m.timestamp, "HH:mm")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          futureFeature("Envio de mensagem WhatsApp");
        }}
        className="flex items-center gap-2 border-t border-white/[0.06] pt-3"
      >
        <Input placeholder="Digite uma mensagem..." />
        <Button type="submit" variant="primary" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
