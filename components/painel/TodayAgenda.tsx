import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CalendarEvent } from "@/lib/types";
import { EVENT_TYPE_COLOR, EVENT_TYPE_LABEL } from "@/lib/constants";

/** Card "Agenda de hoje" do meu painel. */
export function TodayAgenda({ events }: { events: CalendarEvent[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-neon" />
          <p className="dl-label">Agenda de hoje</p>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-content-muted">
            Nada agendado para hoje. Aproveite pra adiantar o que vence essa semana.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLOR[ev.type] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-content">{ev.title}</p>
                  <p className="text-[11px] text-content-muted">
                    {EVENT_TYPE_LABEL[ev.type]}
                    {ev.time ? ` · ${ev.time}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
