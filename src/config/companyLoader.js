const fs = require('fs');
const path = require('path');

const COMPANIES_DIR = path.join(__dirname, '../../data/companies');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listCompanies() {
  if (!fs.existsSync(COMPANIES_DIR)) return [];
  return fs.readdirSync(COMPANIES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson(path.join(COMPANIES_DIR, file)));
}

function getCompany(companyId) {
  return listCompanies().find((company) => company.id === companyId || company.name === companyId) || null;
}

module.exports = {
  listCompanies,
  getCompany,
};
