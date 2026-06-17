import Link from "next/link";
import { parseISO } from "date-fns";
import { ListChecks, CalendarDays, KanbanSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TodayAgenda } from "@/components/painel/TodayAgenda";
import { TaskSummary } from "@/components/painel/TaskSummary";
import { MyTasks } from "@/components/painel/MyTasks";
import { MyScore } from "@/components/painel/MyScore";
import { MyProjects } from "@/components/painel/MyProjects";
import { CalendarMonth } from "@/components/calendario/CalendarMonth";
import { ROUTES } from "@/lib/routes";
import { APP_TODAY } from "@/lib/constants";
import {
  currentProfile,
  calendarEvents,
  getTasksByAssignee,
  boardCards,
  tasks,
} from "@/lib/mock-data";

export default function MeuPainelPage() {
  const myTasks = getTasksByAssignee(currentProfile.id);
  const todayEvents = calendarEvents.filter(
    (e) => e.date === APP_TODAY && e.ownerId === currentProfile.id
  );
  const myCards = boardCards.filter((c) => c.assigneeId === currentProfile.id);
  const assignedToMe = tasks.filter(
    (t) => t.assigneeId === currentProfile.id && !t.done
  );

  const stats = [
    { label: "A fazer hoje", value: myTasks.filter((t) => t.dueDate === APP_TODAY && !t.done).length },
    { label: "Esta semana", value: myTasks.filter((t) => !t.done).length, tone: "neon" as const },
    { label: "Atrasadas", value: myTasks.filter((t) => t.dueDate < APP_TODAY && !t.done).length, tone: "alert" as const },
    { label: "Entregas no mês", value: myTasks.filter((t) => t.done).length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        label={`Olá, ${currentProfile.name}`}
        title="MEU PAINEL"
        subtitle="Suas tarefas, seus prazos, seu ritmo."
        actions={
          <>
            <Button variant="primary" asChild>
              <Link href={ROUTES.meuPainel}>
                <ListChecks className="h-4 w-4" /> Minhas tarefas
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={ROUTES.calendario}>
                <CalendarDays className="h-4 w-4" /> Calendário
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={ROUTES.boards}>
                <KanbanSquare className="h-4 w-4" /> Boards
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.dltinho}>
                <Sparkles className="h-4 w-4" /> Perguntar ao DLtinho
              </Link>
            </Button>
          </>
        }
      />

      <TodayAgenda events={todayEvents} />
      <TaskSummary stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Junho de 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarMonth month={parseISO(APP_TODAY)} events={calendarEvents} />
            </CardContent>
          </Card>

          <MyTasks initialTasks={myTasks} />

          <Card>
            <CardHeader>
              <CardTitle>Tarefas atribuídas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignedToMe.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3"
                >
                  <span className="text-sm text-content">{t.title}</span>
                  <span className="text-[11px] text-content-muted">
                    vence {t.dueDate.slice(8, 10)}/{t.dueDate.slice(5, 7)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meus cards nos quadros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myCards.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3"
                >
                  <span className="text-sm text-content">{c.title}</span>
                  <span className="text-[11px] text-content-muted">
                    {c.checklistDone}/{c.checklistTotal}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <MyScore />
          <MyProjects />
        </div>
      </div>
    </div>
  );
}
