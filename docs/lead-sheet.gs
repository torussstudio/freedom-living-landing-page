/**
 * Freedom Living: website leads → Google Sheet
 *
 * Paste this into the Apps Script project of the "Freedom Living Lead Sheet" spreadsheet
 * (Extensions → Apps Script), then follow the steps in docs/lead-sheet-setup.md.
 *
 * The website's /api/lead function POSTs each lead here and this adds one row to the
 * "Landing Page Leads" tab. The tab and its header row are created automatically.
 */

const SHEET_NAME = 'Landing Page Leads';
const HEADERS = ['Sl No', 'Date', 'Name', 'Contact Number', 'Email', 'Lead Type', 'Details', 'Message', 'Our Contact Details'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // two leads arriving together must not get the same Sl No
  try {
    const data = JSON.parse(e.postData.contents);

    const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (!secret || data.secret !== secret) return reply({ ok: false, error: 'unauthorized' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const row = sheet.getLastRow() + 1;
    const values = [[
      row - 1,                 // Sl No
      data.date || '',
      data.name || '',
      data.phone || '',
      data.email || '',
      data.type || '',
      data.details || '',
      data.message || '',
      '',                      // Our Contact Details: filled in by hand (e.g. "Shared")
    ]];
    // columns B..I as plain text: keeps "+91 …" and the date from being turned into formulas / dates
    sheet.getRange(row, 2, 1, HEADERS.length - 1).setNumberFormat('@');
    sheet.getRange(row, 1, 1, HEADERS.length).setValues(values);

    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Open the web app URL in a browser to check it is live. */
function doGet() {
  return reply({ ok: true, service: 'Freedom Living leads' });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to set the shared secret (change the text first!). */
function setSecret() {
  PropertiesService.getScriptProperties().setProperty('SECRET', 'CHANGE-ME-to-a-long-random-string');
}
