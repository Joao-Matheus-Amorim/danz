"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { WhatsAppConnection } from "@/components/inbox/WhatsAppConnection";
import { ConversationInbox } from "@/components/inbox/ConversationInbox";
import { MessagePanel } from "@/components/inbox/MessagePanel";
import {
  whatsappNumbers,
  whatsappConversations,
  getMessagesByConversation,
} from "@/lib/mock-data";

export default function InboxPage() {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const conversation =
    whatsappConversations.find((c) => c.id === activeId) ?? null;
  const messages = activeId ? getMessagesByConversation(activeId) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        label="Inbox"
        title="MENSAGENS WHATSAPP"
        subtitle="Conecte um número por QR Code e atenda as conversas do WhatsApp aqui dentro."
      />

      <WhatsAppConnection numbers={whatsappNumbers} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-[60vh] p-3">
          <ConversationInbox
            conversations={whatsappConversations}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </Card>
        <Card className="h-[60vh] p-4">
          <MessagePanel conversation={conversation} messages={messages} />
        </Card>
      </div>
    </div>
  );
}
