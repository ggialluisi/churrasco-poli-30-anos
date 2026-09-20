function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'health');
    if (action === 'health') return json_({ ok: true, data: { status: 'ok' } });
    if (action === 'config') return json_({ ok: true, data: getPublicConfig_() });
    if (action === 'summary') return json_({ ok: true, data: getPublicSummary_() });
    if (action === 'participants') return json_({ ok: true, data: getPublicParticipants_() });
    throw new Error('Ação pública inválida.');
  } catch (error) { return errorResponse_(error); }
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = String(params.action || '');
    const payload = params.payload ? JSON.parse(params.payload) : {};
    if (action === 'confirmAttendance') return json_({ ok: true, data: saveParticipant_(payload) });
    if (action.indexOf('admin') === 0) {
      validateAdminCredential_(String(params.credential || ''));
      if (action === 'adminDashboard') return json_({ ok: true, data: getAdminDashboard_() });
      if (action === 'adminSavePayment') savePayment_(payload);
      else if (action === 'adminDeletePayment') deleteRecord_(APP.SHEETS.PAYMENTS, payload.id);
      else if (action === 'adminSaveExpense') saveExpense_(payload);
      else if (action === 'adminDeleteExpense') deleteRecord_(APP.SHEETS.EXPENSES, payload.id);
      else if (action === 'adminSavePurchase') savePurchase_(payload);
      else if (action === 'adminDeletePurchase') deleteRecord_(APP.SHEETS.PURCHASES, payload.id);
      else throw new Error('Ação administrativa inválida.');
      return json_({ ok: true, data: getAdminDashboard_() });
    }
    throw new Error('Ação inválida.');
  } catch (error) { return errorResponse_(error); }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse_(error) {
  console.error(error && error.stack ? error.stack : error);
  const message = error && error.message ? error.message : 'Erro interno.';
  return json_({ ok: false, error: message });
}

function validateAdminCredential_(credential) {
  if (!credential || credential.length > 5000) throw new Error('Credencial administrativa ausente ou inválida.');
  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential), { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error('Não foi possível validar a conta Google.');
  const token = JSON.parse(response.getContentText());
  const issuers = ['accounts.google.com', 'https://accounts.google.com'];
  const valid = issuers.indexOf(token.iss) >= 0 && token.aud === getGoogleClientId_() && token.email_verified === 'true' && token.email.toLowerCase() === getAdminEmail_() && Number(token.exp) * 1000 > Date.now();
  if (!valid) throw new Error('Esta conta não está autorizada para administrar o evento.');
  return token.email;
}
