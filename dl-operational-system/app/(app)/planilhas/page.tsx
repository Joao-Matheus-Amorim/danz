import { PageHeader } from "@/components/layout/PageHeader";
import { SheetEditorShell } from "@/components/arquivos/SheetEditorShell";
import { sheets } from "@/lib/mock-data";

export default function PlanilhasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        label="Google Sheets"
        title="PLANILHAS"
        subtitle="Todas as suas planilhas do Google, abertas e editáveis aqui dentro com todas as funções do Sheets."
      />
      <SheetEditorShell sheets={sheets} />
    </div>
  );
}
