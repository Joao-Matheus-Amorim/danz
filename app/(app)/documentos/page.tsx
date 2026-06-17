import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentEditorShell } from "@/components/arquivos/DocumentEditorShell";
import { documents } from "@/lib/mock-data";

export default function DocumentosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        label="Google Docs"
        title="DOCUMENTOS"
        subtitle="Todos os seus documentos do Google, abertos e editáveis aqui dentro com todas as funções do Docs."
      />
      <DocumentEditorShell documents={documents} />
    </div>
  );
}
