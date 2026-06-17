import { PageHeader } from "@/components/layout/PageHeader";
import { BriefingTabs } from "@/components/briefings/BriefingTabs";
import { briefingItems } from "@/lib/mock-data";

export default function BriefingsPage() {
  const junho = briefingItems.filter((b) => b.monthRef === "2026-06");

  return (
    <div className="space-y-6">
      <PageHeader
        label="Padrões"
        title="BRIEFINGS"
        subtitle="Modelos, controle mensal e formulários públicos que o cliente preenche."
      />
      <BriefingTabs monthLabel="Junho" items={junho} />
    </div>
  );
}
