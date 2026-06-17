"use client";

import * as React from "react";
import { DriveExplorer } from "@/components/arquivos/DriveExplorer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/toast";
import { listDriveFiles } from "@/lib/repositories/files";
import type { DriveFile } from "@/lib/types";

export default function DrivePage() {
  const { toast } = useToast();
  const [files, setFiles] = React.useState<DriveFile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    listDriveFiles()
      .then((items) => {
        if (mounted) setFiles(items);
      })
      .catch((error) => {
        console.error(error);
        toast("Nao foi possivel carregar os arquivos.");
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
        label="Google Drive"
        title="ARQUIVOS"
        subtitle="Navegue pelas pastas e arquivos do Drive direto do DL Operational System."
      />
      <DriveExplorer files={files} loading={loading} />
    </div>
  );
}
