const {
  PENDING_AD_ACCOUNT_ERROR,
  summarizeRegistryValidation,
  validateAdAccount,
} = require('../clientRegistry');

describe('clientRegistry', () => {
  test('keeps pending ad account validation as JSON-safe fallback error', () => {
    expect(validateAdAccount('PREENCHER_ACT_SP')).toBe(PENDING_AD_ACCOUNT_ERROR);
  });

  test('groups pending ad account warnings by state and keeps real errors detailed', () => {
    const summary = summarizeRegistryValidation([
      {
        ok: false,
        unit: { name: 'Unidade SP 1', state: 'SP' },
        errors: [PENDING_AD_ACCOUNT_ERROR],
      },
      {
        ok: false,
        unit: { name: 'Unidade SP 2', state: 'SP' },
        errors: [PENDING_AD_ACCOUNT_ERROR],
      },
      {
        ok: false,
        unit: { name: 'Unidade BA 1', state: 'BA' },
        errors: [PENDING_AD_ACCOUNT_ERROR],
      },
      {
        ok: false,
        unit: { name: 'Unidade BA 2', state: 'BA' },
        errors: [PENDING_AD_ACCOUNT_ERROR, 'columns.leads obrigatório'],
      },
    ]);

    expect(summary.groupedPendingAdAccounts).toEqual([
      { state: 'BA', count: 2, units: ['Unidade BA 1', 'Unidade BA 2'] },
      { state: 'SP', count: 2, units: ['Unidade SP 1', 'Unidade SP 2'] },
    ]);
    expect(summary.detailedInvalid).toEqual([
      {
        ok: false,
        unit: { name: 'Unidade BA 2', state: 'BA' },
        errors: ['columns.leads obrigatório'],
      },
    ]);
  });
});
