/**
 * Tipos centrais do DL Operational System.
 *
 * Estes tipos descrevem o domínio da operação da DL (Dental Lead) e são a
 * fonte única de verdade para mock-data (Fase 1) e, futuramente, para o
 * schema do Supabase (Fase 2/3). Mantenha-os alinhados com database/schema.sql.
 */

/* ------------------------------------------------------------------ */
/* Núcleo: workspace, perfis e auditoria                              */
/* ------------------------------------------------------------------ */

export interface Workspace {
  id: string;
  name: string;
  /** Função/segmento exibido no rodapé da sidebar (ex.: "Tráfego"). */
  role: string;
}

export type ProfileRole = "owner" | "admin" | "gestor" | "operador";

export interface Profile {
  id: string;
  name: string;
  /** Iniciais para avatar quando não há foto. */
  initials: string;
  email: string;
  role: ProfileRole;
  /** Função operacional exibida na UI (ex.: "Tráfego"). */
  jobTitle: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string; // ISO 8601
}

/* ------------------------------------------------------------------ */
/* Clientes                                                           */
/* ------------------------------------------------------------------ */

export type ClientStatus = "ativo" | "pausado";

/** Saúde operacional do cliente. */
export type ClientTag = "em-dia" | "atencao" | "critico";

export type ClientPlan = "Essencial" | "Pro" | "Premium" | "Performance";

export interface Client {
  id: string;
  name: string;
  niche: string;
  plan: ClientPlan;
  status: ClientStatus;
  /** Data de início do contrato (ISO 8601). */
  startDate: string;
  tags: ClientTag[];
}

/* ------------------------------------------------------------------ */
/* Boards (estilo Trello)                                             */
/* ------------------------------------------------------------------ */

export interface Board {
  id: string;
  title: string;
  /** Classe(s) tailwind do gradiente do topo do card. */
  gradient: string;
  columnsCount: number;
  cardsCount: number;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export type BoardCardLabel = "design" | "trafego" | "conteudo" | "urgente" | "revisao";

export interface BoardCard {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description?: string;
  labels: BoardCardLabel[];
  /** Id do Profile responsável. */
  assigneeId?: string;
  checklistTotal: number;
  checklistDone: number;
  dueDate?: string; // ISO 8601
  order: number;
}

/* ------------------------------------------------------------------ */
/* Tarefas                                                            */
/* ------------------------------------------------------------------ */

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "baixa" | "media" | "alta";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** Id do Profile responsável. */
  assigneeId: string;
  /** Id do Client relacionado (opcional). */
  clientId?: string;
  dueDate: string; // ISO 8601
  done: boolean;
}

/* ------------------------------------------------------------------ */
/* Campanhas (Meta Ads)                                              */
/* ------------------------------------------------------------------ */

export type CampaignStatus = "ativa" | "pausada" | "encerrada";

export interface Campaign {
  id: string;
  clientId: string;
  clientName: string;
  status: CampaignStatus;
  /** Gasto no período (em centavos para evitar erro de ponto flutuante). */
  spendCents: number;
  conversations: number;
  results: number;
  /** Mensagens enviadas. */
  sent: number;
  /** Saldo restante de recarga (centavos). */
  balanceCents: number;
}

/* ------------------------------------------------------------------ */
/* Calendário                                                         */
/* ------------------------------------------------------------------ */

export type CalendarEventType = "reuniao" | "tarefa" | "conteudo" | "campanha";

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // ISO 8601 (data do evento)
  /** Hora no formato HH:mm (opcional para eventos de dia inteiro). */
  time?: string;
  /** Id do Profile responsável. */
  ownerId?: string;
  clientId?: string;
}

/* ------------------------------------------------------------------ */
/* Briefings                                                          */
/* ------------------------------------------------------------------ */

export interface BriefingItem {
  id: string;
  /** Mês de referência (ex.: "2026-06"). */
  monthRef: string;
  clientId: string;
  clientName: string;
  done: boolean;
}

/* ------------------------------------------------------------------ */
/* Arquivos: Drive, Documentos e Planilhas                           */
/* ------------------------------------------------------------------ */

export type DriveItemKind = "folder" | "file";
export type DriveSource = "meu-drive" | "compartilhados" | "recentes";

export interface DriveFile {
  id: string;
  name: string;
  kind: DriveItemKind;
  /** Tipo de arquivo (ex.: "Pasta", "PDF", "Imagem"). */
  fileType: string;
  owner: string;
  modifiedAt: string; // ISO 8601
  source: DriveSource;
  /** Marcado com estrela (seção "Com estrela"). */
  starred?: boolean;
  /** Movido para a lixeira (seção "Lixeira"). */
  trashed?: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  updatedAt: string; // ISO 8601
  owner: string;
}

export interface SheetItem {
  id: string;
  title: string;
  updatedAt: string; // ISO 8601
  owner: string;
}

/* ------------------------------------------------------------------ */
/* Inbox WhatsApp                                                     */
/* ------------------------------------------------------------------ */

export type WhatsAppConnectionStatus = "conectado" | "desconectado" | "conectando";

export interface WhatsAppNumber {
  id: string;
  label: string;
  phone: string;
  status: WhatsAppConnectionStatus;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  /** "in" = recebida do cliente, "out" = enviada pela DL. */
  direction: "in" | "out";
  body: string;
  timestamp: string; // ISO 8601
}

export interface WhatsAppConversation {
  id: string;
  contactName: string;
  lastMessage: string;
  lastMessageAt: string; // ISO 8601
  unread: number;
  numberId: string;
}

/* ------------------------------------------------------------------ */
/* DLtinho (IA interna)                                               */
/* ------------------------------------------------------------------ */

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string; // ISO 8601
}

export interface ChatConversation {
  id: string;
  title: string;
  updatedAt: string; // ISO 8601
}

/**
 * Ações que o DLtinho poderá executar no sistema (Fase 4).
 * No MVP a estrutura existe, mas nenhuma ação é executada de fato.
 */
export type DLtinhoActionType =
  | "criar-cliente"
  | "criar-tarefa"
  | "gerar-copy"
  | "resumir-cliente"
  | "consultar-metricas"
  | "gerar-relatorio";

export interface DLtinhoAction {
  type: DLtinhoActionType;
  label: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                          */
/* ------------------------------------------------------------------ */

export interface MetricPoint {
  label: string;
  value: number;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  /** Texto auxiliar (ex.: "de 70 no total"). */
  hint: string;
  /** Variação percentual (ex.: -100). Null quando não se aplica. */
  deltaPct: number | null;
  /** Série para o mini gráfico. */
  series: MetricPoint[];
}

/* ------------------------------------------------------------------ */
/* Integrações (Configurações)                                        */
/* ------------------------------------------------------------------ */

export type IntegrationStatus = "nao-conectado" | "mockado" | "em-planejamento";

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  /** Fase do roadmap em que será trabalhada. */
  phase: string;
}
