"use client";

import { Folder, FileText, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { DriveFile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Card de pasta/arquivo no explorador de Drive. */
export function FileCard({ file }: { file: DriveFile }) {
  const { futureFeature } = useToast();
  const Icon = file.kind === "folder" ? Folder : FileText;

  return (
    <Card
      className="group flex cursor-pointer items-center gap-3 p-4 transition-colors hover:border-neon-border"
      onClick={() => futureFeature(`Abrir "${file.name}"`)}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-border bg-neon/[0.08] text-neon">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-content">{file.name}</p>
        <p className="text-[11px] text-content-muted">
          {file.fileType} · {file.owner} · {formatDate(file.modifiedAt, "dd/MM/yyyy")}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          futureFeature("Menu do arquivo");
        }}
        className="rounded-lg p-1 text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content"
        aria-label="Opções"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </Card>
  );
}
