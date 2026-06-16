"use client";

import * as React from "react";
import { Plus, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Task } from "@/lib/types";
import { localId, cn } from "@/lib/utils";
import { currentProfile } from "@/lib/mock-data";

/**
 * Bloco "Minhas tarefas" com abas Hoje/Semana/Mês e campo para adicionar.
 * Estado local (mock) — persistência real chega na Fase 3.
 */
export function MyTasks({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = React.useState("");

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: localId("task"),
        title,
        status: "todo",
        priority: "media",
        assigneeId: currentProfile.id,
        dueDate: new Date().toISOString().slice(0, 10),
        done: false,
      },
      ...prev,
    ]);
    setNewTitle("");
  };

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const renderList = (list: Task[]) => (
    <div className="space-y-2">
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-content-muted">
          Nenhuma tarefa neste período.
        </p>
      ) : (
        list.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => toggle(t.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3 text-left transition-colors hover:border-neon-border"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                t.done
                  ? "border-neon bg-neon text-background"
                  : "border-white/15"
              )}
            >
              {t.done && <Check className="h-3 w-3" />}
            </span>
            <span
              className={cn(
                "text-sm",
                t.done ? "text-content-muted line-through" : "text-content"
              )}
            >
              {t.title}
            </span>
          </button>
        ))
      )}
    </div>
  );

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Adicionar nova tarefa..."
          />
          <Button variant="primary" size="icon" onClick={addTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

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
