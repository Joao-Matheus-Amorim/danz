"use client";

import { Link2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BriefingChecklist } from "@/components/briefings/BriefingChecklist";
import { useToast } from "@/components/ui/toast";
import type { BriefingItem } from "@/lib/types";

/** Abas de Briefings: modelos & mensal | formulários do cliente. */
export function BriefingTabs({
  monthLabel,
  items,
  loading = false,
  onToggleItem,
}: {
  monthLabel: string;
  items: BriefingItem[];
  loading?: boolean;
  onToggleItem: (item: BriefingItem) => Promise<void> | void;
}) {
  const { futureFeature } = useToast();

  return (
    <Tabs defaultValue="mensal">
      <TabsList>
        <TabsTrigger value="mensal">Modelos &amp; mensal</TabsTrigger>
        <TabsTrigger value="formularios">Formulários do cliente</TabsTrigger>
      </TabsList>

      <TabsContent value="mensal">
        <BriefingChecklist
          monthLabel={monthLabel}
          items={items}
          loading={loading}
          onToggleItem={onToggleItem}
        />
      </TabsContent>

      <TabsContent value="formularios">
        <EmptyState
          icon={Link2}
          title="Formulários públicos"
          description="Gere links de formulários para o cliente preencher o briefing. Geração e captura de respostas chegam na Fase 5 (integração)."
        >
          <Button
            variant="outline"
            onClick={() => futureFeature("Formulário público de briefing")}
          >
            <Link2 className="h-4 w-4" /> Gerar link do formulário
          </Button>
        </EmptyState>
      </TabsContent>
    </Tabs>
  );
}
