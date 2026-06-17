# Requisitos — DL Operational System

## Requisitos Funcionais (RF)
| ID | Requisito | Status MVP |
|----|-----------|-----------|
| RF01 | Navegar entre todas as seções via sidebar com rota ativa | ✅ |
| RF02 | Dashboard com hero, KPIs (mini gráficos), crescimento e widgets | ✅ |
| RF03 | DLtinho: chat com conversas, sugestões e aba Construtor | ✅ (stub) |
| RF04 | Meu Painel: agenda, métricas, tarefas, calendário, pontuação | ✅ |
| RF05 | Boards: grid de quadros e quadro individual com drag and drop | ✅ |
| RF06 | Clientes: tabela, busca, filtro de status e modal de novo cliente | ✅ |
| RF07 | Calendário: grade mensal, navegação, visões e novo evento | ✅ |
| RF08 | Briefings: controle mensal com checklist e aba de formulários | ✅ |
| RF09 | Campanhas: métricas, tabela Meta Ads, abas e aviso de token | ✅ (mock) |
| RF10 | Drive/Documentos/Planilhas: navegação e shells de edição | ✅ (mock) |
| RF11 | Inbox: conexão WhatsApp (QR), lista de conversas e painel | ✅ (mock) |
| RF12 | Configurações: workspace, preferências, usuários, integrações | ✅ |
| RF13 | Login (simbólico no MVP) | ✅ |

## Requisitos Não Funcionais (RNF)
- **RNF01 — Stack:** Next.js (App Router) + TypeScript estrito + Tailwind + shadcn/ui.
- **RNF02 — Organização:** componentes pequenos, tipados e reutilizáveis; sem
  arrays mockados dentro de páginas; rotas/constantes/tipos centralizados.
- **RNF03 — Sem dívida silenciosa:** todo mock/decisão temporária registrado em
  `technical-debt-log.md`.
- **RNF04 — Resiliência:** app funciona sem variáveis de ambiente (modo mock).
- **RNF05 — Manutenibilidade:** padrões visuais reaproveitáveis (`PageHeader`,
  `Card`, `Button`, classes utilitárias `.dl-*`).

## Requisitos de Segurança (RSeg)
- **RSeg01:** chaves sensíveis (OpenAI, provedores) nunca no client — apenas
  server-side nas fases futuras.
- **RSeg02:** isolamento multi-tenant por `workspace_id` + RLS (ver `database/`).
- **RSeg03:** Supabase opcional e tolerante a ausência de credenciais.
- **RSeg04:** nenhuma credencial real versionada (`.env.local` ignorado).

## Requisitos de UX (RUX)
- **RUX01:** tema escuro premium consistente; neon verde-limão como destaque.
- **RUX02:** labels pequenos com letter-spacing; cards de vidro; brilhos radiais.
- **RUX03:** todo botão dá feedback (navega, abre modal, muda estado ou exibe
  toast "integração futura").
- **RUX04:** datas e textos em pt-BR (date-fns/locale ptBR).

## Requisitos de Performance (RPerf)
- **RPerf01:** componentes server por padrão; `"use client"` só onde há interação.
- **RPerf02:** gráficos leves (Recharts sem animação nos mini charts).
- **RPerf03:** imports diretos por componente para favorecer tree-shaking.
