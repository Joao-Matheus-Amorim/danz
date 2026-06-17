# Plano de Qualidade - DL Operational System

## Padroes de Qualidade
- TypeScript estrito, sem `any` desnecessario.
- Componentes pequenos, tipados e reutilizaveis.
- Dados por `lib/repositories/*` quando persistidos e por `lib/mock-data.ts`
  apenas enquanto a superficie ainda nao foi migrada.
- Sem codigo morto, imports quebrados ou componentes orfaos.
- Toda decisao temporaria registrada em `technical-debt-log.md`.

## Checklist de Aceite
- [ ] `npm run typecheck` sem erros.
- [ ] `npm run lint` sem erros bloqueantes.
- [ ] `npm run build` conclui com sucesso.
- [ ] Rotas principais abrem sem erro de runtime.
- [ ] Nenhum dado novo hardcoded dentro de paginas/componentes.
- [ ] Escritas reais passam por repositorio ou rota server-side.
- [ ] Credenciais ficam em envs e nunca no client.

## Checklist Visual
- [ ] Tema escuro premium aplicado.
- [ ] Laranja Dental Lead em destaques e itens ativos.
- [ ] Cards com profundidade controlada.
- [ ] Labels pequenos e consistentes.
- [ ] Dialogos com titulo e descricao acessiveis.

## Checklist Responsivo
- [ ] Sidebar oculta abaixo de `lg`.
- [ ] Grids reduzem colunas em `sm`, `md` e `xl`.
- [ ] Tabelas com scroll horizontal quando necessario.
- [ ] Topbar e headers adaptam acoes para multiplas linhas.

## Checklist de Manutencao
- [ ] Rotas via `ROUTES`.
- [ ] Cores e labels via `constants.ts`.
- [ ] Tipos via `types.ts`.
- [ ] Novos mocks adicionados a `mock-data.ts` com tipo correspondente.
- [ ] Novas superficies persistidas em `lib/repositories/*`.
- [ ] Botoes sem acao real usam feedback claro.
