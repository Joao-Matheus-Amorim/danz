const { getSegmentAdapter, odontologiaAdapter, genericAdapter } = require('../index');

describe('segment adapters', () => {
  test('resolves odontologia adapter by segment', () => {
    expect(getSegmentAdapter('odontologia')).toBe(odontologiaAdapter);
  });

  test('falls back to generic adapter for unknown segments', () => {
    expect(getSegmentAdapter('imobiliaria')).toBe(genericAdapter);
  });

  test('odontologia adapter matches shared account campaigns by contains, exact and ids', () => {
    const unit = {
      meta: { mode: 'shared_ad_account' },
      campaignMatch: {
        contains: ['Clínica São João'],
        exact: ['Campanha Exata'],
        ids: ['123'],
      },
    };

    expect(odontologiaAdapter.matchMetricToUnit({ campaign_name: 'Lead - Clinica Sao Joao - Maio' }, unit)).toBe(true);
    expect(odontologiaAdapter.matchMetricToUnit({ campanha: 'campanha exata' }, unit)).toBe(true);
    expect(odontologiaAdapter.matchMetricToUnit({ campaign_id: '123' }, unit)).toBe(true);
    expect(odontologiaAdapter.matchMetricToUnit({ campaign_name: 'Outra unidade' }, unit)).toBe(false);
  });

  test('odontologia adapter filters rows only for shared ad accounts', () => {
    const rows = [
      { campaign_name: 'Pimentas - Maio', leads: 2 },
      { campaign_name: 'Outra clínica', leads: 5 },
    ];

    const sharedUnit = {
      meta: { mode: 'shared_ad_account' },
      campaignMatch: { contains: ['Pimentas'] },
    };
    const singleUnit = {
      meta: { mode: 'single_ad_account' },
      campaignMatch: { contains: ['Pimentas'] },
    };

    expect(odontologiaAdapter.filterRowsForUnit(rows, sharedUnit)).toEqual([rows[0]]);
    expect(odontologiaAdapter.filterRowsForUnit(rows, singleUnit)).toEqual(rows);
  });

  test('odontologia adapter parses fields and builds sheet updates', () => {
    const selectedFields = odontologiaAdapter.parseFields('leads,value,cpl');
    const updates = odontologiaAdapter.buildFieldUpdates({
      unit: {
        columns: { leads: 'B', value: 'C', cpl: 'D' },
        emptyMode: 'zero',
      },
      sheetName: 'SP Maio',
      row: 12,
      total: { leads: 4, value: 100 },
      selectedFields,
    });

    expect(updates).toEqual([
      { range: "'SP Maio'!B12", values: [[4]] },
      { range: "'SP Maio'!C12", values: [[100]] },
      { range: "'SP Maio'!D12", values: [[25]] },
    ]);
  });
});
