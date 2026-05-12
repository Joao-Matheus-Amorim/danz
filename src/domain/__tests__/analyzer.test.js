const { classifyCreative, classifyCampaign, analyzeRows, onlyActionable } = require('../analyzer');

const rules = {
  minImpressionsToEvaluate: 500,
  maxSpendWithoutLeadBRL: 40,
  alertCplMaxBRL: 30,
  minSpendToEvaluateBRL: 20,
  minLeadsForWinner: 5,
  goodCplBRL: 20,
  minCtrGood: 1,
};

describe('analyzer', () => {
  test('classifies creative without spend and enough impressions as SEM_GASTO', () => {
    const result = classifyCreative({ gasto: 0, leads: 0, cpl: '', ctr: 0, impressoes: 600 }, rules);
    expect(result.status).toBe('SEM_GASTO');
    expect(result.severity).toBe('warning');
  });

  test('classifies creative with spend and no leads as SEM_LEAD_COM_GASTO', () => {
    const result = classifyCreative({ gasto: 45, leads: 0, cpl: '', ctr: 1, impressoes: 1000 }, rules);
    expect(result.status).toBe('SEM_LEAD_COM_GASTO');
    expect(result.action).toBe('PAUSE_OR_REBUILD');
  });

  test('classifies high CPL creative as CPL_ALTO', () => {
    const result = classifyCreative({ gasto: 100, leads: 2, cpl: 50, ctr: 2, impressoes: 1000 }, rules);
    expect(result.status).toBe('CPL_ALTO');
  });

  test('classifies winning creative as DESTAQUE', () => {
    const result = classifyCreative({ gasto: 100, leads: 10, cpl: 10, ctr: 2, impressoes: 1000 }, rules);
    expect(result.status).toBe('DESTAQUE');
    expect(result.action).toBe('SCALE_OR_ISOLATE_TEST');
  });

  test('classifies low CTR creative as CTR_BAIXO', () => {
    const result = classifyCreative({ gasto: 25, leads: 1, cpl: 25, ctr: 0.5, impressoes: 1000 }, rules);
    expect(result.status).toBe('CTR_BAIXO');
  });

  test('classifies normal creative as OK', () => {
    const result = classifyCreative({ gasto: 10, leads: 1, cpl: 10, ctr: 1, impressoes: 100 }, rules);
    expect(result.status).toBe('OK');
  });

  test('classifies campaign without lead as CAMPANHA_SEM_LEAD', () => {
    const result = classifyCampaign({ gasto: 45, leads: 0, cpl: '' }, rules);
    expect(result.status).toBe('CAMPANHA_SEM_LEAD');
  });

  test('analyzeRows adds analysis fields', () => {
    const analyzed = analyzeRows([{ gasto: 45, leads: 0, cpl: '', ctr: 1, impressoes: 1000 }], rules, 'creative');
    expect(analyzed[0].status_analise).toBe('SEM_LEAD_COM_GASTO');
    expect(analyzed[0].acao_sugerida).toBe('PAUSE_OR_REBUILD');
  });

  test('onlyActionable removes OK rows', () => {
    const rows = [
      { status_analise: 'OK', acao_sugerida: 'KEEP_RUNNING' },
      { status_analise: 'CPL_ALTO', acao_sugerida: 'PAUSE_OR_ADJUST' },
    ];
    expect(onlyActionable(rows)).toHaveLength(1);
    expect(onlyActionable(rows)[0].status_analise).toBe('CPL_ALTO');
  });
});
