"use client";

import * as React from "react";
import { DocumentEditorShell } from "@/components/arquivos/DocumentEditorShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/toast";
import { listDocuments } from "@/lib/repositories/files";
import type { DocumentItem } from "@/lib/types";

export default function DocumentosPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = React.useState<DocumentItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    listDocuments()
      .then((items) => {
        if (mounted) setDocuments(items);
      })
      .catch((error) => {
        console.error(error);
        toast("Nao foi possivel carregar os documentos.");
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
        label="Google Docs"
        title="DOCUMENTOS"
        subtitle="Todos os seus documentos do Google, abertos e editaveis aqui dentro com todas as funcoes do Docs."
      />
      <DocumentEditorShell documents={documents} loading={loading} />
    </div>
  );
}
