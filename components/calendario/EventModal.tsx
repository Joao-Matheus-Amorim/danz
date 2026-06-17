"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";
import { EVENT_TYPE_LABEL } from "@/lib/constants";
import { APP_TODAY } from "@/lib/constants";
import type { CalendarEventInput } from "@/lib/repositories/calendar";

const TYPES: CalendarEventType[] = ["reuniao", "tarefa", "conteudo", "campanha"];

export function EventModal({
  open,
  onOpenChange,
  event,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  onSubmit: (event: CalendarEventInput) => Promise<void> | void;
}) {
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<CalendarEventType>("reuniao");
  const [date, setDate] = React.useState(APP_TODAY);
  const [time, setTime] = React.useState("09:00");
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? "");
    setType(event?.type ?? "reuniao");
    setDate(event?.date ?? APP_TODAY);
    // For existing events keep the time blank when there is none (all-day),
    // so editing other fields does not silently add a time. New events default
    // to 09:00 as a convenience.
    setTime(event ? event.time ?? "" : "09:00");
  }, [open, event]);

  const isEditing = Boolean(event);

  async function submit() {
    if (!title.trim() || creating) return;

    setCreating(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        date,
        time,
      });
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-content">
            {isEditing ? "Editar evento" : "Novo evento"}
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            {isEditing
              ? "Atualize as informações deste compromisso."
              : "Crie um compromisso para o calendário operacional."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="e-title">Título</Label>
            <Input
              id="e-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Reunião de alinhamento"
              disabled={creating}
            />
          </div>
          <div>
            <Label htmlFor="e-type">Tipo</Label>
            <Select
              id="e-type"
              value={type}
              onChange={(event) => setType(event.target.value as CalendarEventType)}
              disabled={creating}
            >
              {TYPES.map((item) => (
                <option key={item} value={item}>
                  {EVENT_TYPE_LABEL[item]}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="e-date">Data</Label>
              <Input
                id="e-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={creating}
              />
            </div>
            <div>
              <Label htmlFor="e-time">Hora</Label>
              <Input
                id="e-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                disabled={creating}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void submit()}
            disabled={creating}
          >
            {creating
              ? "Salvando..."
              : isEditing
                ? "Salvar evento"
                : "Criar evento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
