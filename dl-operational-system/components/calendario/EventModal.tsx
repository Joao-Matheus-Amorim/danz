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
import { localId } from "@/lib/utils";

const TYPES: CalendarEventType[] = ["reuniao", "tarefa", "conteudo", "campanha"];

/**
 * Modal de novo evento. No MVP salva em estado local (onCreate) —
 * sincronização com Google Calendar é planejada para a Fase 5.
 */
export function EventModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (event: CalendarEvent) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<CalendarEventType>("reuniao");
  const [date, setDate] = React.useState(APP_TODAY);
  const [time, setTime] = React.useState("09:00");

  const submit = () => {
    if (!title.trim()) return;
    onCreate({
      id: localId("event"),
      title: title.trim(),
      type,
      date,
      time,
    });
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-content">
            Novo evento
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            Evento local (mock). Sincronização com Google Calendar na Fase 5.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="e-title">Título</Label>
            <Input
              id="e-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Reunião de alinhamento"
            />
          </div>
          <div>
            <Label htmlFor="e-type">Tipo</Label>
            <Select
              id="e-type"
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEventType)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_LABEL[t]}
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
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="e-time">Hora</Label>
              <Input
                id="e-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit}>
            Criar evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
