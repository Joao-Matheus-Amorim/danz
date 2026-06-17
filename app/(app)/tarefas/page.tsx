"use client";

import * as React from "react";
import {
  Check,
  Edit3,
  ListTodo,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { listClients } from "@/lib/repositories/clients";
import {
  createTask,
  deleteTask,
  listWorkspaceTasks,
  setTaskDone,
  updateTask,
} from "@/lib/repositories/tasks";
import type { Client, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluida",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Media",
  alta: "Alta",
};

function priorityClass(priority: TaskPriority) {
  if (priority === "alta") return "border-alert/40 bg-alert/[0.10] text-alert";
  if (priority === "media") return "border-event-blue/40 bg-event-blue/[0.10] text-event-blue";
  return "border-white/10 bg-white/[0.04] text-content-muted";
}

function statusClass(status: TaskStatus) {
  if (status === "done") return "border-neon-border bg-neon/[0.10] text-neon-text";
  if (status === "doing") return "border-event-purple/40 bg-event-purple/[0.10] text-event-purple";
  return "border-white/10 bg-white/[0.04] text-content-muted";
}

function formatDate(date?: string) {
  if (!date) return "Sem prazo";
  return `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}`;
}

function TaskModal({
  open,
  onOpenChange,
  task,
  clients,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  clients: Client[];
  onSubmit: (input: {
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    clientId?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [priority, setPriority] = React.useState<TaskPriority>("media");
  const [dueDate, setDueDate] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setStatus(task?.status ?? "todo");
    setPriority(task?.priority ?? "media");
    setDueDate(task?.dueDate ?? "");
    setClientId(task?.clientId ?? "");
  }, [open, task]);

  async function submit() {
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        status,
        priority,
        dueDate: dueDate || undefined,
        clientId: clientId || undefined,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-content">
            {task ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            Organize a demanda do workspace com prazo, cliente e prioridade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="task-title">Titulo</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Revisar campanha PLAST RIO"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
              >
                <option value="todo">A fazer</option>
                <option value="doing">Em andamento</option>
                <option value="done">Concluida</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-priority">Prioridade</Label>
              <Select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="task-date">Prazo</Label>
              <Input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-client">Cliente</Label>
              <Select
                id="task-client"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                <option value="">Sem cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => void submit()} disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TarefasPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus | "todos">("todos");
  const [priority, setPriority] = React.useState<TaskPriority | "todas">("todas");
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [pendingTaskId, setPendingTaskId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    Promise.all([listWorkspaceTasks(), listClients()])
      .then(([taskItems, clientItems]) => {
        if (!mounted) return;
        setTasks(taskItems);
        setClients(clientItems);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar tarefas.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const clientById = React.useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients]
  );

  const filtered = tasks.filter((task) => {
    const clientName = task.clientId ? clientById.get(task.clientId)?.name ?? "" : "";
    const normalizedQuery = query.toLowerCase();
    const matchesQuery =
      task.title.toLowerCase().includes(normalizedQuery) ||
      clientName.toLowerCase().includes(normalizedQuery);
    const matchesStatus = status === "todos" || task.status === status;
    const matchesPriority = priority === "todas" || task.priority === priority;
    return matchesQuery && matchesStatus && matchesPriority;
  });

  const openTasks = tasks.filter((task) => !task.done).length;
  const doingTasks = tasks.filter((task) => task.status === "doing").length;
  const doneTasks = tasks.filter((task) => task.done).length;

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSubmit(input: {
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    clientId?: string;
  }) {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, input);
        setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
        toast("Tarefa atualizada.");
        return;
      }

      const created = await createTask({
        title: input.title,
        dueDate: input.dueDate,
        priority: input.priority,
        status: input.status,
        clientId: input.clientId,
      });
      setTasks((prev) => [created, ...prev]);
      toast("Tarefa criada.");
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel salvar a tarefa.");
      throw error;
    }
  }

  async function handleToggleDone(task: Task) {
    if (pendingTaskId) return;
    const previous = tasks;
    const nextDone = !task.done;
    setPendingTaskId(task.id);
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? { ...item, done: nextDone, status: nextDone ? "done" : "todo" }
          : item
      )
    );

    try {
      const updated = await setTaskDone(task.id, nextDone);
      setTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      console.error(error);
      setTasks(previous);
      toast("Nao foi possivel atualizar a tarefa.");
    } finally {
      setPendingTaskId(null);
    }
  }

  async function handleDelete(task: Task) {
    if (pendingTaskId) return;
    const previous = tasks;
    setPendingTaskId(task.id);
    setTasks((prev) => prev.filter((item) => item.id !== task.id));

    try {
      await deleteTask(task.id);
      toast("Tarefa excluida.");
    } catch (error) {
      console.error(error);
      setTasks(previous);
      toast("Nao foi possivel excluir a tarefa.");
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Operacao"
        title="TAREFAS"
        subtitle="Fila do workspace com criacao, edicao, conclusao e exclusao."
        actions={
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Nova tarefa
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Abertas", value: openTasks },
          { label: "Em andamento", value: doingTasks },
          { label: "Concluidas", value: doneTasks },
        ].map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="dl-label">{metric.label}</p>
              <ListTodo className="h-4 w-4 text-content-muted" />
            </div>
            <p className="mt-2 text-2xl font-bold text-content">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar tarefa ou cliente..."
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus | "todos")}
          className="lg:w-48"
        >
          <option value="todos">Todos os status</option>
          <option value="todo">A fazer</option>
          <option value="doing">Em andamento</option>
          <option value="done">Concluidas</option>
        </Select>
        <Select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority | "todas")}
          className="lg:w-44"
        >
          <option value="todas">Todas prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baixa">Baixa</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="py-10 text-center text-sm text-content-muted">
              Carregando tarefas...
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-content-muted">
              Nenhuma tarefa encontrada.
            </p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filtered.map((task) => {
                const clientName = task.clientId
                  ? clientById.get(task.clientId)?.name ?? "Cliente removido"
                  : "Sem cliente";

                return (
                  <div
                    key={task.id}
                    className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_160px_130px_128px] lg:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <button
                        type="button"
                        onClick={() => void handleToggleDone(task)}
                        disabled={pendingTaskId === task.id}
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors disabled:cursor-wait disabled:opacity-60",
                          task.done
                            ? "border-neon bg-neon text-content"
                            : "border-white/15 hover:border-neon-border"
                        )}
                        aria-label={task.done ? "Reabrir tarefa" : "Concluir tarefa"}
                      >
                        {task.done && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "break-words text-sm font-medium",
                            task.done ? "text-content-muted line-through" : "text-content"
                          )}
                        >
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-content-muted">{clientName}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusClass(task.status)}>
                        {STATUS_LABELS[task.status]}
                      </Badge>
                      <Badge className={priorityClass(task.priority)}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                    </div>

                    <p className="text-xs text-content-muted lg:text-right">
                      {formatDate(task.dueDate)}
                    </p>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => openEditModal(task)}
                        aria-label="Editar tarefa"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() => void handleDelete(task)}
                        disabled={pendingTaskId === task.id}
                        aria-label="Excluir tarefa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        task={editingTask}
        clients={clients}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
