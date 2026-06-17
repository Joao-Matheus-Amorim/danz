"use client";

import * as React from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PromptSuggestions } from "@/components/dltinho/PromptSuggestions";
import { BRAND } from "@/lib/constants";
import { askDLtinho } from "@/lib/openai";
import type { ChatMessage } from "@/lib/types";
import { localId } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Área central de chat do DLtinho.
 *
 * No MVP a resposta vem do stub `askDLtinho` (sem chamada real à OpenAI).
 * As mensagens vivem em estado local — a persistência real chega na Fase 4.
 */
export function ChatWorkspace({
  conversationId,
  initialMessages,
}: {
  conversationId: string | null;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, conversationId]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const userMsg: ChatMessage = {
      id: localId("msg"),
      conversationId: conversationId ?? "local",
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPending(true);

    const reply = await askDLtinho(trimmed);
    setMessages((prev) => [
      ...prev,
      {
        id: localId("msg"),
        conversationId: conversationId ?? "local",
        role: "assistant",
        content: reply.content,
        timestamp: new Date().toISOString(),
      },
    ]);
    setPending(false);
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-1">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-pulse-dot rounded-full bg-neon/[0.12] blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-neon-border bg-neon/[0.06] shadow-neon-strong">
                <Sparkles className="h-7 w-7 text-neon" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-content">{BRAND.ai.toUpperCase()}</h2>
            <p className="max-w-md text-sm text-content-muted">
              Peça em linguagem natural — eu converso e executo no sistema. Suas
              conversas ficam salvas ao lado.
            </p>
            <PromptSuggestions onPick={send} />
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "bg-neon/[0.12] text-content"
                    : "border border-white/[0.06] bg-surface-muted text-content"
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/[0.06] bg-surface-muted px-4 py-2.5 text-sm text-content-muted">
              {BRAND.ai} está digitando…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Pergunte ou peça algo ao ${BRAND.ai}...`}
        />
        <Button type="submit" variant="primary" size="icon" disabled={pending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
