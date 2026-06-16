"use client";

import { Lightbulb } from "lucide-react";
import { promptSuggestions } from "@/lib/mock-data";

/** Sugestões de prompt clicáveis. */
export function PromptSuggestions({
  onPick,
}: {
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {promptSuggestions.map((s) => (
        <button
          type="button"
          key={s}
          onClick={() => onPick(s)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-content-muted transition-colors hover:border-neon-border hover:text-content"
        >
          <Lightbulb className="h-3.5 w-3.5 text-neon" />
          {s}
        </button>
      ))}
    </div>
  );
}
