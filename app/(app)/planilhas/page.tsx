"use client";

import * as React from "react";
import { SheetEditorShell } from "@/components/arquivos/SheetEditorShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/toast";
import { listSheets } from "@/lib/repositories/files";
import type { SheetItem } from "@/lib/types";

export default function PlanilhasPage() {
  const { toast } = useToast();
  const [sheets, setSheets] = React.useState<SheetItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    listSheets()
      .then((items) => {
        if (mounted) setSheets(items);
      })
      .catch((error) => {
        console.error(error);
        toast("Nao foi possivel carregar as planilhas.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <div className="space-y-6">
      <PageHeader
        label="Google Sheets"
        title="PLANILHAS"
        subtitle="Todas as suas planilhas do Google, abertas e editaveis aqui dentro com todas as funcoes do Sheets."
      />
      <SheetEditorShell sheets={sheets} loading={loading} />
    </div>
  );
}
