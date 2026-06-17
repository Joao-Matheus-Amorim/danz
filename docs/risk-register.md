# Registro de Riscos - DL Operational System

Escala: Probabilidade (B/M/A) x Impacto (B/M/A).

## Riscos Tecnicos
| ID | Risco | P x I | Mitigacao |
|----|-------|-------|-----------|
| RT01 | Migracao mock -> banco gerar duplicidade ou comportamento divergente | M x A | Migrar por repositorios pequenos; clientes e boards ja seguem esse padrao |
| RT02 | Divergencia entre `types.ts` e `schema.sql` | M x M | Atualizar `data-model.md` e schema no mesmo corte |
| RT03 | Componentes client demais aumentarem bundle | B x M | Server por padrao; `"use client"` apenas onde necessario |
| RT04 | Persistencia de DnD perder ordem de cards | M x A | Repositorio persiste `column_id` e `position`; UI faz rollback em erro |

## Riscos de Escopo
| ID | Risco | P x I | Mitigacao |
|----|-------|-------|-----------|
| RE01 | Tela visualmente pronta ser confundida com integracao real | M x A | Docs e toasts explicitam mock/fallback |
| RE02 | Misturar muitos dominios no mesmo corte | M x M | Cortes por superficie: clientes, boards, Trello, etc. |

## Riscos de Integracao
| ID | Risco | P x I | Mitigacao |
|----|-------|-------|-----------|
| RI01 | WhatsApp depender de provedor instavel | M x A | Homologar provedor antes do corte real |
| RI02 | Mudancas na Meta Ads API quebrarem campanhas | M x M | Portar legado por camada server-side isolada |
| RI03 | Limites/escopos OAuth do Google | M x M | Usar escopos minimos e consentimento claro |
| RI04 | Trello causar perda de dados locais | M x A | Sync nao destrutivo; nao apaga dados DL; usa `external_id` |
| RI05 | Trello criar duplicidade | M x M | Indices unicos parciais por `external_id` |

## Riscos de Performance
| ID | Risco | P x I | Mitigacao |
|----|-------|-------|-----------|
| RP01 | Boards com muitos cards travarem o DnD | B x M | Medir antes de otimizar; considerar virtualizacao |
| RP02 | Muitos graficos no dashboard | B x B | Mini charts leves e dados agregados |

## Riscos de Seguranca
| ID | Risco | P x I | Mitigacao |
|----|-------|-------|-----------|
| RS01 | Vazar chaves no client | B x A | OpenAI/Trello/ provedores apenas server-side |
| RS02 | Acesso cruzado entre workspaces | M x A | RLS por `workspace_id` |
| RS03 | Permissoes insuficientes por papel | M x M | RBAC planejado para Fase 6 |
| RS04 | Escrita Trello burlar RLS | B x A | Rotas usam token Supabase do usuario logado |
