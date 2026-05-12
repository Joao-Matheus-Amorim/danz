const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

let db = null;
let sqliteAvailable = null;

function sqliteEnabled() {
  return process.env.SQLITE_ENABLED !== 'false';
}

function databasePath() {
  return process.env.SQLITE_PATH || path.join(__dirname, '../../data/local/app.db');
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function loadSqlite() {
  if (!sqliteEnabled()) return null;
  if (sqliteAvailable === false) return null;

  try {
    // Lazy require keeps serverless/deploy environments from crashing if native module is unavailable.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require('better-sqlite3');
  } catch (error) {
    sqliteAvailable = false;
    logger.warn(`SQLite indisponível: ${error.message}. Persistência local desativada.`);
    return null;
  }
}

function getDb() {
  if (db) return db;

  const Database = loadSqlite();
  if (!Database) return null;

  const filePath = databasePath();
  ensureDir(filePath);
  db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      sent_at TEXT,
      channel TEXT NOT NULL,
      provider TEXT,
      client TEXT,
      type TEXT,
      severity TEXT,
      title TEXT,
      message TEXT,
      action TEXT,
      payload_json TEXT,
      status TEXT,
      provider_response_json TEXT
    );

    CREATE TABLE IF NOT EXISTS whatsapp_replies (
      id TEXT PRIMARY KEY,
      received_at TEXT NOT NULL,
      sender TEXT,
      text TEXT,
      interpreted_action TEXT,
      raw_body_json TEXT
    );

    CREATE TABLE IF NOT EXISTS job_runs (
      id TEXT PRIMARY KEY,
      task_key TEXT NOT NULL,
      mode TEXT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      status TEXT NOT NULL,
      result_json TEXT
    );

    CREATE TABLE IF NOT EXISTS job_run_steps (
      id TEXT PRIMARY KEY,
      job_run_id TEXT NOT NULL,
      step_key TEXT,
      label TEXT,
      status TEXT,
      at TEXT,
      details_json TEXT,
      FOREIGN KEY(job_run_id) REFERENCES job_runs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS unit_run_results (
      id TEXT PRIMARY KEY,
      job_run_id TEXT,
      company_id TEXT,
      unit_key TEXT,
      unit_name TEXT,
      state TEXT,
      city TEXT,
      sheet_name TEXT,
      status TEXT,
      cells INTEGER DEFAULT 0,
      matched_rows INTEGER DEFAULT 0,
      error TEXT,
      started_at TEXT,
      finished_at TEXT,
      details_json TEXT,
      FOREIGN KEY(job_run_id) REFERENCES job_runs(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_job_runs_started_at ON job_runs(started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_unit_run_results_job_run_id ON unit_run_results(job_run_id);
  `);
}

function persistenceAvailable() {
  return Boolean(getDb());
}

function resetDbForTests() {
  if (db) db.close();
  db = null;
  sqliteAvailable = null;
}

module.exports = {
  getDb,
  persistenceAvailable,
  databasePath,
  resetDbForTests,
};
