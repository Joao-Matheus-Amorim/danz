"use client";

import * as React from "react";
import { Plus, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MyTasks({
  tasks,
  loading = false,
  onCreateTask,
  onToggleTask,
  canEdit = true,
}: {
  tasks: Task[];
  loading?: boolean;
  onCreateTask: (title: string) => Promise<void> | void;
  onToggleTask: (task: Task) => Promise<void> | void;
  canEdit?: boolean;
}) {
  const [newTitle, setNewTitle] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [pendingTaskId, setPendingTaskId] = React.useState<string | null>(null);

  async function addTask() {
    const title = newTitle.trim();
    if (!title || creating) return;

    setCreating(true);
    try {
      await onCreateTask(title);
      setNewTitle("");
    } finally {
      setCreating(false);
    }
  }

  async function toggle(task: Task) {
    if (pendingTaskId || !canEdit) return;

    setPendingTaskId(task.id);
    try {
      await onToggleTask(task);
    } finally {
      setPendingTaskId(null);
    }
  }

  const renderList = (list: Task[]) => (
    <div className="space-y-2">
      {loading ? (
        <p className="py-6 text-center text-sm text-content-muted">
          Carregando tarefas...
        </p>
      ) : list.length === 0 ? (
        <p className="py-6 text-center text-sm text-content-muted">
          Nenhuma tarefa neste período.
        </p>
      ) : (
        list.map((task) => (
          <button
            type="button"
            key={task.id}
            onClick={() => void toggle(task)}
            disabled={pendingTaskId === task.id || !canEdit}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3 text-left transition-colors hover:border-neon-border disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                task.done
                  ? "border-neon bg-neon text-content"
                  : "border-white/15"
              )}
            >
              {task.done && <Check className="h-3 w-3" />}
            </span>
            <span
              className={cn(
                "text-sm",
                task.done ? "text-content-muted line-through" : "text-content"
              )}
            >
              {task.title}
            </span>
          </button>
        ))
      )}
    </div>
  );

  return (
    <Card>
      <CardContent className="p-5">
        {canEdit && (
          <div className="mb-4 flex items-center gap-2">
            <Input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void addTask();
              }}
              placeholder="Adicionar nova tarefa..."
              disabled={creating}
            />
            <Button
              variant="primary"
              size="icon"
              onClick={() => void addTask()}
              disabled={creating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Tabs defaultValue="hoje">
          <TabsList>
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>
          </TabsList>
          <TabsContent value="hoje">{renderList(tasks.slice(0, 3))}</TabsContent>
          <TabsContent value="semana">{renderList(tasks)}</TabsContent>
          <TabsContent value="mes">{renderList(tasks)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
