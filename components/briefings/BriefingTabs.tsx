"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BriefingChecklist } from "@/components/briefings/BriefingChecklist";
import { BriefingForms } from "@/components/briefings/BriefingForms";
import type { BriefingItem } from "@/lib/types";

/** Abas de Briefings: modelos & mensal | formulários do cliente. */
export function BriefingTabs({
  monthLabel,
  items,
  loading = false,
  onToggleItem,
  canEdit = true,
}: {
  monthLabel: string;
  items: BriefingItem[];
  loading?: boolean;
  onToggleItem: (item: BriefingItem) => Promise<void> | void;
  canEdit?: boolean;
}) {
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
          canEdit={canEdit}
        />
      </TabsContent>

      <TabsContent value="formularios">
        <BriefingForms items={items} loading={loading} />
      </TabsContent>
    </Tabs>
  );
}
