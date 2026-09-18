const APP = Object.freeze({
  SHEETS: {
    CONFIG: 'Config', PARTICIPANTS: 'Participants', PAYMENTS: 'Payments',
    EXPENSES: 'Expenses', PURCHASES: 'Purchases'
  },
  HEADERS: {
    Config: ['key', 'value', 'public'],
    Participants: ['id', 'name', 'email', 'phone', 'attendanceStatus', 'adultGuests', 'childGuests', 'dietaryRestrictions', 'notes', 'createdAt', 'updatedAt'],
    Payments: ['id', 'participantId', 'expectedAmount', 'reportedAmount', 'status', 'paymentDate', 'notes', 'createdAt', 'updatedAt'],
    Expenses: ['id', 'item', 'category', 'supplier', 'plannedAmount', 'actualAmount', 'status', 'notes', 'createdAt', 'updatedAt'],
    Purchases: ['id', 'item', 'category', 'quantity', 'unit', 'responsible', 'status', 'notes', 'createdAt', 'updatedAt']
  },
  PUBLIC_CONFIG_KEYS: [
    'eventName', 'eventSubtitle', 'eventDate', 'eventStartTime', 'eventEndTime',
    'eventAddress', 'mapsUrl', 'pricePerAdult', 'pricePerChild', 'pixKey',
    'paymentDeadline', 'confirmationDeadline', 'organizerName', 'organizerContact'
  ]
});

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID não foi configurado nas propriedades do script.');
  return SpreadsheetApp.openById(id);
}

function getAdminEmail_() {
  const email = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
  if (!email) throw new Error('ADMIN_EMAIL não foi configurado nas propriedades do script.');
  return email.trim().toLowerCase();
}

function getGoogleClientId_() {
  const id = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_ID');
  if (!id) throw new Error('GOOGLE_CLIENT_ID não foi configurado nas propriedades do script.');
  return id.trim();
}

function setupSpreadsheet() {
  const spreadsheet = getSpreadsheet_();
  Object.keys(APP.HEADERS).forEach(function(name) {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(APP.HEADERS[name]);
      sheet.getRange(1, 1, 1, APP.HEADERS[name].length).setFontWeight('bold').setBackground('#17322d').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  });
  seedConfig_();
  return 'Planilha configurada com sucesso.';
}

function seedConfig_() {
  const sheet = getSpreadsheet_().getSheetByName(APP.SHEETS.CONFIG);
  if (sheet.getLastRow() > 1) return;
  const values = {
    eventName: 'POLI — Engenharia Química', eventSubtitle: 'Churrasco de 30 anos de formados',
    eventDate: '', eventStartTime: '12:00', eventEndTime: '20:00', eventAddress: 'Local a confirmar', mapsUrl: '',
    pricePerAdult: '0', pricePerChild: '0', pixKey: 'A confirmar', paymentDeadline: '', confirmationDeadline: '',
    organizerName: 'Comissão organizadora', organizerContact: ''
  };
  const rows = APP.PUBLIC_CONFIG_KEYS.map(function(key) { return [key, values[key], true]; });
  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
}
