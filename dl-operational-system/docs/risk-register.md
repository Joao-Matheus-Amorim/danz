# Registro de Riscos — DL Operational System

Escala: Probabilidade (B/M/A) × Impacto (B/M/A).

## Riscos técnicos
| ID | Risco | P×I | Mitigação |
|----|-------|-----|-----------|
| RT01 | Acoplamento mock→banco mal planejado dificultar a Fase 3 | M×A | Helpers de leitura já com assinatura final; tipos compartilhados; camada de repositórios planejada |
| RT02 | Divergência entre `types.ts` e `schema.sql` | M×M | Documento data-model como ponte; revisão ao alterar tipos |
| RT03 | Componentes client demais → bundle/SSR ruim | B×M | Server por padrão; `"use client"` só onde necessário |

## Riscos de escopo
| ID | Risco | P×I | Mitigação |
|----|-------|-----|-----------|
| RE01 | "Telas bonitas" sem estrutura real | M×A | Cada página funcional com mock; sem placeholders vazios |
| RE02 | Crescimento de escopo no MVP (gold plating) | M×M | Escopo fixado em `scope.md`; extras viram itens de roadmap |

## Riscos de integração
| ID | Risco | P×I | Mitigação |
|----|-------|-----|-----------|
| RI01 | Integração WhatsApp depender de provedor instável | M×A | Provedor homologado (Evolution/Z-API/Baileys) na Fase 5; abstração de provider |
| RI02 | Mudanças na Meta Ads API quebrarem campanhas | M×M | Reuso do motor `danz` que já trata Meta Ads; camada anti-corrupção |
| RI03 | Limites/escopos OAuth do Google | M×M | Planejar consentimento e escopos mínimos na Fase 5 |

## Riscos de performance
| ID | Risco | P×I | Mitigação |
|----|-------|-----|-----------|
| RP01 | Boards com muitos cards travarem o DnD | B×M | Virtualização futura; medir antes de otimizar |
| RP02 | Muitos gráficos no dashboard | B×B | Mini charts sem animação; dados agregados |

## Riscos de segurança
| ID | Risco | P×I | Mitigação |
|----|-------|-----|-----------|
| RS01 | Vazar `OPENAI_API_KEY`/tokens no client | B×A | Chaves só server-side; rotas de API; `.env.local` ignorado |
| RS02 | Acesso cruzado entre workspaces | M×A | RLS por `workspace_id` (ver `rls-policies.sql`) |
| RS03 | Permissões insuficientes por papel | M×M | RBAC planejado para a Fase 6 |
