// Google Apps Script for handling submissions
// Deploy as Web App: Execute as me, Access: Anyone

const SHEET_ID = 'YOUR_SHEET_ID'; // Replace with actual Google Sheet ID

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const idToken = e.parameter.id_token || body.id_token || getAuthHeaderIdToken(e);
    const claims = verifyIdToken(idToken);
    const userEmail = claims.email;
    rateLimit(userEmail);

    const r = validateAndCoerce(body);
    r.userEmail = userEmail;
    r.userName = claims.name || '';
    appendRow(r);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getAuthHeaderIdToken(e) {
  const hdr = (e?.headers?.Authorization || e?.headers?.authorization || '').trim();
  if (hdr.startsWith('Bearer ')) return hdr.slice(7);
  throw new Error('Missing id_token');
}

function verifyIdToken(idToken) {
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  const claims = JSON.parse(res.getContentText());
  if (!claims.email_verified) throw new Error('Email not verified');
  // TODO: confirm claims.aud matches your Google OAuth client ID
  return claims;
}

function rateLimit(key) {
  const now = Date.now(), WINDOW_MS = 60 * 1000, MAX = 5;
  const store = PropertiesService.getScriptProperties();
  const raw = store.getProperty('rl:' + key) || '[]';
  const arr = JSON.parse(raw).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX) throw new Error('Rate limit exceeded');
  arr.push(now);
  store.setProperty('rl:' + key, JSON.stringify(arr));
}

function validateAndCoerce(b) {
  const num = (v) => (v === '' || v === null || v === undefined ? '' : Number(v));
  const lat = Number(b.latitude), lng = Number(b.longitude);
  if (!isFinite(lat) || !isFinite(lng)) throw new Error('Invalid coordinates');
  const pH = b.pH === '' ? '' : Number(b.pH);
  if (pH !== '' && (pH < 0 || pH > 14)) throw new Error('Invalid pH');
  return {
    timestamp: new Date().toISOString(),
    userEmail: '',
    userName: '',
    latitude: lat,
    longitude: lng,
    address: String(b.address || ''),
    pH,
    tds: num(b.tds),
    temperature: num(b.temperature),
    lead: num(b.lead),
    photoURLs: String(b.photoURLs || ''),
    notes: String(b.notes || '').slice(0, 500),
    verified: 'FALSE'
  };
}

function appendRow(r) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('WaterQualityTests');
  if (!sh) throw new Error('Missing sheet "WaterQualityTests"');
  sh.appendRow([
    r.timestamp, r.userEmail, r.userName, r.latitude, r.longitude, r.address,
    r.pH, r.tds, r.temperature, r.lead, r.photoURLs, r.notes, r.verified
  ]);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}