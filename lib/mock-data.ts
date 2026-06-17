/**
 * Dados mockados centralizados do DL Operational System (Fase 1).
 *
 * REGRA: nenhum array mockado deve viver dentro de páginas/componentes.
 * Tudo o que é "dado" mora aqui e é tipado por lib/types.ts. Na Fase 2/3
 * estas constantes serão substituídas por consultas ao Supabase, mantendo
 * exatamente os mesmos tipos de retorno.
 */

import type {
  ActivityLog,
  Board,
  BoardCard,
  BoardColumn,
  BriefingItem,
  Campaign,
  CalendarEvent,
  ChatConversation,
  ChatMessage,
  Client,
  DashboardMetric,
  DocumentItem,
  DriveFile,
  Integration,
  Profile,
  SheetItem,
  Task,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppNumber,
  Workspace,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Workspace e perfis                                                 */
/* ------------------------------------------------------------------ */

export const workspace: Workspace = {
  id: "ws_dl",
  name: "DL Soluções Digitais",
  role: "Tráfego",
};

export const currentProfile: Profile = {
  id: "u_danyel",
  name: "Danyel",
  initials: "DA",
  email: "danyel@dental-lead.com.br",
  role: "owner",
  jobTitle: "Tráfego",
};

export const profiles: Profile[] = [
  currentProfile,
  { id: "u_ana", name: "Ana Lima", initials: "AL", email: "ana@dental-lead.com.br", role: "gestor", jobTitle: "Social Media" },
  { id: "u_marcos", name: "Marcos Reis", initials: "MR", email: "marcos@dental-lead.com.br", role: "operador", jobTitle: "Designer" },
  { id: "u_bea", name: "Beatriz Souza", initials: "BS", email: "bea@dental-lead.com.br", role: "operador", jobTitle: "Filmmaker" },
];

/* ------------------------------------------------------------------ */
/* Clientes                                                           */
/* ------------------------------------------------------------------ */

const unitLocations = [
  "Sapopemba",
  "Mooca",
  "José Bonifácio",
  "Ferraz de Vasconcelos 1",
  "Itapetininga",
  "São João del Rei",
  "Barbacena",
  "Amparo",
  "Franco da Rocha",
  "Bragança Paulista",
  "Limeira",
  "Mairiporã",
  "Mogi Guaçu",
  "Lavras",
  "Calçadão",
  "Yervant",
  "Jardim Zaira - Mauá",
  "Carijós",
  "Rudge Ramos",
  "Padre Itaquera",
  "Ibiúna",
  "Vila São Pedro",
  "Eldorado",
  "Itaquera 4",
  "Barro Branco",
  "Nilópolis",
  "Parque São Lucas",
  "Vila São José",
  "Guaianases 137",
  "Apolo",
  "Itaquera 3",
  "Várzea Paulista",
  "Itupeva",
  "Cosmópolis",
  "Piracaia",
  "Bebedouro",
  "Jordanésia",
  "Campo Limpo",
  "Santana de Parnaíba",
  "Jundiaí",
  "Ribeirão Preto",
  "Porto Feliz",
  "Colinas da Anhanguera",
  "Sertãozinho",
  "Oral Prime",
  "Tupinambás",
  "Paraná",
  "Caio - BH",
  "Avenida 7",
  "Candeias",
  "Feira de Santana",
  "Simões Filho",
  "Lauro de Freitas",
  "Camaçari",
  "São Cristóvão",
  "São Marcos",
  "Pernambues",
  "Pau da Lima",
  "Liberdade",
  "Tamarineiro",
  "Cajazeiras",
  "Cosme de Farias",
  "São Caetano",
  "São Marcos",
  "Feira de Santana",
  "Avenida 7",
  "Liberdade",
  "São Caetano",
];

const clinicBanners = [
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Sorriclean",
  "Sorriclean",
  "Mais Sorriso",
  "Mais Sorriso",
  "Sorriclean",
  "Mais Sorriso",
  "Mais Sorriso",
  "Sorriclean",
  "Mais Sorriso",
  "Mais Sorriso",
  "Sorriclean",
  "Mais Sorriso",
  "Mais Sorriso",
  "Sorriclean",
  "Sorriclean",
  "Sorriclean",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Sorriclean",
  "Mais Sorriso",
  "Sorriclean",
  "Mais Sorriso",
  "Mais Sorriso",
  "Sorriclean",
  "Dentistas",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Viva Sorrindo",
  "Faz Odontologia",
  "Viva Sorrindo",
  "Oral Prime",
  "Star Sorrindo",
  "Star Sorrindo",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Mais Sorriso",
  "Star Sorrindo",
  "Star Sorrindo",
  "Star Sorrindo",
  "Star Sorrindo",
  "Star Sorrindo",
];

const clientPlans: Client["plan"][] = ["Essencial", "Pro", "Premium", "Performance"];

export const clients: Client[] = unitLocations.map((location, index) => ({
  id: `c_${String(index + 1).padStart(3, "0")}`,
  name: location,
  bandeira: clinicBanners[index] ?? "Mais Sorriso",
  plan: clientPlans[index % clientPlans.length],
  status: "ativo",
  startDate: `2025-06-${String(1 + (index % 28)).padStart(2, "0")}`,
  tags: index % 11 === 0 ? ["critico"] : index % 5 === 0 ? ["atencao"] : ["em-dia"],
}));
/* ------------------------------------------------------------------ */
/* Boards                                                             */
/* ------------------------------------------------------------------ */

export const boards: Board[] = [
  { id: "b_trafego", title: "Tráfego Pago", gradient: "from-neon/30 to-event-blue/20", columnsCount: 4, cardsCount: 18 },
  { id: "b_social", title: "Social Media", gradient: "from-event-purple/30 to-neon/20", columnsCount: 4, cardsCount: 24 },
  { id: "b_conteudo", title: "DL | Conteúdo", gradient: "from-event-blue/30 to-event-purple/20", columnsCount: 3, cardsCount: 15 },
  { id: "b_editor", title: "Editor e Filmmaker", gradient: "from-warning/30 to-neon/20", columnsCount: 3, cardsCount: 9 },
  { id: "b_designer", title: "Designer Gráfico", gradient: "from-event-purple/30 to-event-blue/20", columnsCount: 4, cardsCount: 12 },
  { id: "b_acomp", title: "Acompanhamento Clientes", gradient: "from-neon/30 to-event-purple/20", columnsCount: 3, cardsCount: 21 },
];

export const boardColumns: BoardColumn[] = [
  { id: "col_backlog", boardId: "b_trafego", title: "Backlog", order: 0 },
  { id: "col_fazendo", boardId: "b_trafego", title: "Fazendo", order: 1 },
  { id: "col_revisao", boardId: "b_trafego", title: "Revisão", order: 2 },
  { id: "col_concluido", boardId: "b_trafego", title: "Concluído", order: 3 },
];

export const boardCards: BoardCard[] = [
  { id: "bc_1", boardId: "b_trafego", columnId: "col_backlog", title: "Subir campanha PLAST RIO — junho", labels: ["trafego"], assigneeId: "u_danyel", checklistTotal: 5, checklistDone: 1, dueDate: "2026-06-18", order: 0 },
  { id: "bc_2", boardId: "b_trafego", columnId: "col_backlog", title: "Revisar públicos ÓTICAS CAROL", labels: ["trafego", "revisao"], assigneeId: "u_danyel", checklistTotal: 3, checklistDone: 0, order: 1 },
  { id: "bc_3", boardId: "b_trafego", columnId: "col_fazendo", title: "Criativos O FILÉ — combos", labels: ["design", "conteudo"], assigneeId: "u_marcos", checklistTotal: 4, checklistDone: 2, dueDate: "2026-06-17", order: 0 },
  { id: "bc_4", boardId: "b_trafego", columnId: "col_fazendo", title: "Ajuste de orçamento MR AUTOMAÇÕES", labels: ["trafego", "urgente"], assigneeId: "u_danyel", checklistTotal: 2, checklistDone: 1, order: 1 },
  { id: "bc_5", boardId: "b_trafego", columnId: "col_revisao", title: "Relatório semanal BI JÓIAS", labels: ["revisao"], assigneeId: "u_ana", checklistTotal: 3, checklistDone: 3, order: 0 },
  { id: "bc_6", boardId: "b_trafego", columnId: "col_concluido", title: "Setup pixel MC FLATS", labels: ["trafego"], assigneeId: "u_danyel", checklistTotal: 4, checklistDone: 4, order: 0 },
];

/* ------------------------------------------------------------------ */
/* Tarefas                                                            */
/* ------------------------------------------------------------------ */

export const tasks: Task[] = [
  { id: "t_1", title: "Validar criativos do cliente", status: "todo", priority: "alta", assigneeId: "u_danyel", clientId: clients[0].id, dueDate: "2026-06-16", done: false },
  { id: "t_2", title: "Subir campanha PLAST RIO", status: "todo", priority: "alta", assigneeId: "u_danyel", clientId: clients[1].id, dueDate: "2026-06-18", done: false },
  { id: "t_3", title: "Responder briefing mensal", status: "doing", priority: "media", assigneeId: "u_danyel", clientId: clients[2].id, dueDate: "2026-06-19", done: false },
  { id: "t_4", title: "Relatório mensal", status: "todo", priority: "media", assigneeId: "u_danyel", clientId: clients[3].id, dueDate: "2026-06-22", done: false },
  { id: "t_5", title: "Renegociar plano", status: "todo", priority: "alta", assigneeId: "u_danyel", clientId: clients[4].id, dueDate: "2026-06-12", done: false },
  { id: "t_6", title: "Postar carrossel do cliente", status: "done", priority: "baixa", assigneeId: "u_ana", clientId: clients[5].id, dueDate: "2026-06-14", done: true },
  { id: "t_7", title: "Editar reels MR AUTOMAÇÕES", status: "doing", priority: "media", assigneeId: "u_bea", clientId: clients[6].id, dueDate: "2026-06-20", done: false },
];

/* ------------------------------------------------------------------ */
/* Campanhas (Meta Ads)                                              */
/* ------------------------------------------------------------------ */

export const campaigns: Campaign[] = [
  { id: "camp_1", clientId: clients[0].id, clientName: clients[0].name, status: "pausada", spendCents: 0, conversations: 0, results: 0, sent: 0, balanceCents: 50000 },
  { id: "camp_2", clientId: clients[1].id, clientName: clients[1].name, status: "pausada", spendCents: 0, conversations: 0, results: 0, sent: 0, balanceCents: 30000 },
  { id: "camp_3", clientId: clients[2].id, clientName: clients[2].name, status: "pausada", spendCents: 0, conversations: 0, results: 0, sent: 0, balanceCents: 42000 },
  { id: "camp_4", clientId: clients[3].id, clientName: clients[3].name, status: "pausada", spendCents: 0, conversations: 0, results: 0, sent: 0, balanceCents: 60000 },
];

/* ------------------------------------------------------------------ */
/* Calendário (Junho/2026)                                           */
/* ------------------------------------------------------------------ */

export const calendarEvents: CalendarEvent[] = [
  { id: "ev_1", title: "Reunião com cliente", type: "reuniao", date: "2026-06-17", time: "10:00", ownerId: "u_danyel", clientId: clients[0].id },
  { id: "ev_2", title: "Gravação", type: "conteudo", date: "2026-06-18", time: "14:00", ownerId: "u_bea", clientId: clients[1].id },
  { id: "ev_3", title: "Subir campanha", type: "campanha", date: "2026-06-19", time: "09:00", ownerId: "u_danyel", clientId: clients[2].id },
  { id: "ev_4", title: "Revisar criativos", type: "tarefa", date: "2026-06-20", time: "11:00", ownerId: "u_marcos" },
  { id: "ev_5", title: "Alinhamento semanal DL", type: "reuniao", date: "2026-06-22", time: "09:30", ownerId: "u_danyel" },
  { id: "ev_6", title: "Postar carrossel", type: "conteudo", date: "2026-06-24", time: "16:00", ownerId: "u_ana", clientId: clients[5].id },
  { id: "ev_7", title: "Relatório mensal", type: "tarefa", date: "2026-06-25", time: "15:00", ownerId: "u_danyel", clientId: clients[3].id },
];

/* ------------------------------------------------------------------ */
/* Briefings (Junho/2026)                                            */
/* ------------------------------------------------------------------ */

export const briefingItems: BriefingItem[] = [
  { id: "bf_1", monthRef: "2026-06", clientId: clients[0].id, clientName: clients[0].name, done: true },
  { id: "bf_2", monthRef: "2026-06", clientId: clients[1].id, clientName: clients[1].name, done: true },
  { id: "bf_3", monthRef: "2026-06", clientId: clients[2].id, clientName: clients[2].name, done: false },
  { id: "bf_4", monthRef: "2026-06", clientId: clients[3].id, clientName: clients[3].name, done: false },
  { id: "bf_5", monthRef: "2026-06", clientId: clients[4].id, clientName: clients[4].name, done: true },
  { id: "bf_6", monthRef: "2026-06", clientId: clients[5].id, clientName: clients[5].name, done: false },
];

/* ------------------------------------------------------------------ */
/* Drive / Documentos / Planilhas                                    */
/* ------------------------------------------------------------------ */

export const driveFolders: DriveFile[] = [
  { id: "dr_1", name: "DL DISTRIBUIDORA", kind: "folder", fileType: "Pasta", owner: "Danyel", modifiedAt: "2026-06-10", source: "meu-drive", starred: true },
  { id: "dr_2", name: "Meet Recordings", kind: "folder", fileType: "Pasta", owner: "Danyel", modifiedAt: "2026-06-14", source: "meu-drive" },
  { id: "dr_3", name: "Criativos Junho", kind: "folder", fileType: "Pasta", owner: "Ana Lima", modifiedAt: "2026-06-15", source: "compartilhados", starred: true },
  { id: "dr_4", name: "Contrato_PLAST_RIO.pdf", kind: "file", fileType: "PDF", owner: "Danyel", modifiedAt: "2026-06-09", source: "recentes" },
  { id: "dr_5", name: "Rascunho_Antigo.docx", kind: "file", fileType: "Documento", owner: "Danyel", modifiedAt: "2026-05-20", source: "meu-drive", trashed: true },
];

export const documents: DocumentItem[] = [
  { id: "doc_1", title: "ROTEIRO ESPAÇO PILATES JULHO", updatedAt: "2026-06-13", owner: "Ana Lima" },
  { id: "doc_2", title: "ROTEIRO HM RIO JUNHO E JULHO", updatedAt: "2026-06-12", owner: "Ana Lima" },
  { id: "doc_3", title: "LGPD DL", updatedAt: "2026-05-30", owner: "Danyel" },
  { id: "doc_4", title: "Brochura", updatedAt: "2026-05-22", owner: "Marcos Reis" },
  { id: "doc_5", title: "ROTEIRO NAKANO - JUNHO", updatedAt: "2026-06-11", owner: "Beatriz Souza" },
  { id: "doc_6", title: "Manual_Cultura_DL", updatedAt: "2026-04-18", owner: "Danyel" },
  { id: "doc_7", title: "ATA_Briefing_Salgados_DL", updatedAt: "2026-06-05", owner: "Ana Lima" },
  { id: "doc_8", title: "ONBOARDING NAKANO SUSHI", updatedAt: "2026-06-08", owner: "Danyel" },
];

export const sheets: SheetItem[] = [
  { id: "sh_1", title: "DASHBOARD DELIVERY - CONVE...", updatedAt: "2026-06-14", owner: "Danyel" },
  { id: "sh_2", title: "RELATÓRIO META ADS - SENNA ...", updatedAt: "2026-06-13", owner: "Danyel" },
  { id: "sh_3", title: "DASHBOARD - PLAST RIO", updatedAt: "2026-06-15", owner: "Danyel" },
  { id: "sh_4", title: "MV CELL CENTER", updatedAt: "2026-06-02", owner: "Ana Lima" },
  { id: "sh_5", title: "JULHO NA DL", updatedAt: "2026-06-10", owner: "Danyel" },
  { id: "sh_6", title: "PLANEJAMENTO DE CONTEÚDO ...", updatedAt: "2026-06-12", owner: "Ana Lima" },
  { id: "sh_7", title: "Health Score", updatedAt: "2026-06-09", owner: "Danyel" },
];

/* ------------------------------------------------------------------ */
/* Inbox WhatsApp                                                     */
/* ------------------------------------------------------------------ */

export const whatsappNumbers: WhatsAppNumber[] = [
  { id: "wa_num_1", label: "Suporte", phone: "+55 21 99999-0000", status: "conectado" },
];

export const whatsappConversations: WhatsAppConversation[] = [
  { id: "wac_1", contactName: "Maria Eduarda", lastMessage: "Perfeito, pode seguir!", lastMessageAt: "2026-06-16T09:12:00", unread: 2, numberId: "wa_num_1" },
  { id: "wac_2", contactName: "Suporte DL", lastMessage: "Recebido, obrigado.", lastMessageAt: "2026-06-16T08:40:00", unread: 0, numberId: "wa_num_1" },
  { id: "wac_3", contactName: "Suporte DL", lastMessage: "Vou verificar e te retorno.", lastMessageAt: "2026-06-15T18:05:00", unread: 0, numberId: "wa_num_1" },
  { id: "wac_4", contactName: "Suporte DL", lastMessage: "Bom dia! Tudo certo por aí?", lastMessageAt: "2026-06-15T11:22:00", unread: 1, numberId: "wa_num_1" },
];

export const whatsappMessages: WhatsAppMessage[] = [
  { id: "wam_1", conversationId: "wac_1", direction: "in", body: "Oi! Recebeu os materiais?", timestamp: "2026-06-16T09:05:00" },
  { id: "wam_2", conversationId: "wac_1", direction: "out", body: "Recebi sim! Já estou organizando.", timestamp: "2026-06-16T09:08:00" },
  { id: "wam_3", conversationId: "wac_1", direction: "in", body: "Perfeito, pode seguir!", timestamp: "2026-06-16T09:12:00" },
];

/* ------------------------------------------------------------------ */
/* Dogtooth (conversas mockadas)                                      */
/* ------------------------------------------------------------------ */

export const chatConversations: ChatConversation[] = [
  { id: "cc_1", title: "preciso criar umas copys", updatedAt: "2026-06-16T08:30:00" },
];

export const chatMessages: ChatMessage[] = [
  { id: "cm_1", conversationId: "cc_1", role: "user", content: "preciso criar umas copys", timestamp: "2026-06-16T08:30:00" },
  {
    id: "cm_2",
    conversationId: "cc_1",
    role: "assistant",
    content:
      "Claro! Me diga o cliente, o objetivo (vendas, agendamento, leads) e o tom. " +
      "No MVP eu ainda não gero de verdade — a execução chega na Fase 4.",
    timestamp: "2026-06-16T08:30:20",
  },
];

export const promptSuggestions: string[] = [
  "Como está o rendimento do mês?",
  "Cria o cliente Padaria do Zé, nicho alimentação",
  "Quantos leads tenho no pipeline?",
];

/* ------------------------------------------------------------------ */
/* Atividade recente                                                  */
/* ------------------------------------------------------------------ */

export const activityLogs: ActivityLog[] = [
  { id: "al_1", actor: "Danyel", action: "atualizou", target: clients[0].name, timestamp: "2026-06-16T08:10:00" },
  { id: "al_2", actor: "Ana Lima", action: "concluiu tarefa em", target: clients[1].name, timestamp: "2026-06-15T17:42:00" },
  { id: "al_3", actor: "Danyel", action: "criou briefing de", target: clients[2].name, timestamp: "2026-06-15T15:20:00" },
];

/** Clientes destacados no widget "Atualização de clientes" do dashboard. */
export const dashboardClientUpdates = clients.slice(0, 7).map((client) => client.name);

/* ------------------------------------------------------------------ */
/* Dashboard — KPIs                                                   */
/* ------------------------------------------------------------------ */

const flatSeries = (vals: number[]) =>
  vals.map((value, i) => ({ label: `D${i + 1}`, value }));

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: "m_clientes",
    label: "Clientes ativos",
    value: String(clients.length),
    hint: `de ${clients.length} no total`,
    deltaPct: null,
    series: flatSeries([24, 26, 27, 28, 30, 31, 31]),
  },
  {
    id: "m_novos",
    label: "Novos clientes",
    value: "0",
    hint: "últimos 7 dias",
    deltaPct: -100,
    series: flatSeries([2, 1, 1, 0, 0, 0, 0]),
  },
  {
    id: "m_boards",
    label: "Boards",
    value: "6",
    hint: "quadros ativos",
    deltaPct: null,
    series: flatSeries([4, 5, 5, 6, 6, 6, 6]),
  },
  {
    id: "m_campanhas",
    label: "Campanhas ativas",
    value: "0",
    hint: "em veiculação",
    deltaPct: null,
    series: flatSeries([3, 2, 2, 1, 0, 0, 0]),
  },
];

/** Métricas da seção "Crescimento da empresa". */
export const growthMetrics: DashboardMetric[] = [
  {
    id: "g_mrr",
    label: "Receita recorrente (MRR)",
    value: "R$ 84.500",
    hint: "estimado no mês",
    deltaPct: 6,
    series: flatSeries([72, 74, 78, 80, 82, 83, 84]),
  },
  {
    id: "g_novos",
    label: "Novos clientes 7D",
    value: "0",
    hint: "últimos 7 dias",
    deltaPct: -100,
    series: flatSeries([2, 1, 1, 0, 0, 0, 0]),
  },
  {
    id: "g_ativos",
    label: "Clientes ativos",
    value: String(clients.length),
    hint: `de ${clients.length} no total`,
    deltaPct: 3,
    series: flatSeries([28, 29, 30, 30, 31, 31, 31]),
  },
  {
    id: "g_campanhas",
    label: "Campanhas ativas",
    value: "0",
    hint: "em veiculação",
    deltaPct: null,
    series: flatSeries([3, 2, 1, 1, 0, 0, 0]),
  },
];

/* ------------------------------------------------------------------ */
/* Integrações (Configurações)                                        */
/* ------------------------------------------------------------------ */

export const integrations: Integration[] = [
  { id: "int_supabase", name: "Supabase", description: "Banco de dados, auth e RLS.", status: "em-planejamento", phase: "Fase 2" },
  { id: "int_drive", name: "Google Drive", description: "Navegação de pastas e arquivos.", status: "mockado", phase: "Fase 5" },
  { id: "int_docs", name: "Google Docs", description: "Edição de documentos embutida.", status: "mockado", phase: "Fase 5" },
  { id: "int_sheets", name: "Google Sheets", description: "Edição de planilhas embutida.", status: "mockado", phase: "Fase 5" },
  { id: "int_whatsapp", name: "WhatsApp", description: "Inbox via Evolution API / Z-API.", status: "em-planejamento", phase: "Fase 5" },
  { id: "int_meta", name: "Meta Ads", description: "Métricas de campanhas via API.", status: "em-planejamento", phase: "Fase 5" },
  { id: "int_trello", name: "Trello", description: "Sincronização de boards.", status: "em-planejamento", phase: "Fase 5" },
  { id: "int_openai", name: "OpenAI", description: "Cérebro do Dogtooth.", status: "em-planejamento", phase: "Fase 4" },
];

/* ------------------------------------------------------------------ */
/* Helpers de leitura (substituíveis por queries Supabase na Fase 3)  */
/* ------------------------------------------------------------------ */

export const getProfileById = (id?: string): Profile | undefined =>
  profiles.find((p) => p.id === id);

export const getTasksByAssignee = (assigneeId: string): Task[] =>
  tasks.filter((t) => t.assigneeId === assigneeId);

export const getBoardCards = (boardId: string): BoardCard[] =>
  boardCards.filter((c) => c.boardId === boardId);

export const getColumnsByBoard = (boardId: string): BoardColumn[] =>
  boardColumns.filter((c) => c.boardId === boardId).sort((a, b) => a.order - b.order);

export const getMessagesByConversation = (conversationId: string): WhatsAppMessage[] =>
  whatsappMessages.filter((m) => m.conversationId === conversationId);

