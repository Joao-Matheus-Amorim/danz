const { google } = require('googleapis');
const { logger } = require('../utils/logger');

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!key) throw new Error('GOOGLE_PRIVATE_KEY não configurado.');
  return key.replace(/\\n/g, '\n');
}

function getAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL não configurado.');
  }

  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    getPrivateKey(),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

class GoogleSheetsClient {
  constructor() {
    this.sheets = null;
  }

  async getSheets() {
    if (this.sheets) return this.sheets;
    const auth = getAuth();
    await auth.authorize();
    this.sheets = google.sheets({ version: 'v4', auth });
    return this.sheets;
  }

  async validate(spreadsheetId) {
    const sheets = await this.getSheets();
    const response = await sheets.spreadsheets.get({ spreadsheetId, fields: 'properties.title,sheets.properties.title' });
    return response.data;
  }

  async ensureSheet(spreadsheetId, title) {
    const sheets = await this.getSheets();
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
    const exists = spreadsheet.data.sheets?.some((sheet) => sheet.properties.title === title);
    if (exists) return;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
    logger.info(`Aba criada: ${title}`);
  }

  async clearAndWrite(spreadsheetId, sheetName, rows, dryRun = false) {
    const values = rowsToValues(rows);

    if (dryRun) {
      logger.info(`[DRY RUN] Escreveria ${values.length} linhas em ${sheetName}`);
      return { dryRun: true, rows: values.length };
    }

    await this.ensureSheet(spreadsheetId, sheetName);
    const sheets = await this.getSheets();
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:Z` });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    logger.info(`Sheets atualizado: ${sheetName} (${Math.max(values.length - 1, 0)} registros)`);
    return { rows: values.length };
  }

  async appendRows(spreadsheetId, sheetName, rows, dryRun = false) {
    const values = rowsToValues(rows);
    if (values.length <= 1) return { rows: 0 };

    if (dryRun) {
      logger.info(`[DRY RUN] Acrescentaria ${values.length - 1} linhas em ${sheetName}`);
      return { dryRun: true, rows: values.length - 1 };
    }

    await this.ensureSheet(spreadsheetId, sheetName);
    const sheets = await this.getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: values.slice(1) },
    });
    return { rows: values.length - 1 };
  }
}

function rowsToValues(rows) {
  if (!rows || rows.length === 0) return [['sem_dados']];
  const headers = Object.keys(rows[0]);
  return [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))];
}

module.exports = { GoogleSheetsClient, rowsToValues };
