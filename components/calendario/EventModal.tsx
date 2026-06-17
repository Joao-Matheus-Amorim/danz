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
import type { CalendarEventType } from "@/lib/types";
import { EVENT_TYPE_LABEL } from "@/lib/constants";
import { APP_TODAY } from "@/lib/constants";
import type { CalendarEventInput } from "@/lib/repositories/calendar";

const TYPES: CalendarEventType[] = ["reuniao", "tarefa", "conteudo", "campanha"];

export function EventModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (event: CalendarEventInput) => Promise<void> | void;
}) {
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<CalendarEventType>("reuniao");
  const [date, setDate] = React.useState(APP_TODAY);
  const [time, setTime] = React.useState("09:00");
  const [creating, setCreating] = React.useState(false);

  async function submit() {
    if (!title.trim() || creating) return;

    setCreating(true);
    try {
      await onCreate({
        title: title.trim(),
        type,
        date,
        time,
      });
      setTitle("");
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
            Novo evento
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            Crie um compromisso para o calendário operacional.
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
            Criar evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
