import { google } from "googleapis";

function getPrivateKey(): string {
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!key) throw new Error("GOOGLE_PRIVATE_KEY nao configurado.");
  return key.replace(/\\n/g, "\n");
}

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  if (!email) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL nao configurado.");

  return new google.auth.JWT(email, undefined, getPrivateKey(), [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
}

function rowsToValues(rows: Record<string, unknown>[]): unknown[][] {
  if (!rows || rows.length === 0) return [["sem_dados"]];
  const headers = Object.keys(rows[0]);
  return [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))];
}

export class GoogleSheetsClient {
  private sheets: ReturnType<typeof google.sheets> | null = null;

  private async getSheets() {
    if (this.sheets) return this.sheets;
    const auth = getAuth();
    await auth.authorize();
    this.sheets = google.sheets({ version: "v4", auth });
    return this.sheets;
  }

  async validate(spreadsheetId: string) {
    const sheets = await this.getSheets();
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "properties.title,sheets.properties.title",
    });
    return response.data;
  }

  private async ensureSheet(spreadsheetId: string, title: string): Promise<void> {
    const sheets = await this.getSheets();
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties.title",
    });
    const exists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === title
    );
    if (exists) return;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
  }

  async clearAndWrite(
    spreadsheetId: string,
    sheetName: string,
    rows: Record<string, unknown>[]
  ): Promise<{ rows: number }> {
    const values = rowsToValues(rows);

    await this.ensureSheet(spreadsheetId, sheetName);
    const sheets = await this.getSheets();
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:Z` });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    return { rows: values.length };
  }

  async appendRows(
    spreadsheetId: string,
    sheetName: string,
    rows: Record<string, unknown>[]
  ): Promise<{ rows: number }> {
    const values = rowsToValues(rows);
    if (values.length <= 1) return { rows: 0 };

    await this.ensureSheet(spreadsheetId, sheetName);
    const sheets = await this.getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: values.slice(1) },
    });
    return { rows: values.length - 1 };
  }
}
