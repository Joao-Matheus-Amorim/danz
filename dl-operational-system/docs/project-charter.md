# Project Charter — DL Operational System

> Termo de abertura do projeto. Documento vivo (Fase 1 — MVP).

## Objetivo
Construir a central operacional interna da **DL (Dental Lead)** — um "mini sistema
operacional" da agência que reúne CRM, boards estilo Trello, calendário, tarefas,
briefings, campanhas, arquivos (Drive/Docs/Sheets), inbox de WhatsApp e a IA
interna **DLtinho** em um único workspace.

## Justificativa
A operação hoje está espalhada em ferramentas desconectadas (planilhas, Trello,
Drive, WhatsApp, Meta Ads). Isso gera retrabalho, perda de contexto e falta de
visão consolidada. O DL Operational System centraliza a operação, padroniza
processos e prepara a base para automação e inteligência (DLtinho), reaproveitando
o motor operacional existente (projeto `danz`: Meta Ads, Google Sheets, alertas,
histórico, jobs).

## Escopo macro
- **Fase 1 (este MVP):** frontend SaaS navegável, visualmente fiel, com dados
  mockados centralizados e arquitetura pronta para banco e IA.
- **Fases seguintes:** Supabase, CRUD real, DLtinho (OpenAI), integrações
  (Google/Trello/WhatsApp/Meta) e operação multiusuário com permissões.

## Stakeholders
| Papel | Responsabilidade |
|------|------------------|
| Patrocinador / Owner (Danyel) | Visão de produto, prioridades, validação |
| Tech Lead | Arquitetura, qualidade, evolução técnica |
| Operação (Tráfego, Social, Design, Filmmaker) | Usuários finais |
| Clientes da DL | Beneficiários indiretos (briefings, performance) |

## Restrições
- Stack obrigatória: Next.js, TypeScript, Tailwind, shadcn/ui, lucide-react,
  framer-motion, Recharts, dnd-kit, date-fns (pt-BR), Supabase (preparado),
  OpenAI (preparado).
- MVP **não** chama APIs reais (Supabase/OpenAI/Google/Meta/WhatsApp).
- Nenhuma integração falsa pode ser apresentada como real.
- Toda escolha temporária deve estar registrada em `technical-debt-log.md`.

## Premissas
- Os dados mockados refletem a realidade da carteira e da operação da DL.
- O motor `danz` continuará existindo e será conectado nas fases de integração.
- O ambiente roda sem variáveis de ambiente (modo mock) por padrão.

## Critérios de sucesso
1. Todas as páginas existem e navegam corretamente.
2. Sidebar marca a rota ativa; layout responsivo.
3. Sem erros de TypeScript; sem imports quebrados; sem componentes órfãos.
4. Dados mockados 100% centralizados em `lib/mock-data.ts`.
5. Documentação PMBOK + dívidas técnicas registradas.
6. Estrutura pronta para Supabase e para a IA.
