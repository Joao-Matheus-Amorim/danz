"use client";

import * as React from "react";
import { Wifi } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConversationList } from "@/components/dltinho/ConversationList";
import { ChatWorkspace } from "@/components/dltinho/ChatWorkspace";
import { BuilderPanel } from "@/components/dltinho/BuilderPanel";
import { BRAND } from "@/lib/constants";
import { chatConversations, chatMessages } from "@/lib/mock-data";

export default function DLtinhoPage() {
  // Estado local de conversas (mock). Persistência real chega na Fase 4.
  const [conversations] = React.useState(chatConversations);
  const [activeId, setActiveId] = React.useState<string | null>(
    chatConversations[0]?.id ?? null
  );

  const activeMessages = React.useMemo(
    () => chatMessages.filter((m) => m.conversationId === activeId),
    [activeId]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        label="Inteligência Artificial"
        title={BRAND.ai.toUpperCase()}
        subtitle="O cérebro da DL — conversa, executa ações e recebe seus pedidos de construção."
        actions={
          <Badge className="text-neon border-neon-border bg-neon/[0.08]">
            <Wifi className="h-3 w-3" /> Conectado
          </Badge>
        }
      />

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="builder">Construtor</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <Card className="h-[60vh] p-3">
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={setActiveId}
                onNew={() => setActiveId(null)}
              />
            </Card>
            <Card className="h-[60vh] p-4">
              <ChatWorkspace
                conversationId={activeId}
                initialMessages={activeMessages}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder">
          <BuilderPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
