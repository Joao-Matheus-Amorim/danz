# M1 — Módulo de Cadastro e Importação de Clientes

## 1. Objetivo do M1

O M1 não é apenas uma rotina de sincronização. O M1 é a fundação de cadastro, organização e importação de clientes da plataforma.

Ele deve permitir cadastrar, importar, organizar e consultar empresas, estados, unidades/clínicas, contas Meta Ads, planilhas e módulos habilitados de forma expansível.

Exemplo de cenário real inicial:

> Uma empresa odontológica possui operação em 2 estados e aproximadamente 100 clínicas. Cada clínica pode ter conta de anúncio própria, planilha própria ou planilha compartilhada, regras próprias e módulos diferentes.

---

## 2. Problema que o M1 resolve

Sem o M1, o sistema fica preso a clientes hardcoded ou a JSON manual difícil de manter.

Com o M1, o sistema passa a suportar:

- empresas com muitas clínicas;
- organização por estado;
- organização por cidade;
- organização por unidade;
- múltiplas contas Meta Ads;
- múltiplas planilhas;
- módulos diferentes por clínica;
- importação em massa;
- expansão futura para painel administrativo.

---

## 3. Conceitos do M1

### 3.1 Organização

A hierarquia principal deve ser:

```text
Empresa
  └── Grupo operacional: admin ou servicos
      └── Segmento: odontologia, clinicas, oticas...
          └── Estado: SP, BA...
              └── Cidade
                  └── Unidade/Clínica
```

Exemplo:

```text
Empresa Odontológica X
  └── Serviços
      └── Odontologia
          ├── SP
          │   ├── São Paulo
          │   │   ├── Clínica Tatuapé
          │   │   ├── Clínica Mooca
          │   │   └── Clínica Itaquera
          │   └── Guarulhos
          │       └── Clínica Centro Guarulhos
          └── Bahia
              ├── Salvador
              │   ├── Clínica Pituba
              │   └── Clínica Brotas
              └── Feira de Santana
                  └── Clínica Centro
```

---

## 4. Entidades principais

### 4.1 Company

Representa a empresa mãe ou operação principal.

```json
{
  "id": "cmp_odontologica_x",
  "name": "Odontológica X",
  "segment": "odontologia",
  "defaultGroup": "servicos",
  "enabled": true
}
```

### 4.2 Unit / Clinic

Representa uma clínica/unidade individual.

```json
{
  "key": "odontologica_x_sp_tatuape",
  "companyId": "cmp_odontologica_x",
  "name": "Clínica Tatuapé",
  "group": "servicos",
  "segment": "odontologia",
  "state": "SP",
  "city": "São Paulo",
  "enabled": true,
  "meta": {
    "adAccountId": "act_123456789012345"
  },
  "sheets": {
    "spreadsheetId": "ID_DA_PLANILHA",
    "tabPrefix": "Tatuapé",
    "template": "odontologia_padrao"
  },
  "modules": {
    "pullMetaMetrics": true,
    "fillSheet": true,
    "sendWhatsappReport": true,
    "analyzeCreatives": false,
    "checkBalance": false,
    "uploadCreative": false,
    "createCampaign": false,
    "pauseAds": false
  },
  "rules": {
    "maxCpl": 30,
    "minCtr": 1,
    "maxSpendWithoutLead": 40,
    "minBalance": 50
  },
  "whatsapp": {
    "enabled": true,
    "to": "5521999999999"
  }
}
```

---

## 5. Estrutura de arquivos inicial

Enquanto não houver banco e painel administrativo completo, o M1 pode começar usando arquivos JSON organizados.

```text
data/
  companies/
    odontologica-x.json

  clients/
    servicos/
      odontologia/
        sp/
          odontologica-x-sp.json
        ba/
          odontologica-x-ba.json

    admin/
      odontologia/
        sp/
          odontologica-x-admin-sp.json
```

Essa estrutura permite começar simples e migrar depois para banco.

---

## 6. Importação em massa

O M1 deve aceitar importação por JSON ou CSV.

### 6.1 Campos mínimos para importação

```text
companyId
companyName
group
segment
state
city
clinicName
clinicKey
adAccountId
spreadsheetId
tabPrefix
whatsappTo
modules
rules
```

### 6.2 Exemplo CSV

```csv
companyId,companyName,group,segment,state,city,clinicName,clinicKey,adAccountId,spreadsheetId,tabPrefix,whatsappTo
cmp_odontologica_x,Odontológica X,servicos,odontologia,SP,São Paulo,Clínica Tatuapé,odontologica_x_sp_tatuape,act_123456789012345,SPREADSHEET_ID,Tatuapé,5521999999999
cmp_odontologica_x,Odontológica X,servicos,odontologia,BA,Salvador,Clínica Pituba,odontologica_x_ba_pituba,act_987654321012345,SPREADSHEET_ID,Pituba,5521999999999
```

---

## 7. Funcionalidades do M1

### M1-F01 — Cadastro de empresa

Cadastrar empresa mãe com nome, segmento padrão e status.

### M1-F02 — Cadastro de unidade/clínica

Cadastrar cada clínica com estado, cidade, grupo, conta Meta Ads, planilha, módulos e regras.

### M1-F03 — Importação em massa

Importar dezenas ou centenas de clínicas por CSV/JSON.

### M1-F04 — Validação de configuração

Validar se cada clínica possui:

- key única;
- empresa vinculada;
- estado válido;
- cidade preenchida;
- grupo válido;
- segmento válido;
- `adAccountId` em formato `act_...`;
- `spreadsheetId` preenchido;
- módulos definidos;
- WhatsApp válido quando habilitado.

### M1-F05 — Consulta por escopo

Permitir listar clínicas por:

- empresa;
- grupo;
- segmento;
- estado;
- cidade;
- módulo habilitado;
- status ativo/inativo.

### M1-F06 — Exportação

Exportar a configuração consolidada para auditoria ou backup.

### M1-F07 — Preparação para painel

O módulo deve ser criado de forma que futuramente o painel Admin consiga cadastrar e editar sem alterar a lógica central.

---

## 8. Arquitetura técnica do M1

### 8.1 Arquivos sugeridos

```text
src/config/clientLoader.js
src/config/companyLoader.js
src/config/clientSchema.js
src/config/clientImporter.js
src/config/clientExporter.js
src/domain/clientScope.js
src/domain/modules.js
src/security/moduleAccess.js
```

### 8.2 Responsabilidades

#### clientLoader.js

Carrega unidades/clínicas dos arquivos JSON.

#### companyLoader.js

Carrega empresas mãe.

#### clientSchema.js

Valida estrutura mínima de cada clínica.

#### clientImporter.js

Importa CSV/JSON para a estrutura interna.

#### clientExporter.js

Exporta configuração consolidada.

#### clientScope.js

Filtra clientes por empresa, grupo, estado, cidade, segmento e módulo.

#### modules.js

Centraliza módulos possíveis.

#### moduleAccess.js

Verifica se uma clínica possui determinado módulo.

---

## 9. Exemplo de uso esperado

### Rodar para todas as clínicas da empresa odontológica

```bash
npm run clients:list -- --company cmp_odontologica_x
```

### Rodar apenas São Paulo

```bash
npm run clients:list -- --company cmp_odontologica_x --state SP
```

### Rodar apenas Bahia

```bash
npm run clients:list -- --company cmp_odontologica_x --state BA
```

### Rodar apenas clínicas com módulo de planilha

```bash
npm run clients:list -- --company cmp_odontologica_x --module fillSheet
```

### Sincronizar Meta Ads para planilhas das clínicas de SP

```bash
npm run sync -- --company cmp_odontologica_x --state SP --segment odontologia
```

---

## 10. M1 não deve fazer ainda

O M1 não deve começar criando campanhas, subindo criativos ou pausando anúncios.

Essas funções pertencem a módulos avançados posteriores.

O M1 deve focar em:

- cadastro;
- importação;
- organização;
- validação;
- consulta;
- estruturação dos clientes para os próximos módulos.

---

## 11. Critérios de aceite do M1

O M1 estará pronto quando:

- for possível representar uma empresa com 2 estados e 100 clínicas;
- for possível carregar as clínicas por arquivos JSON;
- for possível importar clínicas em massa;
- for possível validar configurações obrigatórias;
- for possível filtrar por empresa, grupo, segmento, estado, cidade e módulo;
- cada clínica puder ter módulos personalizados;
- cada clínica puder ter conta Meta Ads própria;
- cada clínica puder ter planilha própria ou compartilhada;
- a estrutura puder ser usada pelo próximo módulo Meta Ads -> Sheets.

---

## 12. Próximo módulo depois do M1

Após o M1, o próximo passo é o M2:

```text
M2 — Meta Ads Metrics Collector
```

O M2 usará a saída do M1 para:

- pegar todas as clínicas filtradas;
- validar contas `act_...`;
- puxar campanhas;
- puxar conjuntos;
- puxar criativos;
- normalizar métricas;
- entregar os dados ao módulo de planilhas.
