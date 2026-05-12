const { loadAllClients, loadClient, validateClientConfig } = require('../clientLoader');

describe('clientLoader', () => {
  test('loads Dental Leads YAML clients with YAML preferred over legacy JSON', () => {
    const clients = loadAllClients();
    const ids = clients.map((client) => client.id).filter(Boolean);

    expect(ids).toContain('dental-leads-sp');
    expect(ids).toContain('dental-leads-ba');

    const dentalSp = clients.find((client) => client.id === 'dental-leads-sp');
    expect(dentalSp.sourceFormat).toBe('yaml');
    expect(dentalSp.segment).toBe('odontologia');
    expect(dentalSp.state).toBe('SP');
    expect(dentalSp.units).toHaveLength(37);
  });

  test('loads one client by id', () => {
    const client = loadClient('dental-leads-ba');
    expect(client.id).toBe('dental-leads-ba');
    expect(client.state).toBe('BA');
    expect(client.units).toHaveLength(14);
  });

  test('validates required fields', () => {
    expect(() => validateClientConfig({ id: 'invalid' })).toThrow('Configuração de cliente inválida');
  });
});
