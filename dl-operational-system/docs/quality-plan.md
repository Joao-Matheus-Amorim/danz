# Plano de Qualidade — DL Operational System

## Padrões de qualidade
- TypeScript estrito, sem `any` desnecessário; `npm run typecheck` limpo.
- Componentes pequenos, tipados e reutilizáveis; um por arquivo.
- Dados e estilos centralizados (mock-data / constants / types / routes).
- Sem código morto, imports quebrados ou componentes órfãos.
- Toda decisão temporária registrada em `technical-debt-log.md`.

## Checklist de aceite (executar a cada entrega)
- [ ] `npm run typecheck` sem erros.
- [ ] `npm run build` conclui com sucesso.
- [ ] `npm run lint` sem erros bloqueantes.
- [ ] Todas as rotas abrem sem erro de runtime.
- [ ] Nenhum dado mockado dentro de páginas/componentes (só `mock-data.ts`).

## Checklist visual
- [ ] Tema escuro premium aplicado (fundo `#050A07`, brilhos radiais).
- [ ] Neon verde-limão em destaques/itens ativos.
- [ ] Glassmorphism nos cards; bordas sutis; profundidade.
- [ ] Labels pequenos com letter-spacing (`.dl-label`).
- [ ] Hero do dashboard com palavra "GERAL" em neon e círculo de IA.

## Checklist responsivo
- [ ] Sidebar some/colapsa em telas pequenas (oculta < lg).
- [ ] Grids reduzem colunas em `sm`/`md`/`xl`.
- [ ] Tabelas com scroll horizontal quando necessário.
- [ ] Topbar e headers adaptam ações para múltiplas linhas.

## Checklist de acessibilidade básica
- [ ] `lang="pt-BR"` no `<html>`.
- [ ] Botões de ícone com `aria-label`.
- [ ] Foco visível (ring neon) em inputs/botões.
- [ ] Contraste adequado de texto sobre fundo escuro.
- [ ] Diálogos com `DialogTitle`/`DialogDescription`.

## Checklist de manutenção
- [ ] Rotas via `ROUTES` (sem paths hardcoded).
- [ ] Cores/labels via `constants.ts`.
- [ ] Tipos via `types.ts`.
- [ ] Novos mocks adicionados a `mock-data.ts` com tipo correspondente.
- [ ] Botões sem ação real usam `futureFeature(...)`.
