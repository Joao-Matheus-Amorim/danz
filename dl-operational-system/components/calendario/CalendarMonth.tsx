"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  parseISO,
} from "date-fns";
import type { CalendarEvent } from "@/lib/types";
import { WEEKDAYS_SHORT } from "@/lib/constants";
import { EVENT_TYPE_COLOR } from "@/lib/constants";
import { APP_TODAY } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Grade mensal reutilizável (usada em /calendario e /meu-painel).
 * Renderiza eventos como pontos coloridos por tipo. `onSelectDay` é opcional.
 */
export function CalendarMonth({
  month,
  events,
  onSelectDay,
  compact = false,
}: {
  month: Date;
  events: CalendarEvent[];
  onSelectDay?: (date: Date) => void;
  compact?: boolean;
}) {
  const today = parseISO(APP_TODAY);
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsByDay = (day: Date) =>
    events.filter((e) => isSameDay(parseISO(e.date), day));

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 pb-2">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium tracking-label text-content-muted">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const dayEvents = eventsByDay(day);
          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => onSelectDay?.(day)}
              className={cn(
                "flex flex-col rounded-lg border p-1.5 text-left transition-colors",
                compact ? "min-h-[44px]" : "min-h-[88px]",
                inMonth
                  ? "border-white/[0.06] bg-surface-muted"
                  : "border-transparent bg-transparent opacity-40",
                isToday && "dl-neon-active",
                onSelectDay && "hover:border-neon-border"
              )}
            >
              <span
                className={cn(
                  "text-xs",
                  isToday ? "font-semibold text-neon" : "text-content-muted"
                )}
              >
                {format(day, "d")}
              </span>
              {!compact && (
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] text-content"
                      style={{ backgroundColor: `${EVENT_TYPE_COLOR[ev.type]}22` }}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: EVENT_TYPE_COLOR[ev.type] }}
                      />
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-content-muted">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
              )}
              {compact && dayEvents.length > 0 && (
                <div className="mt-auto flex gap-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: EVENT_TYPE_COLOR[ev.type] }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
