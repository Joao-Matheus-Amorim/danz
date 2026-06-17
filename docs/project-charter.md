# Project Charter - DL Operational System

Documento vivo do produto.

## Objetivo
Construir a central operacional interna da **DL (Dental Lead)**: CRM, boards
estilo Trello, calendario, tarefas, briefings, campanhas, arquivos, inbox de
WhatsApp e IA interna DLtinho em um unico workspace.

## Justificativa
A operacao esta espalhada em ferramentas desconectadas, como planilhas, Trello,
Drive, WhatsApp e Meta Ads. O DL Operational System centraliza contexto,
padroniza processo e cria base para automacao.

O prototipo anterior `danz` foi consolidado neste app. A parte com valor real
do legado, integracoes Meta Ads e Google Sheets, foi preservada em
`lib/integrations/` para port futuro.

## Escopo Macro
- **Fase 1:** frontend SaaS navegavel.
- **Fase 2:** Supabase Auth, schema, RLS e seed.
- **Fase 3:** CRUD real por repositorios; clientes e boards ja iniciados.
- **Fase 4:** DLtinho com OpenAI server-side e acoes reais.
- **Fase 5:** integracoes externas; Trello iniciado.
- **Fase 6:** permissoes, convites e auditoria operacional.

## Stakeholders
| Papel | Responsabilidade |
|------|------------------|
| Patrocinador / Owner | Visao de produto, prioridades e validacao |
| Tech Lead | Arquitetura, qualidade e evolucao tecnica |
| Operacao | Usuarios finais |
| Clientes da DL | Beneficiarios indiretos |

## Restricoes
- Stack: Next.js, TypeScript, Tailwind, shadcn/ui, lucide-react,
  framer-motion, Recharts, dnd-kit, date-fns, Supabase e OpenAI.
- Credenciais reais nunca sao versionadas.
- Chaves sensiveis de provedores ficam apenas server-side.
- Toda escolha temporaria deve estar registrada em `technical-debt-log.md`.

## Premissas
- O ambiente local precisa continuar abrindo sem envs para facilitar validacao.
- Supabase e Trello so executam fluxo real quando suas envs existem.
- Integracoes devem ser adicionadas por cortes pequenos e auditaveis.

## Criterios de Sucesso
1. Todas as paginas navegam corretamente.
2. Visual consistente com a identidade definida.
3. TypeScript, lint e build limpos.
4. Entidades migradas para banco usam repositorios ou rotas server-side.
5. Documentacao acompanha o estado real do produto.
6. Nenhuma integracao falsa e apresentada como pronta.
