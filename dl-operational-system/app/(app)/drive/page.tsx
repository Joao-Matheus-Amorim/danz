import { PageHeader } from "@/components/layout/PageHeader";
import { DriveExplorer } from "@/components/arquivos/DriveExplorer";
import { driveFolders } from "@/lib/mock-data";

export default function DrivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        label="Google Drive"
        title="ARQUIVOS"
        subtitle="Navegue pelas pastas e arquivos do Drive direto do DL Operational System."
      />
      <DriveExplorer files={driveFolders} />
    </div>
  );
}
