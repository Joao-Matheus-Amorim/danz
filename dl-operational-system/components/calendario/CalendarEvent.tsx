import type { CalendarEvent as CalendarEventType } from "@/lib/types";
import { EVENT_TYPE_COLOR, EVENT_TYPE_LABEL } from "@/lib/constants";
import { getProfileById } from "@/lib/mock-data";

/** Item de evento na visão de agenda/lista. */
export function CalendarEvent({ event }: { event: CalendarEventType }) {
  const owner = getProfileById(event.ownerId);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: EVENT_TYPE_COLOR[event.type] }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-content">{event.title}</p>
        <p className="text-[11px] text-content-muted">
          {EVENT_TYPE_LABEL[event.type]}
          {event.time ? ` · ${event.time}` : ""}
          {owner ? ` · ${owner.name}` : ""}
        </p>
      </div>
    </div>
  );
}
