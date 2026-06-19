"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BriefingTabs } from "@/components/briefings/BriefingTabs";
import { useToast } from "@/components/ui/toast";
import { useRole } from "@/lib/role/RoleContext";
import {
  ensureBriefingForMonth,
  listBriefingItems,
  setBriefingItemDone,
} from "@/lib/repositories/briefings";
import type { BriefingItem } from "@/lib/types";
import { currentMonthRef, monthRefLabel } from "@/lib/utils";

const CURRENT_MONTH_REF = currentMonthRef();

export default function BriefingsPage() {
  const { toast } = useToast();
  const { canEdit } = useRole();
  const [items, setItems] = React.useState<BriefingItem[]>([]);
  const [loadingItems, setLoadingItems] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    // So owner/admin/gestor cria o briefing do mes (a RLS de insert exige
    // is_workspace_editor) -- operador so le o que ja existir.
    const ensure = canEdit
      ? ensureBriefingForMonth(CURRENT_MONTH_REF)
      : Promise.resolve();

    ensure
      .then(() => listBriefingItems(CURRENT_MONTH_REF))
      .then((briefingItems) => {
        if (mounted) setItems(briefingItems);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Não foi possível carregar os briefings.");
      })
      .finally(() => {
        if (mounted) setLoadingItems(false);
      });

    return () => {
      mounted = false;
    };
  }, [canEdit, toast]);

  async function handleToggleItem(item: BriefingItem) {
    const previous = items;
    const nextDone = !item.done;

    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, done: nextDone } : currentItem
      )
    );

    try {
      const updated = await setBriefingItemDone(item.id, nextDone, item.monthRef);
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === updated.id ? updated : currentItem
        )
      );
    } catch (error) {
      console.error(error);
      setItems(previous);
      toast("Não foi possível atualizar o briefing.");
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Padrões"
        title="BRIEFINGS"
        subtitle="Modelos, controle mensal e formulários públicos que o cliente preenche."
      />
      <BriefingTabs
        monthLabel={monthRefLabel(CURRENT_MONTH_REF)}
        items={items}
        loading={loadingItems}
        onToggleItem={handleToggleItem}
        canEdit={canEdit}
      />
    </div>
  );
}
