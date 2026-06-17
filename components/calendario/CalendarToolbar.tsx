"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils";

export type CalendarView = "mes" | "semana" | "agenda" | "planejamento";

const VIEWS: { key: CalendarView | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "mes", label: "Mês" },
  { key: "semana", label: "Semana" },
  { key: "agenda", label: "Agenda" },
  { key: "planejamento", label: "Planejamento" },
];

/** Barra de navegação + filtros de visão do calendário. */
export function CalendarToolbar({
  month,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: {
  month: Date;
  view: CalendarView | "todos";
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (v: CalendarView | "todos") => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onToday}>
          Hoje
        </Button>
        <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Mês anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext} aria-label="Próximo mês">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="ml-1 text-sm font-medium capitalize text-content">
          {formatMonthYear(month)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {VIEWS.map((v) => (
          <button
            type="button"
            key={v.key}
            onClick={() => onViewChange(v.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              view === v.key
                ? "bg-neon/[0.10] text-neon shadow-neon"
                : "text-content-muted hover:text-content"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
