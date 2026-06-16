# Operação Real — Checklist de Staging e Produção Controlada

Este documento define o caminho seguro para sair do modo mock/dry-run e operar com Meta Ads e Google Sheets reais.

---

## Estado atual

O projeto está pronto para validação operacional local e staging controlado, mas ainda não deve rodar produção ampla.

Já existe:

- registry de clientes/unidades;
- validação agrupada de pendências;
- adapters por segmento;
- Dental Fill com dry-run;
- delivery `none`, `log`, `notify`, `approval`;
- persistência local;
- histórico operacional por API;
- painel web com histórico real;
- análise de campanhas em árvore;
- normalização por IDs para Meta real.

Ainda falta configurar credenciais reais e validar com escopo mínimo.

---

## Variáveis obrigatórias

### Segurança operacional

- `OPERATIONAL_API_TOKEN`

Usado para proteger endpoints operacionais e históricos.

### SQLite local

- `SQLITE_ENABLED`
- `SQLITE_PATH`

Para desenvolvimento local, SQLite está OK. Para SaaS real/deploy escalável, avaliar banco cloud depois.

### Meta Ads

- `META_ACCESS_TOKEN`
- `META_API_VERSION`

No registry Dental, trocar o placeholder da conta central pelo `act` real da conta Meta central.

### Google Sheets

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

A planilha precisa ser compartilhada com o e-mail da service account.

---

## Ordem segura para validar Meta real

1. Configurar ambiente local com as variáveis reais.
2. Validar registry:

```bash
npm run registry:validate
```

3. Garantir que não aparece mais `adAccountId pendente` para o estado testado.
4. Rodar um dry-run de um dia:

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery approval
```

5. Conferir no terminal:

```text
matchedRows maior que 0 em alguma unidade
sem erro de token Meta
sem erro de conta act
sem erro de aba da planilha
```

6. Conferir no painel:

```text
Histórico -> Aprovações pendentes
Histórico -> Resultados por unidade
Campanhas -> Campanha -> Conjunto -> Criativo
```

---

## Ordem segura para validar Google Sheets real

Somente depois do dry-run Meta estar coerente.

1. Confirmar service account.
2. Confirmar planilha compartilhada.
3. Rodar real com escopo mínimo:

```bash
npm run dental:fill -- --state SP --day 2026-05-10 --delivery approval
```

4. Conferir manualmente a planilha.
5. Conferir histórico no painel.
6. Só depois rodar intervalo maior.

---

## Regras de segurança

- Não rodar mês inteiro na primeira execução real.
- Não rodar todos os estados no primeiro teste real.
- Não preencher `cpl` sem decisão explícita.
- Usar `--delivery approval` em validações sensíveis.
- Manter histórico ativo antes de executar real.
- Conferir planilha manualmente após primeira escrita.

---

## Comandos úteis

### Saúde geral

```bash
npm run check
npm test
npm run registry:validate
```

### Painel local

```powershell
$env:OPERATIONAL_API_TOKEN="dev-local-123"
npm run web
```

### Teste de endpoints históricos

```powershell
$token="dev-local-123"
curl.exe "http://localhost:3000/api/history/notifications?limit=10" -H "Authorization: Bearer $token"
curl.exe "http://localhost:3000/api/history/job-runs?limit=10" -H "Authorization: Bearer $token"
curl.exe "http://localhost:3000/api/history/unit-results?state=SP&limit=10" -H "Authorization: Bearer $token"
```

---

## Critério para considerar operação real liberada

A operação real só deve ser considerada liberada quando:

- `npm run check` passa;
- `npm test` passa;
- `registry:validate` não tem pendências críticas para o escopo testado;
- Meta Ads retorna insights reais;
- Google Sheets valida acesso à planilha;
- dry-run mostra ranges corretos;
- execução real mínima escreve corretamente;
- histórico registra tudo;
- painel permite auditar o resultado.

---

## Próximo passo técnico

Antes de ativar produção real ampla, o próximo desenvolvimento recomendado é:

```text
Grupo 8.2 — Laboratório Criativo
```

Depois:

```text
Grupo 9 — Meta Ads real em staging
Grupo 10 — Google Sheets real controlado
Grupo 11 — WhatsApp real
```
