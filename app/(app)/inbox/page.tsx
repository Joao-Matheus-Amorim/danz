"use client";

import * as React from "react";
import { ConversationInbox } from "@/components/inbox/ConversationInbox";
import { MessagePanel } from "@/components/inbox/MessagePanel";
import { WhatsAppConnection } from "@/components/inbox/WhatsAppConnection";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { whatsappNumbers } from "@/lib/mock-data";
import {
  listWhatsAppConversations,
  listWhatsAppMessages,
} from "@/lib/repositories/inbox";
import type { WhatsAppConversation, WhatsAppMessage } from "@/lib/types";

export default function InboxPage() {
  const { toast } = useToast();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<
    WhatsAppConversation[]
  >([]);
  const [messages, setMessages] = React.useState<WhatsAppMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    listWhatsAppConversations()
      .then((items) => {
        if (mounted) setConversations(items);
      })
      .catch((error) => {
        console.error(error);
        toast("Nao foi possivel carregar as conversas.");
      })
      .finally(() => {
        if (mounted) setLoadingConversations(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  React.useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    let mounted = true;
    setMessages([]);
    setLoadingMessages(true);

    listWhatsAppMessages(activeId)
      .then((items) => {
        if (mounted) setMessages(items);
      })
      .catch((error) => {
        console.error(error);
        toast("Nao foi possivel carregar as mensagens.");
      })
      .finally(() => {
        if (mounted) setLoadingMessages(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeId, toast]);

  React.useEffect(() => {
    if (!activeId) return;
    if (!conversations.some((conversation) => conversation.id === activeId)) {
      setActiveId(null);
    }
  }, [activeId, conversations]);

  const conversation =
    conversations.find((item) => item.id === activeId) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        label="Inbox"
        title="MENSAGENS WHATSAPP"
        subtitle="Conecte um numero por QR Code e atenda as conversas do WhatsApp aqui dentro."
      />

      <WhatsAppConnection numbers={whatsappNumbers} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-[60vh] p-3">
          <ConversationInbox
            conversations={conversations}
            activeId={activeId}
            loading={loadingConversations}
            onSelect={setActiveId}
          />
        </Card>
        <Card className="h-[60vh] p-4">
          <MessagePanel
            conversation={conversation}
            messages={messages}
            loading={loadingMessages}
          />
        </Card>
      </div>
    </div>
  );
}
