function parseArgs(argv = process.argv.slice(2)) {
  const command = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'run';
  const flags = new Set(argv.filter((item) => item.startsWith('--') && !item.includes('=')));
  const values = {};

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) continue;
    const clean = item.slice(2);
    if (clean.includes('=')) {
      const [key, ...rest] = clean.split('=');
      values[key] = rest.join('=');
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      values[clean] = argv[i + 1];
      i += 1;
    } else {
      values[clean] = true;
    }
  }

  const scope = {
    company: values.company || values.empresa || values.companyId || null,
    group: values.group || values.grupo || null,
    segment: values.segment || values.segmento || null,
    state: values.state || values.estado || values.uf || null,
    city: values.city || values.cidade || null,
    module: values.module || values.modulo || null,
  };

  return {
    command,
    client: values.client || values.cliente || 'all',
    since: values.since || values.inicio || null,
    until: values.until || values.fim || null,
    dryRun: flags.has('--dry-run') || values['dry-run'] === true,
    noActions: flags.has('--no-actions') || values['no-actions'] === true,
    limit: values.limit ? Number(values.limit) : null,
    scope,
  };
}

module.exports = { parseArgs };
