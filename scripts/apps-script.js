// Google Apps Script for handling submissions
// Deploy as Web App: Execute as me, Access: Anyone
//
// IMPORTANT DEPLOYMENT NOTES:
// 1. When deploying, ensure "Execute as" is set to your account (to access the sheet)
// 2. Set "Who has access" to "Anyone" (to allow public form submissions)
// 3. After deployment, copy the Web App URL to use in app.js
// 4. CORS is automatically handled by Google Apps Script for web apps
// 5. If you get "Submission failed" errors, check:
//    - The deployment URL is correct
//    - The sheet ID below matches your Google Sheet
//    - The sheet has a tab named "WaterQualityTests"
//    - The deployed script has proper permissions

const SHEET_ID = '1hrf9LBCEXEQ97ZTXE3IXz9gp99cDE8x_E9mcVYYNDv4' // Replace with actual Google Sheet ID

function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID)
    const sh = ss.getSheetByName('WaterQualityTests')
    if (!sh) throw new Error('Missing sheet "WaterQualityTests"')

    const data = sh.getDataRange().getValues()
    if (data.length < 2) return json([]) // No data rows

    const headers = data[0]
    const rows = data.slice(1).map((row) => {
      const obj = {}
      headers.forEach((header, i) => {
        obj[header.toLowerCase()] = row[i]
      })
      return obj
    })

    return json(rows)
  } catch (err) {
    return json({ error: String(err) })
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}')

    // Check if we have an id_token (OAuth flow) or direct email (manual entry)
    let userEmail,
      userName = ''

    if (body.id_token) {
      // OAuth flow - verify token
      const claims = verifyIdToken(body.id_token)
      userEmail = claims.email
      userName = claims.name || ''
      rateLimit(userEmail)
    } else if (body.email) {
      // Manual email entry - basic validation
      userEmail = String(body.email).trim().toLowerCase()
      if (!userEmail.includes('@') || !userEmail.includes('.')) {
        throw new Error('Invalid email format')
      }
      // For manual entry, use a simpler rate limit based on email
      rateLimit(userEmail)
    } else {
      throw new Error('Either id_token or email is required')
    }

    const r = validateAndCoerce(body)
    r.userEmail = userEmail
    r.userName = userName
    appendRow(r)

    return json({ ok: true })
  } catch (err) {
    return json({ ok: false, error: String(err) })
  }
}

function getAuthHeaderIdToken(e) {
  const hdr = (e?.headers?.Authorization || e?.headers?.authorization || '').trim()
  if (hdr.startsWith('Bearer ')) return hdr.slice(7)
  throw new Error('Missing id_token')
}

function verifyIdToken(idToken) {
  const res = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true }
  )
  const claims = JSON.parse(res.getContentText())
  if (!claims.email_verified) throw new Error('Email not verified')
  // TODO: confirm claims.aud matches your Google OAuth client ID
  return claims
}

function rateLimit(key) {
  const now = Date.now(),
    WINDOW_MS = 60 * 1000,
    MAX = 5
  const store = PropertiesService.getScriptProperties()
  const raw = store.getProperty('rl:' + key) || '[]'
  const arr = JSON.parse(raw).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= MAX) throw new Error('Rate limit exceeded')
  arr.push(now)
  store.setProperty('rl:' + key, JSON.stringify(arr))
}

function validateAndCoerce(b) {
  const num = (v) => (v === '' || v === null || v === undefined ? '' : Number(v))
  const lat = Number(b.latitude),
    lng = Number(b.longitude)
  if (!isFinite(lat) || !isFinite(lng)) throw new Error('Invalid coordinates')
  const pH = b.pH === '' ? '' : Number(b.pH)
  if (pH !== '' && (pH < 0 || pH > 14)) throw new Error('Invalid pH')
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
    verified: 'FALSE',
  }
}

function appendRow(r) {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  const sh = ss.getSheetByName('WaterQualityTests')
  if (!sh) throw new Error('Missing sheet "WaterQualityTests"')
  sh.appendRow([
    r.timestamp,
    r.userEmail,
    r.userName,
    r.latitude,
    r.longitude,
    r.address,
    r.pH,
    r.tds,
    r.temperature,
    r.lead,
    r.photoURLs,
    r.notes,
    r.verified,
  ])
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}

function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT)
}
