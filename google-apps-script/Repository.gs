function rowsAsObjects_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.filter(function(row) { return row.some(function(value) { return value !== ''; }); }).map(function(row) {
    return headers.reduce(function(object, header, index) { object[header] = normalizeCell_(row[index]); return object; }, {});
  });
}

function normalizeCell_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ssXXX");
  return value;
}

function appendObject_(sheetName, object) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  const headers = APP.HEADERS[sheetName];
  sheet.appendRow(headers.map(function(header) { return object[header] === undefined ? '' : object[header]; }));
}

function getPublicConfig_() {
  const values = rowsAsObjects_(APP.SHEETS.CONFIG).reduce(function(result, row) {
    if (row.public === true || String(row.public).toLowerCase() === 'true') result[row.key] = row.value;
    return result;
  }, {});
  values.pricePerAdult = Number(values.pricePerAdult || 0);
  values.pricePerChild = Number(values.pricePerChild || 0);
  return values;
}

function sanitizeText_(value, maxLength, required) {
  const text = String(value === undefined || value === null ? '' : value).trim().slice(0, maxLength);
  if (required && !text) throw new Error('Preencha todos os campos obrigatórios.');
  if (/^[=+\-@]/.test(text)) return "'" + text;
  return text;
}

function saveParticipant_(input) {
  const statuses = ['confirmed', 'maybe', 'declined'];
  const status = statuses.indexOf(input.attendanceStatus) >= 0 ? input.attendanceStatus : 'confirmed';
  const email = sanitizeText_(input.email, 160, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.');
  const now = new Date();
  const participant = {
    id: Utilities.getUuid(), name: sanitizeText_(input.name, 160, true), email: email,
    phone: sanitizeText_(input.phone, 40, false), attendanceStatus: status,
    adultGuests: Math.min(10, Math.max(0, Number(input.adultGuests) || 0)),
    childGuests: Math.min(10, Math.max(0, Number(input.childGuests) || 0)),
    dietaryRestrictions: sanitizeText_(input.dietaryRestrictions, 600, false),
    notes: sanitizeText_(input.notes, 1000, false), createdAt: now, updatedAt: now
  };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { appendObject_(APP.SHEETS.PARTICIPANTS, participant); } finally { lock.releaseLock(); }
  return { id: participant.id };
}

function getPublicParticipants_() {
  return rowsAsObjects_(APP.SHEETS.PARTICIPANTS)
    .filter(function(row) { return row.attendanceStatus === 'confirmed'; })
    .map(function(row) { return { id: row.id, displayName: row.name, attendanceStatus: row.attendanceStatus, partySize: 1 + Number(row.adultGuests || 0) + Number(row.childGuests || 0) }; });
}

function getPublicSummary_() {
  const config = getPublicConfig_();
  const participants = rowsAsObjects_(APP.SHEETS.PARTICIPANTS).filter(function(row) { return row.attendanceStatus === 'confirmed'; });
  const payments = rowsAsObjects_(APP.SHEETS.PAYMENTS);
  const expenses = rowsAsObjects_(APP.SHEETS.EXPENSES);
  const confirmedGuests = participants.reduce(function(sum, row) { return sum + Number(row.adultGuests || 0) + Number(row.childGuests || 0); }, 0);
  const expectedRevenue = participants.reduce(function(sum, row) { return sum + Number(config.pricePerAdult || 0) * (1 + Number(row.adultGuests || 0)) + Number(config.pricePerChild || 0) * Number(row.childGuests || 0); }, 0);
  return {
    confirmedParticipants: participants.length, confirmedGuests: confirmedGuests,
    totalPeople: participants.length + confirmedGuests, expectedRevenue: expectedRevenue,
    confirmedRevenue: payments.filter(function(row) { return row.status === 'confirmed'; }).reduce(function(sum, row) { return sum + Number(row.reportedAmount || 0); }, 0),
    plannedExpenses: expenses.reduce(function(sum, row) { return sum + Number(row.plannedAmount || 0); }, 0),
    actualExpenses: expenses.reduce(function(sum, row) { return sum + Number(row.actualAmount || 0); }, 0)
  };
}

function sanitizeId_(value, required) {
  const id = String(value || '').trim();
  if (required && !id) throw new Error('Registro inválido.');
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Identificador de registro inválido.');
  }
  return id;
}

function nonnegativeNumber_(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(label + ' deve ser um número maior ou igual a zero.');
  return number;
}

function allowedValue_(value, allowed, label) {
  const text = String(value || '').trim();
  if (allowed.indexOf(text) < 0) throw new Error(label + ' inválido.');
  return text;
}

function optionalDate_(value) {
  const date = String(value || '').trim();
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Informe a data no formato AAAA-MM-DD.');
  return date;
}

function findRecord_(sheetName, id) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const headers = APP.HEADERS[sheetName];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0]) === id) {
      const record = headers.reduce(function(result, header, column) {
        result[header] = values[index][column];
        return result;
      }, {});
      return { row: index + 2, record: record };
    }
  }
  return null;
}

function upsertRecord_(sheetName, input) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSpreadsheet_().getSheetByName(sheetName);
    const headers = APP.HEADERS[sheetName];
    const id = sanitizeId_(input.id, false) || Utilities.getUuid();
    const existing = findRecord_(sheetName, id);
    const now = new Date();
    const record = Object.assign({}, input, {
      id: id,
      createdAt: existing ? existing.record.createdAt : now,
      updatedAt: now
    });
    const row = headers.map(function(header) { return record[header] === undefined ? '' : record[header]; });
    if (existing) sheet.getRange(existing.row, 1, 1, headers.length).setValues([row]);
    else sheet.appendRow(row);
    return id;
  } finally { lock.releaseLock(); }
}

function deleteRecord_(sheetName, value) {
  const id = sanitizeId_(value, true);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const existing = findRecord_(sheetName, id);
    if (!existing) throw new Error('Registro não encontrado.');
    getSpreadsheet_().getSheetByName(sheetName).deleteRow(existing.row);
  } finally { lock.releaseLock(); }
}

function savePayment_(input) {
  const participantId = sanitizeId_(input.participantId, true);
  const participantExists = rowsAsObjects_(APP.SHEETS.PARTICIPANTS).some(function(row) { return row.id === participantId; });
  if (!participantExists) throw new Error('Selecione um participante válido.');
  return upsertRecord_(APP.SHEETS.PAYMENTS, {
    id: input.id,
    participantId: participantId,
    expectedAmount: nonnegativeNumber_(input.expectedAmount, 'Valor esperado'),
    reportedAmount: nonnegativeNumber_(input.reportedAmount, 'Valor informado'),
    status: allowedValue_(input.status, ['pending', 'reported', 'confirmed'], 'Status'),
    paymentDate: optionalDate_(input.paymentDate),
    notes: sanitizeText_(input.notes, 1000, false)
  });
}

function saveExpense_(input) {
  return upsertRecord_(APP.SHEETS.EXPENSES, {
    id: input.id,
    item: sanitizeText_(input.item, 180, true),
    category: sanitizeText_(input.category, 120, true),
    supplier: sanitizeText_(input.supplier, 180, false),
    plannedAmount: nonnegativeNumber_(input.plannedAmount, 'Valor planejado'),
    actualAmount: nonnegativeNumber_(input.actualAmount, 'Valor realizado'),
    status: allowedValue_(input.status, ['planned', 'approved', 'paid', 'cancelled'], 'Status'),
    notes: sanitizeText_(input.notes, 1000, false)
  });
}

function savePurchase_(input) {
  return upsertRecord_(APP.SHEETS.PURCHASES, {
    id: input.id,
    item: sanitizeText_(input.item, 180, true),
    category: sanitizeText_(input.category, 120, true),
    quantity: nonnegativeNumber_(input.quantity, 'Quantidade'),
    unit: allowedValue_(input.unit, ['kg', 'L', 'un', 'pack', 'bag'], 'Unidade'),
    responsible: sanitizeText_(input.responsible, 160, false),
    status: allowedValue_(input.status, ['planned', 'assigned', 'purchased', 'cancelled'], 'Status'),
    notes: sanitizeText_(input.notes, 1000, false)
  });
}

function getAdminDashboard_() {
  const participants = rowsAsObjects_(APP.SHEETS.PARTICIPANTS);
  const payments = rowsAsObjects_(APP.SHEETS.PAYMENTS);
  const names = participants.reduce(function(result, row) { result[row.id] = row.name; return result; }, {});
  payments.forEach(function(payment) { payment.participantName = names[payment.participantId] || ''; });
  return { summary: getPublicSummary_(), participants: participants, payments: payments, expenses: rowsAsObjects_(APP.SHEETS.EXPENSES), purchases: rowsAsObjects_(APP.SHEETS.PURCHASES) };
}
