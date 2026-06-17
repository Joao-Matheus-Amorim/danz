/**
 * Constantes globais do DL Operational System.
 * Identidade, labels e mapeamentos de cor/estilo reutilizáveis.
 */

import type {
  CalendarEventType,
  ClientStatus,
  ClientTag,
  BoardCardLabel,
  IntegrationStatus,
} from "@/lib/types";

export const BRAND = {
  shortName: "DL",
  fullName: "DL Soluções Digitais",
  legalName: "Dental Lead",
  system: "DL Operational System",
  ai: "DLtinho",
  role: "Tráfego",
} as const;

/** Data "âncora" do MVP — mantém o calendário/agenda coerentes nos mocks. */
export const APP_TODAY = "2026-06-16";

/** Rótulos legíveis para status de cliente. */
export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
};

/** Rótulos legíveis para tags de saúde do cliente. */
export const CLIENT_TAG_LABEL: Record<ClientTag, string> = {
  "em-dia": "Em dia",
  atencao: "Atenção",
  critico: "Crítico",
};

/** Classes de cor para tags de cliente (texto/borda/fundo). */
export const CLIENT_TAG_STYLE: Record<ClientTag, string> = {
  "em-dia": "text-neon border-neon-border bg-neon/[0.08]",
  atencao: "text-warning border-warning/30 bg-warning/[0.08]",
  critico: "text-alert border-alert/30 bg-alert/[0.08]",
};

/** Cor base por tipo de evento do calendário. */
export const EVENT_TYPE_COLOR: Record<CalendarEventType, string> = {
  reuniao: "#2F8CFF",
  tarefa: "#A855F7",
  conteudo: "#B6FF00",
  campanha: "#A855F7",
};

export const EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  reuniao: "Reunião",
  tarefa: "Tarefa",
  conteudo: "Conteúdo",
  campanha: "Campanha",
};

/** Estilo das labels de card de board. */
export const BOARD_LABEL_STYLE: Record<BoardCardLabel, string> = {
  design: "bg-event-purple/80",
  trafego: "bg-neon/80",
  conteudo: "bg-event-blue/80",
  urgente: "bg-alert/80",
  revisao: "bg-warning/80",
};

export const BOARD_LABEL_TEXT: Record<BoardCardLabel, string> = {
  design: "Design",
  trafego: "Tráfego",
  conteudo: "Conteúdo",
  urgente: "Urgente",
  revisao: "Revisão",
};

/** Status de integração — rótulo e estilo. */
export const INTEGRATION_STATUS_LABEL: Record<IntegrationStatus, string> = {
  "nao-conectado": "Não conectado",
  mockado: "Mockado",
  "em-planejamento": "Em planejamento",
};

export const INTEGRATION_STATUS_STYLE: Record<IntegrationStatus, string> = {
  "nao-conectado": "text-content-muted border-white/10 bg-white/[0.03]",
  mockado: "text-warning border-warning/30 bg-warning/[0.08]",
  "em-planejamento": "text-event-blue border-event-blue/30 bg-event-blue/[0.08]",
};

/** Nomes dos dias da semana abreviados (pt-BR), começando no domingo. */
export const WEEKDAYS_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
