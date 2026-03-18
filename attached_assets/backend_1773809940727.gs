/**
 * ============================================================
 * SCHOLAR INDIA PUBLISHERS — ERP BACKEND
 * Google Apps Script Web App
 * ============================================================
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to your Google Sheet → Extensions → Apps Script
 * 2. Replace all code with this file
 * 3. Deploy → Manage Deployments → Edit → New Version → Deploy
 * 4. Copy the Web App URL and paste into all HTML files (WEB_APP_URL constant)
 * ============================================================
 */

const SHEET_ID = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

// ─── CORS HELPER ────────────────────────────────────────────
function corsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok(data)  { return corsResponse({ status: 'success', data: data }); }
function err(msg)  { return corsResponse({ status: 'error', message: msg }); }

// ─── SHEET HELPERS ───────────────────────────────────────────
function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function readSheet(sheetName) {
  const ws = getSheet(sheetName);
  if (!ws) return null;
  const data = ws.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const results = [];
  for (let i = 1; i < data.length; i++) {
    let hasData = false;
    const row = {};
    headers.forEach((h, idx) => {
      const key = String(h).trim();
      if (key) {
        row[key] = data[i][idx];
        if (data[i][idx] !== '' && data[i][idx] !== null) hasData = true;
      }
    });
    if (hasData) results.push(row);
  }
  return results;
}

function appendToSheet(sheetName, mapping) {
  const ws = getSheet(sheetName);
  if (!ws) return false;
  const headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0];
  const newRow = headers.map(h => {
    const key = String(h).trim();
    return mapping[key] !== undefined ? mapping[key] : '';
  });
  ws.appendRow(newRow);
  return true;
}

function updateRow(sheetName, idColumn, idValue, updates) {
  const ws = getSheet(sheetName);
  if (!ws) return { ok: false, msg: 'Sheet not found: ' + sheetName };
  const data = ws.getDataRange().getValues();
  const headers = data[0];
  const trim = s => String(s).replace(/\s+/g, '').toLowerCase();
  const targetIdCol = trim(idColumn);
  const idColIdx = headers.findIndex(h => trim(h) === targetIdCol);
  if (idColIdx === -1) return { ok: false, msg: 'Column not found: ' + idColumn };
  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    let currentVal = data[i][idColIdx];
    let sheetValStr = String(currentVal).trim();
    let searchValStr = String(idValue).trim();

    // Matching logic
    if (sheetValStr === searchValStr) {
      targetRow = i + 1;
      break;
    }

    // Advanced date match (ISO vs Sheet Date vs Formatted String)
    let sheetDate = null;
    let searchDate = null;

    if (currentVal instanceof Date) {
      sheetDate = currentVal;
    } else if (sheetValStr.includes('-') || sheetValStr.includes('/')) {
      sheetDate = new Date(sheetValStr);
    }

    if (searchValStr.includes('T') && searchValStr.includes('Z')) {
      searchDate = new Date(searchValStr);
    } else if (searchValStr.includes('-') || searchValStr.includes('/')) {
      searchDate = new Date(searchValStr);
    }

    if (sheetDate && searchDate && !isNaN(sheetDate.getTime()) && !isNaN(searchDate.getTime())) {
      // 1. Precise timestamp match
      if (sheetDate.getTime() === searchDate.getTime()) {
        targetRow = i + 1;
        break;
      }
      
      // 2. Tolerance match (2 seconds) for precision loss
      if (Math.abs(sheetDate.getTime() - searchDate.getTime()) < 2000) { 
        targetRow = i + 1;
        break;
      }

      // 3. Formatted string match (Year-Month-Day Hour:Min:Sec)
      // This helps if the sheet stored a string via nowStr() but the lookup is a Date object, or vice-versa
      const f = d => Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      if (f(sheetDate) === f(searchDate)) {
        targetRow = i + 1;
        break;
      }
    }
  }
  if (targetRow === -1) return { ok: false, msg: 'Row not found: ' + idValue };
  Object.keys(updates).forEach(colName => {
    const targetCol = trim(colName);
    const colIdx = headers.findIndex(h => trim(h) === targetCol);
    if (colIdx !== -1) ws.getRange(targetRow, colIdx + 1).setValue(updates[colName]);
  });
  return { ok: true };
}

function ensureSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let ws = ss.getSheetByName(name);
  if (!ws) {
    ws = ss.insertSheet(name);
    ws.appendRow(headers);
  }
  return ws;
}

function nowStr() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// ─── GET HANDLER ─────────────────────────────────────────────
// ─── GET HANDLER ─────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action;
    const result = handleAction(action, e.parameter);
    
    // If handleAction returns a response that's already a TextOutput (unlikely now)
    if (result && typeof result.getContent === 'function') return result;
    
    // Check if result is an error object from a sub-action (for batching consistency)
    if (result && result._isError) return err(result.message);
    
    return ok(result);
  } catch (ex) {
    return err('Server error: ' + ex.toString());
  }
}

/**
 * Core logic for all GET actions.
 * Returns raw data which doGet then wraps in ok() or err().
 */
function handleAction(action, params) {
  if (action === 'batch') {
    let actions = params.actions;
    if (typeof actions === 'string') {
      try { actions = JSON.parse(actions); } catch(e) { actions = []; }
    }
    if (!Array.isArray(actions)) actions = [];
    
    const results = {};
    actions.forEach(a => {
      try {
        const subParams = { ...params, ...a };
        const res = handleAction(a.action, subParams);
        results[a.action] = { status: 'success', data: res };
      } catch (ex) {
        results[a.action] = { status: 'error', message: ex.toString() };
      }
    });
    return results;
  }

  if (action === 'getManuscripts') {
    const d = readSheet('Manuscript');
    if (d === null) throw new Error('Sheet Manuscript not found');
    return d;
  }

  if (action === 'trackManuscript') {
    const msId = params.msId;
    const d = readSheet('Manuscript');
    if (d === null) throw new Error('Sheet not found');
    const found = d.find(r => String(r['Manuscript ID']).trim() === String(msId).trim());
    if (!found) throw new Error('Manuscript not found');
    return found;
  }

  if (action === 'getReviewers') {
    const d = readSheet('Reviewers');
    if (d === null) throw new Error('Reviewers sheet not found');
    return d;
  }

  if (action === 'getPayments') {
    const d = readSheet('Payment');
    if (d === null) throw new Error('Payment sheet not found');
    return d;
  }

  if (action === 'getBooks') {
    const d = readSheet('Books');
    if (d === null) throw new Error('Books sheet not found');
    return d;
  }

  if (action === 'getAssignments') {
    const d = readSheet('Assignments');
    if (d === null) throw new Error('Assignments sheet not found');
    return d;
  }

  if (action === 'getContact') {
    const d = readSheet('Contact');
    if (d === null) throw new Error('Contact sheet not found');
    return d;
  }

  if (action === 'getMessages') {
    const userId = params.userId;
    let d = readSheet('Messages');
    if (d === null) d = [];
    if (userId) {
      d = d.filter(m =>
        String(m['To']) === String(userId) ||
        String(m['From']) === String(userId) ||
        String(m['To']) === 'admin' ||
        String(m['From']) === 'admin'
      );
    }
    return d;
  }

  if (action === 'getPopups') {
    const now = new Date();
    let d = readSheet('Popups');
    if (d === null) d = [];
    const active = d.filter(p => {
      const target = String(p['Target'] || 'all');
      const userId = params.userId || '';
      const matchTarget = target === 'all' || target === userId;
      const start = p['Start Time'] ? new Date(p['Start Time']) : null;
      const end   = p['End Time']   ? new Date(p['End Time'])   : null;
      const inWindow = (!start || now >= start) && (!end || now <= end);
      return matchTarget && inWindow;
    });
    return active;
  }

  if (action === 'getLoginActivity') {
    const d = readSheet('Activity Log');
    if (d === null) throw new Error('Activity Log sheet not found');
    return d;
  }

  if (action === 'getCopyright') {
    const d = readSheet('Copyright');
    if (d === null) throw new Error('Copyright sheet not found');
    return d || [];
  }

  if (action === 'getFinalPapers') {
    const d = readSheet('Final Paper');
    if (d === null) throw new Error('Final Paper sheet not found');
    return d || [];
  }

  if (action === 'getAllData') {
    return {
      assignments: readSheet('Assignments') || [],
      manuscripts: readSheet('Manuscript') || [], 
      reviewers: readSheet('Reviewers') || [],
      copyrights: readSheet('Copyright') || [],
      finalPapers: readSheet('Final Paper') || []
    };
  }

  if (action === 'getNewsletter') {
    const d = readSheet('Newsletter');
    if (d === null) throw new Error('Newsletter sheet not found');
    return d || [];
  }

  if (action === 'getPerformance') {
    const assignments = readSheet('Assignments') || [];
    const reviewers = readSheet('Reviewers') || [];
    const perfMap = {};
    assignments.forEach(a => {
      const rid = String(a['ReviewerID'] || '').trim();
      if (!rid) return;
      if (!perfMap[rid]) perfMap[rid] = { total: 0, completed: 0, pending: 0, revoked: 0 };
      perfMap[rid].total++;
      const st = String(a['Status'] || '').toLowerCase();
      if (st === 'completed' || st === 'approved') perfMap[rid].completed++;
      else if (st === 'revoked') perfMap[rid].revoked++;
      else perfMap[rid].pending++;
    });
    return reviewers.map(r => {
      const rid = String(r['Reviewer ID'] || '').trim();
      const perf = perfMap[rid] || { total: 0, completed: 0, pending: 0, revoked: 0 };
      return {
        'Reviewer ID': rid,
        'Name': (r['First Name'] || '') + ' ' + (r['Last Name'] || ''),
        'Role': r['Role'] || '',
        'Journal': r['Journal'] || '',
        'Status': r['Status'] || '',
        ...perf,
        'Completion Rate': perf.total > 0 ? Math.round((perf.completed / perf.total) * 100) + '%' : '0%'
      };
    });
  }

  if (action === 'getReviews') {
    let d = readSheet('Assignments') || [];
    return d.filter(a => {
      const hasReview = a['Recommendation'] || a['OverallMarks'];
      const notApproved = String(a['Status'] || '').toLowerCase() !== 'approved';
      return hasReview && notApproved;
    });
  }

  if (action === 'login') {
    const email    = String(params.email || '').toLowerCase().trim();
    const password = String(params.password || '').trim();
    const role     = String(params.role || 'member').toLowerCase();

    if (email === 'editor@scholarindiapub.com' && password === 'Edupertz@004') {
      return { role: 'Editor', name: 'Global Editor', id: 'EDITOR001', authenticated: true };
    }

    const reviewers = readSheet('Reviewers') || [];
    const findVal = (row, patterns) => {
      const keys = Object.keys(row);
      for (let p of patterns) {
        const k = keys.find(key => key.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p.toLowerCase().replace(/[^a-z0-9]/g, '')));
        if (k && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return String(row[k]).trim();
      }
      return '';
    };
    const getID = (row) => {
      const k = Object.keys(row).find(key => key.toLowerCase().replace(/[^a-z0-9]/g, '').includes('reviewerid'));
      return k ? String(row[k]).trim() : String(row[Object.keys(row)[0]]).trim();
    };

    if (role === 'admin') {
      if (email === 'admin@scholarindia.com' && password === 'admin123') {
        return { role: 'Admin', name: 'Admin', id: 'ADMIN001', authenticated: true };
      }
      const u = reviewers.find(r => {
        const userEmail = String(r['Email'] || '').toLowerCase().trim();
        if (userEmail !== email) return false;
        const status = findVal(r, ['Status']) || '';
        if (status.toLowerCase() !== 'active' && status.toLowerCase() !== 'approved') return false;
        const rRole = (r['Role'] || '').toLowerCase();
        if (rRole !== 'admin') return false;
        const customPass = findVal(r, ['New Password - Y', 'New Password', 'Password']);
        const defaultPass = getID(r);
        return password === (customPass || defaultPass);
      });
      if (u) {
        const name = findVal(u, ['First Name', 'Name']) + ' ' + (u['Last Name'] || '');
        return { role: u['Role'], name: name.trim(), id: getID(u), authenticated: true };
      }
      throw new Error('Invalid credentials');
    }

    const u = reviewers.find(r => {
      const userEmail = String(r['Email'] || '').toLowerCase().trim();
      if (userEmail !== email) return false;
      const status = findVal(r, ['Status']) || '';
      const isValidStatus = status.toLowerCase() === 'active' || status.toLowerCase() === 'approved';
      if (!isValidStatus) return false;
      const customPass = findVal(r, ['New Password - Y', 'New Password', 'Password']);
      const defaultPass = getID(r);
      return password === (customPass || defaultPass);
    });
    
    if (u) {
      const name = findVal(u, ['First Name', 'Name']) + ' ' + (u['Last Name'] || '');
      return { role: u['Role'], name: name.trim(), id: getID(u), authenticated: true };
    }
    throw new Error('Invalid credentials or account not active');
  }

  throw new Error('Unknown action: ' + action);
}

// ─── POST HANDLER ─────────────────────────────────────────────
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) return err('No payload');
    const p = JSON.parse(e.postData.contents);
    const action = p.action;

    if (action === 'batch') {
      const result = handleAction('batch', p);
      return ok(result);
    }

    // ── SUBMIT MANUSCRIPT ──────────────────────────────────
    if (action === 'submitManuscript') {
      const newId = 'SIP' + new Date().getFullYear() + Math.floor(Math.random() * 9000 + 1000);
      appendToSheet('Manuscript', {
        'Manuscript ID': newId,
        'Submitted Date': nowStr(),
        'Author Name': p.authorName || '',
        'Designation': p.designation || '',
        'Department': p.department || '',
        'Organization': p.institution || '',
        'Email': p.email || '',
        'Mobile': p.phone || '',
        'Journal': p.journal || '',
        'Manuscript Title': p.title || '',
        'Area': p.area || '',
        'Author Count': p.authorCount || '',
        'Authors Details': p.authorsDetails || '',
        'Uploaded File': p.fileUrl || '',
        'Status': 'Submitted'
      });
      return ok({ manuscriptId: newId });
    }

    // ── APPLY REVIEWER / CREATE USER ─────────────────────
    if (action === 'applyReviewer' || action === 'createUser') {
      const newId = 'REV' + new Date().getFullYear() + Math.floor(Math.random() * 9000 + 1000);
      appendToSheet('Reviewers', {
        'Reviewer ID': newId,
        'Submitted Date': nowStr(),
        'First Name': p.firstName || p.name || '',
        'Last Name': p.lastName || '',
        'Email': p.email || '',
        'Mobile': p.phone || '',
        'Role': p.role || 'Reviewer',
        'Designation': p.designation || '',
        'Area of Interest': p.areaOfInterest || '',
        'Journal': p.journal || '',
        'ORCID': p.orcid || '',
        'Google Scholar': p.scholarId || '',
        'Institution': p.institution || '',
        'State': p.state || '',
        'Status': action === 'createUser' ? (p.status || 'Active') : 'Pending',
        'Password': p.password || ''
      });
      return ok({ reviewerId: newId });
    }

    // ── UPDATE STATUS (generic) ────────────────────────────
    if (action === 'updateStatus') {
      const r = updateRow(p.sheetName, p.idColumn, p.idValue, p.updates || {});
      return r.ok ? ok({ message: 'Updated successfully' }) : err(r.msg);
    }

    // ── ASSIGN MANUSCRIPT ──────────────────────────────────
    if (action === 'assignManuscript') {
      const existing = readSheet('Assignments') || [];
      const active = existing.filter(a =>
        String(a['ManuscriptID']) === String(p.manuscriptId) &&
        String(a['Status'] || '').toLowerCase() !== 'revoked'
      );
      if (active.length >= 3) return err('Maximum 3 reviewers already assigned to this manuscript.');

      appendToSheet('Assignments', {
        'AssignedAt': nowStr(),
        'ManuscriptID': p.manuscriptId || '',
        'ManuscriptTitle': p.manuscriptTitle || '',
        'ReviewerID': p.reviewerId || '',
        'ReviewerFullName': p.reviewerName || '',
        'ReviewerEmail': p.reviewerEmail || '',
        'DueDate': p.dueDate || '',
        'Status': 'Pending',
        'ManuscriptLink': p.manuscriptLink || ''
      });
      return ok({ message: 'Success' });
    }

    // ── SEND MESSAGE ──────────────────────────────────────
    if (action === 'sendMessage') {
      ensureSheet('Messages', ['Message ID','From','From Name','To','To Name','Message','Timestamp','Read']);
      const msgId = 'MSG' + Date.now();
      appendToSheet('Messages', {
        'Message ID': msgId,
        'From': p.from || '',
        'From Name': p.fromName || '',
        'To': p.to || '',
        'To Name': p.toName || '',
        'Message': p.message || '',
        'Timestamp': nowStr(),
        'Read': 'false'
      });
      return ok({ messageId: msgId });
    }

    // ── MARK MESSAGE READ ─────────────────────────────────
    if (action === 'markMessageRead') {
      const r = updateRow('Messages', 'Message ID', p.messageId, { 'Read': 'true' });
      return r.ok ? ok('Marked read') : err(r.msg);
    }

    // ── BROADCAST POPUP ───────────────────────────────────
    if (action === 'broadcastPopup') {
      ensureSheet('Popups', ['Popup ID','Title','Message','Target','Start Time','End Time','Created By','Created At']);
      const pid = 'POP' + Date.now();
      appendToSheet('Popups', {
        'Popup ID': pid,
        'Title': p.title || '',
        'Message': p.message || '',
        'Target': p.target || 'all',
        'Start Time': p.startTime || '',
        'End Time': p.endTime || '',
        'Created By': p.createdBy || 'Admin',
        'Created At': nowStr()
      });
      return ok({ popupId: pid });
    }

    // ── CHANGE PASSWORD ───────────────────────────────────
    if (action === 'changePassword') {
      const r = updateRow('Reviewers', 'Reviewer ID', p.reviewerId, {
        'New Password - Y': p.newPassword,
        'Password Changed': nowStr()
      });
      return r.ok ? ok('Password updated') : err(r.msg);
    }

    // ── LOG ACTIVITY ──────────────────────────────────────
    if (action === 'logActivity') {
      ensureSheet('Activity Log', ['Timestamp','User ID','User Name','Role','Action','Details','Page']);
      appendToSheet('Activity Log', {
        'Timestamp': nowStr(),
        'User ID': p.userId || '',
        'User Name': p.userName || '',
        'Role': p.role || '',
        'Action': p.action_type || p.activity || '',
        'Details': p.details || '',
        'Page': p.page || ''
      });
      return ok('Logged');
    }

    // ── REVOKE ASSIGNMENT ─────────────────────────────────
    if (action === 'revokeAssignment') {
                                                      // Target row by AssignedAt or (MSID+RID)
      const r = updateRow('Assignments', 'AssignedAt', p.assignedAt, {
        'Status': 'Revoked',
        'Notes': p.note || ''
      });
      return r.ok ? ok('Revoked') : err(r.msg);
    }

    // ── SEND REMINDER ──────────────────────────────────────
    if (action === 'sendReminder') {
      const r = updateRow('Assignments', 'AssignedAt', p.assignedAt, {
        'Reviewer Email Status': 'Reminder Sent: ' + nowStr()
      });
      return r.ok ? ok('Reminder recorded') : err(r.msg);
    }

    // ── APPROVE / REJECT REVIEW ───────────────────────────
    if (action === 'approveReview') {
      const r = updateRow('Assignments', 'AssignedAt', p.assignedAt, {
        'Status': p.decision === 'Approved' ? 'Approved' : 'Pending',
        'Notes': 'Admin Note: ' + (p.note || '')
      });
      return r.ok ? ok('Review decision recorded') : err(r.msg);
    }

    // ── SUBMIT REVIEW (member side) ───────────────────────
    if (action === 'submitReview') {
      const updates = {
        'Importance': p.importance || '',
        'Title Feedback': p.titleFeedback || '',
        'Abstract Feedback': p.abstractFeedback || '',
        'Scientific Correctness': p.scientific || '',
        'References Feedback': p.referencesFeedback || '',
        'Language Quality': p.language || '',
        'General Comments': p.generalComments || '',
        'Ethical Issues': p.ethicalIssues || '',
        'Ethical Details': p.ethicalDetails || '',
        'Competing Interests': p.competingInterests || '',
        'Plagiarism Suspected': p.plagiarismSuspected || '',
        'OverallMarks': p.marks || '',
        'Recommendation': p.recommendation || '',
        'Submission Date': nowStr(),
        'Status': 'Completed',
        'Reviews Submitted': 'true'
      };
      const r = updateRow('Assignments', 'AssignedAt', p.assignedAt, updates);
      return r.ok ? ok('Review submitted') : err(r.msg);
    }

    // ── SUBMIT CONTACT ─────────────────────────────────────
    if (action === 'submitContact') {
      appendToSheet('Contact', {
        'Submitted At': nowStr(),
        'First Name': p.firstName || '',
        'Last Name': p.lastName || '',
        'Email': p.email || '',
        'Phone Number': p.phone || '',
        'Type of Enquiry': p.type || '',
        'Subject': p.subject || '',
        'Message': p.message || '',
        'Make as Read': 'No',
        'Replied': 'No',
        'Read': 'No'
      });
      return ok('Contact submitted');
    }

    // ── SUBMIT COPYRIGHT ─────────────────────────────────────
    if (action === 'submitCopyright') {
      ensureSheet('Copyright', ['Manuscript ID', 'Author Name', 'Email', 'Publication Title', 'Submission Date', 'File Link', 'Status']);
      appendToSheet('Copyright', {
        'Manuscript ID': p.manuscriptId || '',
        'Author Name': p.authorName || '',
        'Email': p.email || '',
        'Publication Title': p.title || '',
        'Submission Date': nowStr(),
        'File Link': p.fileUrl || '',
        'Status': p.status || 'Submitted'
      });
      return ok('Copyright submitted');
    }

    // ── SUBMIT FINAL PAPER ──────────────────────────────────
    if (action === 'submitFinalPaper') {
      ensureSheet('Final Paper', ['Manuscript ID', 'Author Name', 'Email', 'Manuscript Title', 'Submission Date', 'File Link', 'Status']);
      appendToSheet('Final Paper', {
        'Manuscript ID': p.manuscriptId || '',
        'Author Name': p.authorName || '',
        'Email': p.email || '',
        'Manuscript Title': p.title || '',
        'Submission Date': nowStr(),
        'File Link': p.fileUrl || '',
        'Status': p.status || 'Submitted'
      });
      return ok('Final paper submitted');
    }

    // ── SUBMIT BOOK ────────────────────────────────────────
    if (action === 'submitBook') {
      const refNo = 'BK' + new Date().getFullYear() + Math.floor(Math.random() * 9000 + 1000);
      appendToSheet('Books', {
        'Submitted Date': nowStr(),
        'Book Ref Number': refNo,
        'Book Title': p.bookTitle || '',
        'Publication Type': p.publicationType || '',
        'Author Name': p.authorName || '',
        'Email': p.email || '',
        'Mobile': p.phone || '',
        'Institution': p.institution || '',
        'Subject Area': p.subjectArea || '',
        'Expected Pages': p.expectedPages || '',
        'Abstract': p.abstract || '',
        'Status': 'Submitted',
        'Read': 'No'
      });
      return ok({ bookRefNumber: refNo });
    }

    // ── ADD PAYMENT (Admin manual entry) ──────────────────
    if (action === 'addPayment') {
      const success = appendToSheet('Payment', p.data || {});
      return success ? ok('Payment added successfully') : err('Failed to add payment');
    }

    return err('Unknown action: ' + action);
  } catch (ex) {
    return err('Server error: ' + ex.toString());
  }
}
