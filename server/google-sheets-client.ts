import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Replit connector environment not configured');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheets not connected. Please set up the Google Sheets integration in Replit.');
  }
  return accessToken;
}

export async function getGoogleSheetsClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

// Append a row to any sheet (auto-creates sheet with headers if missing)
export async function appendToSheet(sheetName: string, rowData: any[]) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Define headers for specific sheet types
    const sheetHeaders: { [key: string]: string[] } = {
      'Final Paper': [
        'SubmittedAt', 'ManuscriptID', 'Journal Name', 'Article Title',
        'All Authors', 'Corresponding Author', 'Corresponding Email', 'Corresponding Phone',
        'Corresponding Address', 'Corresponding Affiliation', 'Supporting Authors',
        'Revision Notes', 'Paper File URL',
        'Conflict of Interest', 'Conflict Details', 'Funding Support', 'Funding Details',
        'Copyright Agreement Accepted', 'Copyright File URL',
        'Payment Method', 'Transaction ID', 'Payment Notes', 'Status'
      ]
    };

    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    let sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);

    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      console.log(`📍 Sheet "${sheetName}" not found, creating it with headers...`);
      const headers = sheetHeaders[sheetName] || [];
      
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: { rowCount: 1000, columnCount: Math.max(26, headers.length) }
              }
            }
          }]
        }
      });
      console.log(`✅ Created sheet: ${sheetName}`);

      // Add headers if defined
      if (headers.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers]
          }
        });
        console.log(`✅ Added headers to ${sheetName}`);
      }
    }

    // Append the data row starting from column A
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData]
        }
      });
    } catch (appendError: any) {
      if (appendError.message?.includes('Unable to parse range') || 
          appendError.code === 400) {
        // Fallback: get the last row and append data there
        try {
          const allData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:A`
          });
          const nextRow = (allData.data.values?.length || 0) + 1;
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${nextRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [rowData]
            }
          });
        } catch (fallbackError) {
          throw fallbackError || appendError;
        }
      } else {
        throw appendError;
      }
    }

    console.log(`✅ Row appended to ${sheetName}`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Error appending to ${sheetName}:`, error.message);
    throw error;
  }
}

// Initialize all sheets with proper headers
export async function initializeAllSheetHeaders() {
  try {
    console.log('📋 Sheet headers initialization skipped - please add headers manually to row 1 of each sheet');
    console.log('ℹ️  Header specifications are documented in replit.md');
  } catch (error: any) {
    console.error('❌ Error initializing sheet headers:', error.message);
  }
}

// Helper to ensure sheet exists and has proper headers
async function ensureSheetHeaders(sheets: any, spreadsheetId: string, sheetName: string, headers: string[]) {
  try {
    console.log(`📍 Initializing ${sheetName} with ${headers.length} columns...`);
    
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    let sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
    let sheetId = sheet?.properties?.sheetId;
    
    if (!sheet) {
      console.log(`   Creating new sheet: ${sheetName}`);
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: headers.length
                }
              }
            }
          }]
        }
      });
      sheetId = addSheetResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;
    }

    // Add headers to first row
    console.log(`   Adding headers to ${sheetName}...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    console.log(`✅ ${sheetName} ready with ${headers.length} columns`);
  } catch (error: any) {
    console.error(`Error setting up ${sheetName}:`, error.message);
  }
}

// Get manuscript status for tracking
export async function getManuscriptStatus(manuscriptId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // 1. Get Manuscript details from 'Manuscript' sheet
    // A=ID, B=SubmittedAt, C=Author, G=Email, I=Journal, J=Title, O=Status
    const msResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manuscript!A:P'
    });
    const msRows = msResponse.data.values || [];
    const msRow = msRows.find(row => row[0] === manuscriptId);

    if (!msRow) return null;

    // 2. Get Payment status from 'Payment' sheet
    // B=ManuscriptID, R=Status
    const payResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Payment!A:R'
    });
    const payRows = payResponse.data.values || [];
    // Skip header and find by Manuscript ID (Column B, index 1)
    const payRow = payRows.slice(1).find(row => row[1] === manuscriptId);
    const paymentStatus = payRow ? (payRow[17] || 'Pending') : 'Pending';

    return {
      manuscriptId: msRow[0],
      submittedAt: msRow[1],
      authorName: msRow[2],
      journal: msRow[8],
      title: msRow[9],
      status: msRow[14] || 'Submitted', // Column O
      paymentStatus: paymentStatus, // Column R
      doi: msRow[15] || '' // Column P
    };
  } catch (error: any) {
    console.error('Error getting manuscript status:', error.message);
    return null;
  }
}

// Get all reviewers
export async function getReviewersAll() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A:W'
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    const headers = rows[0] || [];
    return rows.slice(1).map((row: any[]) => {
      const record: any = {};
      headers.forEach((header: string, idx: number) => {
        // Normalize header names to match what the code expects
        const key = header.trim();
        record[key] = row[idx] || '';
      });
      return record;
    }).filter((r: any) => r['Reviewer ID']);
  } catch (error: any) {
    console.error('Error searching reviewers:', error.message);
    return [];
  }
}

// Get reviewer profile
export async function getReviewerProfile(email: string, reviewerId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A:W'
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return null;
    
    for (const row of rows.slice(1)) {
      if ((row[0] === reviewerId || row[4] === email) && row[4] === email) {
        return {
          reviewerId: row[0],
          submittedDate: row[1] || '',
          firstName: row[2],
          lastName: row[3],
          email: row[4],
          mobile: row[5],
          role: row[6],
          designation: row[7],
          areaOfInterest: row[8],
          journal: row[9],
          orcid: row[10],
          googleScholar: row[11],
          institution: row[12],
          state: row[13],
          district: row[14],
          pinNumber: row[15],
          nationality: row[16],
          messageToEditor: row[17],
          profilePdfLink: row[18],
          status: row[19],
          reviewsSubmitted: row[20],
          lastSubmissionDate: row[21],
          newPassword: row[22]
        };
      }
    }
    return null;
  } catch (error: any) {
    console.error('Error getting reviewer profile:', error.message);
    return null;
  }
}

// Search for a specific reviewer
export async function searchReviewer(email: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A:Z'
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return null;
    
    for (const row of rows.slice(1)) {
      if (row[4] && row[4].toString().toLowerCase().trim() === email.toLowerCase().trim()) {
        return {
          reviewerId: row[0],
          submittedDate: row[1] || '',
          firstName: row[2],
          lastName: row[3],
          email: row[4],
          mobile: row[5],
          role: row[6],
          designation: row[7],
          areaOfInterest: row[8],
          journal: row[9],
          orcid: row[10],
          googleScholar: row[11],
          institution: row[12],
          state: row[13],
          district: row[14],
          pinNumber: row[15],
          nationality: row[16],
          messageToEditor: row[17],
          profilePdfLink: row[18],
          status: row[19],
          reviewsSubmitted: row[20],
          lastSubmissionDate: row[21],
          newPassword: row[22]
        };
      }
    }
    return null;
  } catch (error: any) {
    console.error('Error searching reviewer:', error.message);
    return null;
  }
}

// Authenticate reviewer login
export async function authenticateReviewer(email: string, password: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A:Z'
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return { success: false, message: 'Invalid email or password' };
    
    for (const row of rows.slice(1)) {
      if (row[4] === email) {
        // Column W (index 22) = New Password, Column A (index 0) = Reviewer ID
        const newPassword = row[22] || '';
        const reviewerId = row[0];
        
        // Check if password matches either Reviewer ID or New Password
        if (password === reviewerId || password === newPassword) {
          // Check status - Column T (index 19)
          const status = row[19] || 'Pending';
          if (status.toLowerCase() !== 'active') {
            return { 
              success: false, 
              message: `Your account status is currently "${status}". Please wait for administrator activation.` 
            };
          }

          return {
            success: true,
            reviewer: {
              reviewerId: row[0],
              email: row[4],
              firstName: row[2],
              lastName: row[3],
              role: row[6],
              journal: row[9]
            }
          };
        }
      }
    }
    return { success: false, message: 'Invalid email or password' };
  } catch (error: any) {
    console.error('Error authenticating reviewer:', error.message);
    return { success: false, message: error.message };
  }
}

// Get assigned manuscripts for a reviewer
export async function getAssignedManuscripts(reviewerId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Assignments columns: A=assignedAt, B=reviewerId, C=manuscriptId, D=dueDate, E=notes, F=status, G=manuscriptLink, H=recommendation, I=overallMarks, J=reviewerEmail
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });

    const rows = response.data.values || [];
    const manuscriptAssignments: any = {};
    
    for (const row of rows) {
      // row[1] = reviewerId, row[2] = manuscriptId, row[3] = dueDate, row[5] = status, row[6] = manuscriptLink, row[7] = recommendation, row[8] = marks, row[9] = reviewerEmail
      if (row && row[1] && row[2] && row[1] === reviewerId) {
        const status = (row[5] || 'Pending').toLowerCase();
        manuscriptAssignments[row[2]] = {
          dueDate: row[3] || '',
          assignmentStatus: row[5] || 'Pending',
          manuscriptLink: row[6] || '',
          recommendation: row[7] || '',
          overallMarks: row[8] || '',
          reviewerEmail: row[9] || '',
          // Determine if review was submitted based on status or has recommendation
          isReviewCompleted: status.includes('completed') || status.includes('submitted') || !!row[7]
        };
      }
    }

    const manuscriptIds = new Set(Object.keys(manuscriptAssignments));
    if (manuscriptIds.size === 0) return [];

    // Get manuscript details - updated column order:
    // A=ID, B=SubmittedAt, C=Author, D=Designation, E=Dept, F=Affiliation, G=Email, H=Mobile, I=Journal, J=Title, K=ResearchField, L=AuthorCount, M=AuthorNames, N=FileURL, O=Status
    const manuscriptResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manuscript!A2:Z1000'
    });

    const manuscriptRows = manuscriptResponse.data.values || [];
    const assigned = [];
    
    for (const msRow of manuscriptRows) {
      if (manuscriptIds.has(msRow[0])) {
        const assignment = manuscriptAssignments[msRow[0]];
        assigned.push({
          manuscriptId: msRow[0],           // A = Manuscript ID
          submittedAt: msRow[1],            // B = Submitted At
          authorName: msRow[2],             // C = First Author Name
          email: msRow[6],                  // G = Email
          mobile: msRow[7],                 // H = Mobile
          journal: msRow[8],                // I = Journal Type
          title: msRow[9],                  // J = Manuscript Title
          fileUrl: msRow[13],               // N = File URL (Google Drive link)
          status: assignment.assignmentStatus || msRow[14],  // Use assignment status
          dueDate: assignment.dueDate,
          manuscriptLink: assignment.manuscriptLink || msRow[13],
          recommendation: assignment.recommendation,
          overallMarks: assignment.overallMarks,
          isReviewCompleted: assignment.isReviewCompleted
        });
      }
    }

    return assigned;
  } catch (error: any) {
    console.error('Error getting assigned manuscripts:', error.message);
    return [];
  }
}

// Get assigned manuscripts for admin
export async function getAssignedManuscriptsForAdmin() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });

    const rows = response.data.values || [];
    return rows.map((row: any[]) => ({
      assignedAt: row[0],
      reviewerId: row[1],
      manuscriptId: row[2],
      dueDate: row[3],
      notes: row[4],
      status: row[5],
      manuscriptLink: row[6],
      recommendation: row[7],
      overallMarks: row[8],
      reviewerEmail: row[9]
    }));
  } catch (error: any) {
    console.error('Error fetching admin assignments:', error.message);
    return [];
  }
}

// Get all submitted reviews
export async function getSubmittedReviews() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ReviewFormUploads!A:D'
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // No data rows
    
    const reviews = rows.slice(1).map((row: any[]) => ({
      reviewerId: row[0] || '',
      manuscriptId: row[1] || '',
      uploadDate: row[2] || '',
      fileUrl: row[3] || '',
      status: 'Submitted'
    })).filter((r: any) => r.reviewerId);

    return reviews;
  } catch (error: any) {
    console.error('Error getting submitted reviews:', error.message);
    return [];
  }
}

// Get deadline calendar data - assignments grouped by due date
export async function getDeadlineCalendarData() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Get all assignments
    const assignmentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });
    const assignmentRows = assignmentsResponse.data.values || [];

    // Get reviewer names
    const reviewersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A2:Z1000'
    });
    const reviewerRows = reviewersResponse.data.values || [];
    const reviewerMap: any = {};
    for (const row of reviewerRows) {
      reviewerMap[row[0]] = { firstName: row[2], lastName: row[3], email: row[4] };
    }

    // Get manuscript titles
    const manuscriptsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manuscript!A2:Z1000'
    });
    const manuscriptRows = manuscriptsResponse.data.values || [];
    const manuscriptMap: any = {};
    for (const row of manuscriptRows) {
      manuscriptMap[row[0]] = { title: row[10], journal: row[1] };
    }

    // Build calendar data grouped by date
    const calendarData: any = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const assignment of assignmentRows) {
      const dueDate = assignment[3];
      if (!dueDate) continue;

      const date = new Date(dueDate);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];
      const reviewerId = assignment[1];
      const manuscriptId = assignment[2];

      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dueDate,
          dateObj: date,
          isPast: date < today,
          count: 0,
          assignments: []
        };
      }

      calendarData[dateKey].count++;
      calendarData[dateKey].assignments.push({
        reviewerId,
        manuscriptId,
        status: assignment[5],
        reviewer: reviewerMap[reviewerId],
        manuscript: manuscriptMap[manuscriptId],
        assignedAt: assignment[0],
        notes: assignment[4],
        dueDate
      });
    }

    // Sort by date
    const sortedDates = Object.keys(calendarData)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return sortedDates.map(date => calendarData[date]);
  } catch (error: any) {
    console.error('Error getting deadline calendar:', error.message);
    return [];
  }
}

// Get reviewer performance metrics
export async function getReviewerPerformanceMetrics() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Get all reviewers
    const reviewersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A2:Z1000'
    });
    const reviewerRows = reviewersResponse.data.values || [];

    // Get all assignments
    const assignmentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });
    const assignmentRows = assignmentsResponse.data.values || [];

    // Calculate metrics per reviewer
    const metrics: any[] = [];

    for (const reviewerRow of reviewerRows) {
      const reviewerId = reviewerRow[0];
      const firstName = reviewerRow[2];
      const lastName = reviewerRow[3];
      const email = reviewerRow[4];
      const status = reviewerRow[19];

      // Find all assignments for this reviewer
      const assignments = assignmentRows.filter((a: any[]) => a[1] === reviewerId);
      const completedAssignments = assignments.filter((a: any[]) => a[5] === 'Completed');

      // Calculate turnaround time
      let totalDaysToComplete = 0;
      let completedCount = 0;
      for (const assignment of completedAssignments) {
        const dueDate = new Date(assignment[3]);
        const submissionDate = new Date(assignment[0]);
        const daysToComplete = Math.ceil((submissionDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        totalDaysToComplete += daysToComplete;
        completedCount++;
      }

      const avgTurnaroundDays = completedCount > 0 ? Math.round(totalDaysToComplete / completedCount) : 0;
      const completionRate = assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0;

      metrics.push({
        reviewerId,
        firstName,
        lastName,
        email,
        status,
        totalAssigned: assignments.length,
        completed: completedAssignments.length,
        completionRate,
        avgTurnaroundDays
      });
    }

    return metrics.sort((a, b) => b.completionRate - a.completionRate);
  } catch (error: any) {
    console.error('Error getting reviewer performance metrics:', error.message);
    return [];
  }
}

// Accept a review (admin approval)
export async function acceptReview(reviewerId: string, manuscriptId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Get Assignments sheet to find the row
    const assignmentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });

    const rows = assignmentsResponse.data.values || [];
    let rowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][1] === reviewerId && rows[i][2] === manuscriptId) {
        rowIdx = i;
        break;
      }
    }

    if (rowIdx === -1) {
      return { success: false, message: 'Assignment not found' };
    }

    // Update status to "Completed"
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Assignments!F${rowIdx + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Completed']]
      }
    });

    // Log review acceptance activity
    await logActivityToSheet({
      adminEmail: 'Admin',
      action: 'Accept Review',
      reviewerId,
      manuscriptId,
      details: `Review accepted for manuscript ${manuscriptId} by reviewer ${reviewerId}`,
      status: 'Success',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    // Count completed reviews for this manuscript
    const allAssignments = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });
    
    const manuscriptRows = (allAssignments.data.values || []).filter((row: any[]) => row[2] === manuscriptId && row[5] === 'Completed');
    const completedCount = manuscriptRows.length;

    // If 2+ completed reviews, update manuscript status to "Accepted"
    let manuscriptAccepted = false;
    if (completedCount >= 2) {
      const manuscriptsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Manuscript!A2:Z1000'
      });

      const manuscriptRowsData = manuscriptsResponse.data.values || [];
      let msRowIdx = -1;
      for (let i = 0; i < manuscriptRowsData.length; i++) {
        if (manuscriptRowsData[i][0] === manuscriptId) {
          msRowIdx = i;
          break;
        }
      }

      if (msRowIdx !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Manuscript!Q${msRowIdx + 2}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['Accepted']]
          }
        });
        manuscriptAccepted = true;
        console.log(`✅ Manuscript ${manuscriptId} status automatically updated to "Accepted" (${completedCount} reviews completed)`);
      }
    }

    return { 
      success: true, 
      message: manuscriptAccepted ? 'Review accepted. Manuscript status updated to Accepted!' : 'Review accepted successfully',
      manuscriptAccepted,
      completedCount
    };
  } catch (error: any) {
    console.error('Error accepting review:', error.message);
    return { success: false, message: error.message };
  }
}

// Reject a review
export async function rejectReview(reviewerId: string, manuscriptId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Get Assignments sheet to find the row
    const assignmentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });

    const rows = assignmentsResponse.data.values || [];
    let rowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][1] === reviewerId && rows[i][2] === manuscriptId) {
        rowIdx = i;
        break;
      }
    }

    if (rowIdx === -1) {
      return { success: false, message: 'Assignment not found' };
    }

    // Update status to "Rejected"
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Assignments!F${rowIdx + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Rejected']]
      }
    });

    return { success: true, message: 'Review rejected successfully' };
  } catch (error: any) {
    console.error('Error rejecting review:', error.message);
    return { success: false, message: error.message };
  }
}

// Get review status for a manuscript
export async function getReviewStatusForManuscript(reviewerId: string, manuscriptId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Check ReviewFormUploads sheet
    const reviewFormsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ReviewFormUploads!A2:D1000'
    });

    const reviewForms = reviewFormsResponse.data.values || [];
    const hasReviewFormRecord = reviewForms.some((row: any[]) => row[0] === reviewerId && row[1] === manuscriptId);

    // Check Assignments sheet for status
    const assignmentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });

    const assignments = assignmentsResponse.data.values || [];
    let status = 'Pending';
    for (const row of assignments) {
      if (row[1] === reviewerId && row[2] === manuscriptId) {
        status = row[5] || 'Pending';
        break;
      }
    }

    // Review is considered submitted if:
    // 1. There's a record in ReviewFormUploads, OR
    // 2. The assignment status is "Completed" or "Submitted"
    const isCompleted = status.toLowerCase().includes('completed') || status.toLowerCase().includes('submitted');
    const reviewSubmitted = hasReviewFormRecord || isCompleted;

    return {
      reviewSubmitted,
      reviewStatus: status
    };
  } catch (error: any) {
    console.error('Error getting review status:', error.message);
    return { reviewSubmitted: false, reviewStatus: 'Error' };
  }
}

// Auto-assign under review manuscripts
export async function autoAssignUnderReviewManuscripts() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Get all manuscripts with "Under Review" status
    const manuscriptsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manuscript!A2:Z1000'
    });

    const manuscripts = (manuscriptsResponse.data.values || []).filter((row: any[]) => row[14] === 'Under Review');

    // Get active reviewers
    const reviewersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A2:Z1000'
    });

    const activeReviewers = (reviewersResponse.data.values || []).filter((row: any[]) => row[19] === 'Active').map((row: any[]) => row[0]);

    if (activeReviewers.length === 0) {
      return { success: false, message: 'No active reviewers available for assignment' };
    }

    // Get current assignments to track round-robin
    const assignmentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A1:Z1000'
    });

    const assignmentRows = assignmentsResponse.data.values || [];
    let lastReviewerIdx = 0;

    // Assign manuscripts
    let assignedCount = 0;
    for (const manuscript of manuscripts) {
      const manuscriptId = manuscript[0];

      // Check if already assigned
      const alreadyAssigned = assignmentRows.some((row: any[]) => row[2] === manuscriptId);
      if (alreadyAssigned) continue;

      // Find next reviewer in round-robin
      const reviewer = activeReviewers[lastReviewerIdx % activeReviewers.length];
      lastReviewerIdx++;

      // Add assignment
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Assignments!A:Z',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            new Date().toLocaleString(),
            reviewer,
            manuscriptId,
            dueDate.toLocaleDateString(),
            'Auto-assigned',
            'Pending Review',
            '',
            '',
            ''
          ]]
        }
      });

      assignedCount++;
    }

    return { success: true, message: `Auto-assigned ${assignedCount} manuscript(s)`, assignedCount };
  } catch (error: any) {
    console.error('Error auto-assigning manuscripts:', error.message);
    return { success: false, message: error.message };
  }
}

// Get reviewers for approval (pending status)
export async function getReviewersForApproval() {
  try {
    const reviewers = await getReviewersAll();
    return reviewers.filter((r: any) => r['Status'] === 'Pending' || r['Status'] === 'Process');
  } catch (error: any) {
    console.error('Error getting reviewers for approval:', error.message);
    return [];
  }
}

// Get editorial board members for approval
export async function getEditorialBoardForApproval() {
  try {
    const reviewers = await getReviewersAll();
    return reviewers.filter((r: any) => (r['Status'] === 'Pending' || r['Status'] === 'Process') && (r['Role'] === 'Editor' || r['Role'] === 'Editorial Board Member'));
  } catch (error: any) {
    console.error('Error getting editorial board for approval:', error.message);
    return [];
  }
}

// Get all manuscripts
export async function getManuscriptsAll() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manuscript!A2:Z10000'
    });

    const rows = response.data.values || [];
    console.log(`📚 Fetched ${rows.length} manuscript rows from Google Sheets`);
    if (rows.length > 0) {
      console.log(`📄 First row sample (columns 0-14):`, rows[0].slice(0, 15));
    }
    
    const manuscripts = rows.map((row: any[]) => ({
      'Manuscript ID': row[0],
      'Submitted At': row[1],
      'First Author Name': row[2],
      'Designation': row[3],
      'Department': row[4],
      'Affiliation': row[5],
      'Email': row[6],
      'Mobile': row[7],
      'Journal Type': row[8],
      'Manuscript Title': row[9],
      'Research Field': row[10],
      'Author Count': row[11],
      'Author Names': row[12],
      'File URL': row[13],           // Column N = Google Drive File URL
      'Status': row[14],
      'DOI': row[15]
    })).filter((m: any) => m['Manuscript ID']);
    
    console.log(`✅ Final: ${manuscripts.length} manuscripts after filtering empty IDs`);
    manuscripts.forEach(m => console.log(`   - ${m['Manuscript ID']}: ${m['Status']}`));
    return manuscripts;
  } catch (error: any) {
    console.error('Error getting manuscripts:', error.message);
    return [];
  }
}

// Log login activity to Google Sheets
export async function logLoginActivityToSheet(activityData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Append to Activity Log sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Activity Log!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          activityData.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          activityData.email || '',
          'Reviewer Login',
          activityData.reviewerId || '',
          activityData.role || 'Reviewer',
          `IP: ${activityData.ipAddress || 'N/A'} | Journal: ${activityData.journal || 'N/A'}`
        ]]
      }
    });
    
    console.log('✅ Login activity logged for', activityData.reviewerId);
  } catch (error: any) {
    console.warn('Could not log login to sheet:', error.message);
  }
}

// Log activity to sheet (for admin actions)
export async function logActivityToSheet(activityData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Append to Activity Log sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Activity Log!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          activityData.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          activityData.adminEmail || activityData.email || 'system',
          activityData.action || '',
          activityData.reviewerId || activityData.manuscriptId || '',
          activityData.status || 'Success',
          activityData.details || ''
        ]]
      }
    });
    
    console.log('✅ Activity logged:', activityData.action);
  } catch (error: any) {
    console.warn('Could not log activity to sheet:', error.message);
  }
}

// Update reviewer password in sheet
export async function updateReviewerPasswordInSheet(email: string, reviewerId: string, newPassword: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A2:Z1000'
    });

    const rows = response.data.values || [];
    let rowIdx = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][4] === email || rows[i][0] === reviewerId) {
        rowIdx = i;
        break;
      }
    }

    if (rowIdx === -1) {
      throw new Error('Reviewer not found');
    }

    // Update column W (index 22) - New Password
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Reviewers!W${rowIdx + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newPassword]]
      }
    });

    console.log(`✅ Password updated for ${reviewerId}`);
    return true;
  } catch (error: any) {
    console.error('Error updating password:', error.message);
    throw error;
  }
}

// Submit reviewer application
export async function submitReviewerApplication(reviewerData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const reviewerId = reviewerData.reviewerId;

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Reviewers!A:X',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          reviewerId,
          new Date().toLocaleDateString(),
          reviewerData.firstName,
          reviewerData.lastName,
          reviewerData.email,
          reviewerData.mobile,
          reviewerData.role,
          reviewerData.designation,
          reviewerData.areaOfInterest,
          reviewerData.journal,
          reviewerData.orcid,
          reviewerData.googleScholar,
          reviewerData.institution,
          reviewerData.state,
          reviewerData.district,
          reviewerData.pinNumber,
          reviewerData.nationality,
          reviewerData.messageToEditor,
          reviewerData.institutionalProfilePage,
          reviewerData.profilePdfLink,
          'Pending'
        ]]
      }
    });

    return reviewerId;
  } catch (error: any) {
    console.error('Error submitting reviewer application:', error.message);
    throw error;
  }
}

// Submit manuscript
export async function submitManuscript(manuscriptData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Manuscript ID    Submitted Date  Author Name     Designation     Department      Organization    Email   Mobile  Journal         Manuscript Title        Area    Author Count    Authors Details         Uploaded File   Status
    const values = [[
      manuscriptData.manuscriptId || '',
      manuscriptData.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      manuscriptData.authorName || manuscriptData.firstAuthorName || '',
      manuscriptData.designation || '',
      manuscriptData.department || '',
      manuscriptData.organisation || manuscriptData.affiliation || '',
      manuscriptData.email || '',
      manuscriptData.mobile || '',
      manuscriptData.journalType || '',
      manuscriptData.manuscriptTitle || manuscriptData.title || '',
      manuscriptData.researchField || '',
      manuscriptData.allAuthorsCount || manuscriptData.authorNames?.length || '1',
      manuscriptData.authorsDetails || (manuscriptData.authorNames?.join(', ') || ''),
      manuscriptData.manuscriptLink || manuscriptData.fileUrl || '',
      'Under Review'
    ]];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Manuscript!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });

    console.log(`✅ Manuscript ${manuscriptData.manuscriptId} recorded in Google Sheets`);
    return manuscriptData.manuscriptId;
  } catch (error: any) {
    console.error('Error submitting manuscript:', error.message);
    throw error;
  }
}

// Update reviewer status in Google Sheets
export async function updateReviewerStatus(reviewerId: string, status: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviewers!A2:Z1000'
    });

    const rows = response.data.values || [];
    let rowIdx = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === reviewerId) {
        rowIdx = i;
        break;
      }
    }

    if (rowIdx === -1) {
      throw new Error(`Reviewer ${reviewerId} not found`);
    }

    // Status is in column T (index 19)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Reviewers!T${rowIdx + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]]
      }
    });

    console.log(`✅ Reviewer status updated to ${status} for ${reviewerId}`);
    return true;
  } catch (error: any) {
    console.error('Error updating reviewer status:', error.message);
    throw error;
  }
}

// Search reviewer by email, mobile, or reviewer ID
export async function searchReviewerByEmailOrMobile(email?: string, mobile?: string, reviewerId?: string) {
  try {
    const reviewers = await getReviewersAll();
    
    let results = reviewers;
    
    if (reviewerId) {
      results = results.filter(r => 
        (r['Reviewer ID'] || r.reviewerId)?.toUpperCase().includes(reviewerId.toUpperCase())
      );
    }

    if (email) {
      results = results.filter(r => 
        (r['Email'] || r.email)?.toLowerCase().includes(email.toLowerCase())
      );
    }

    if (mobile) {
      results = results.filter(r => 
        (r['Mobile'] || r.mobile)?.includes(mobile)
      );
    }
    
    // Map from Google Sheets format to API format
    const mapped = results.map((r: any) => ({
      reviewerId: r['Reviewer ID'] || r.reviewerId || '',
      firstName: r['First Name'] || r.firstName || '',
      lastName: r['Last Name'] || r.lastName || '',
      email: r['Email'] || r.email || '',
      mobile: r['Mobile'] || r.mobile || '',
      role: r['Role'] || r.role || '',
      designation: r['Designation'] || r.designation || '',
      journal: r['Journal'] || r.journal || '',
      nationality: r['Nationality'] || r.nationality || '',
      status: r['Status'] || r.status || '',
      submittedDate: r['Submitted Date'] || r.submittedDate || '',
      areaOfInterest: r['Area of Interest'] || r.areaOfInterest || '',
      institution: r['Institution'] || r.institution || '',
      state: r['State'] || r.state || '',
      district: r['District'] || r.district || '',
      pinNumber: r['Pin Number'] || r.pinNumber || '',
      orcid: r['ORCID'] || r.orcid || '',
      googleScholar: r['Google Scholar'] || r.googleScholar || '',
      messageToEditor: r['Message to Editor'] || r.messageToEditor || '',
      profilePdfLink: r['Profile PDF Link'] || r.profilePdfLink || ''
    }));
    
    return { success: true, reviewers: mapped };
  } catch (error: any) {
    console.error('Error searching reviewers:', error.message);
    return { success: false, reviewers: [], error: error.message };
  }
}

// Search manuscript by email, manuscript ID, or mobile number
export async function searchManuscriptByEmailOrId(email?: string, manuscriptId?: string, mobile?: string) {
  try {
    const manuscripts = await getManuscriptsAll();
    
    let results = manuscripts;
    
    if (manuscriptId) {
      results = results.filter(m => 
        m['Manuscript ID']?.toUpperCase().includes(manuscriptId.toUpperCase())
      );
    }
    
    if (email) {
      results = results.filter(m => 
        m['Email']?.toLowerCase().includes(email.toLowerCase())
      );
    }

    if (mobile) {
      results = results.filter(m => 
        m['Mobile']?.includes(mobile)
      );
    }
    
    return { success: true, manuscripts: results };
  } catch (error: any) {
    console.error('Error searching manuscripts:', error.message);
    return { success: false, manuscripts: [], error: error.message };
  }
}

// Email Templates Management
export async function getEmailTemplates() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EmailTemplates!A:E'
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // No data rows
    
    return rows.slice(1).map((row: any[]) => ({
      id: row[0] || '',
      name: row[1] || '',
      subject: row[2] || '',
      body: row[3] || '',
      createdAt: row[4] || ''
    })).filter((t: any) => t.id);
  } catch (error: any) {
    console.error('Error fetching email templates:', error.message);
    return [];
  }
}

export async function saveEmailTemplate(templateData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    // Get existing templates to generate ID
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EmailTemplates!A:A'
    });

    const existingIds = (existingResponse.data.values || []).map((row: any[]) => row[0]).filter(Boolean);
    let templateNum = 1;
    while (existingIds.includes(`TMPL${String(templateNum).padStart(5, '0')}`)) {
      templateNum++;
    }
    const templateId = `TMPL${String(templateNum).padStart(5, '0')}`;

    // If updating existing template
    if (templateData.id && templateData.id !== 'new') {
      const allTemplates = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'EmailTemplates!A:E'
      });

      const rows = allTemplates.data.values || [];
      let rowIdx = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === templateData.id) {
          rowIdx = i;
          break;
        }
      }

      if (rowIdx !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `EmailTemplates!A${rowIdx + 1}:E${rowIdx + 1}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              templateData.id,
              templateData.name,
              templateData.subject,
              templateData.body
            ]]
          }
        });
        return { success: true, id: templateData.id, message: 'Template updated successfully' };
      }
    }

    // Add new template
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'EmailTemplates!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          templateId,
          templateData.name,
          templateData.subject,
          templateData.body
        ]]
      }
    });

    return { success: true, id: templateId, message: 'Template saved successfully' };
  } catch (error: any) {
    console.error('Error saving email template:', error.message);
    return { success: false, message: error.message };
  }
}

export async function deleteEmailTemplate(templateId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const allTemplates = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EmailTemplates!A:E'
    });

    const rows = allTemplates.data.values || [];
    let rowIdx = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === templateId) {
        rowIdx = i;
        break;
      }
    }

    if (rowIdx === -1) {
      return { success: false, message: 'Template not found' };
    }

    // Clear the row (Google Sheets doesn't have delete, just clear)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `EmailTemplates!A${rowIdx + 1}:E${rowIdx + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['', '', '', '']]
      }
    });

    return { success: true, message: 'Template deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting email template:', error.message);
    return { success: false, message: error.message };
  }
}

// Append Payment to Sheet
export async function appendPaymentToSheet(paymentData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const submittedAt = paymentData.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Append to Payment sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Payment!A:R',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          submittedAt,
          paymentData.manuscriptId || '',
          paymentData.firstAuthorName || '',
          paymentData.email || '',
          paymentData.affiliation || '',
          paymentData.publicationType || '',
          paymentData.manuscriptTitle || '',
          paymentData.numberOfAuthors || '1',
          paymentData.authorType || '',
          paymentData.currency || '',
          paymentData.calculatedAmount || '',
          paymentData.amountPaid || '',
          paymentData.modeOfPayment || '',
          paymentData.dateOfPayment || '',
          paymentData.transactionNumber || '',
          paymentData.paymentProofUrl || '',
          paymentData.invoiceLink || '',
          'Under Process'
        ]]
      }
    });

    console.log(`✅ Payment recorded from: ${paymentData.email}`);
    return true;
  } catch (error: any) {
    console.error('Error appending payment to sheet:', error.message);
    throw error;
  }
}

// Append Manuscript to Sheet
// Column order MUST match getManuscriptsAll read order:
// A=ID, B=SubmittedAt, C=Author, D=Designation, E=Dept, F=Affiliation, G=Email, H=Mobile, I=Journal, J=Title, K=ResearchField, L=AuthorCount, M=AuthorNames, N=FileURL, O=Status, P=DOI
export async function appendManuscriptToSheet(manuscriptData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const submittedAt = manuscriptData.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Append to Manuscript sheet - columns MUST match getManuscriptsAll read order
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Manuscript!A:P',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          manuscriptData.manuscriptId,           // A = Manuscript ID
          submittedAt,                           // B = Submitted At
          manuscriptData.firstAuthorName || '',  // C = First Author Name
          manuscriptData.designation || '',      // D = Designation
          manuscriptData.department || '',       // E = Department
          manuscriptData.organisation || '',     // F = Affiliation
          manuscriptData.email || '',            // G = Email
          manuscriptData.mobile || '',           // H = Mobile
          manuscriptData.journalType || '',      // I = Journal Type
          manuscriptData.manuscriptTitle || '',  // J = Manuscript Title
          manuscriptData.researchField || '',    // K = Research Field
          manuscriptData.allAuthorsCount || '1', // L = Author Count
          manuscriptData.authorsDetails || '',   // M = Author Names
          manuscriptData.manuscriptLink || '',   // N = File URL (Google Drive link)
          'Under Review',                        // O = Status
          ''                                     // P = DOI
        ]]
      }
    });

    console.log(`✅ Manuscript recorded: ${manuscriptData.manuscriptId}`);
    return true;
  } catch (error: any) {
    console.error('Error appending manuscript to sheet:', error.message);
    throw error;
  }
}

// Append Contact Form to Sheet
export async function appendContactToSheet(contactData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const submittedAt = contactData.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Append to Contact sheet - all fields: SubmittedAt, FirstName, LastName, Email, Phone, EnquiryType, Subject, Message
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Contact!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          submittedAt,
          contactData.firstName || '',
          contactData.lastName || '',
          contactData.email || '',
          contactData.phoneNumber || '',
          contactData.enquiryType || '',
          contactData.subject || '',
          contactData.message || ''
        ]]
      }
    });

    console.log(`✅ Contact form recorded from: ${contactData.email}`);
    return true;
  } catch (error: any) {
    console.error('Error appending contact to sheet:', error.message);
    throw error;
  }
}

// Append Book Publication to Sheet
export async function appendBookPublicationToSheet(bookData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const submittedAt = bookData.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Generate Book Ref Number: SIPB + YY + MM + 3-char random alpha-numeric
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const bookRefNumber = `SIPB${year}${month}${randomPart}`;

    // Columns: Submitted Date, Book Ref Number, Book Title, Publication Type, Publication Format, Author Name, Email, Mobile, Institution, Designation, Subject Area, Expected Pages, Abstract, DOI, ISBN, Co-Authors Count, Co-Authors Details, Proposal Link, Status, Plagiarism %
    const values = [[
      submittedAt,
      bookRefNumber,
      bookData.bookTitle || '',
      bookData.publicationType || '',
      bookData.publicationFormat || '',
      bookData.firstName || '',
      bookData.email || '',
      bookData.mobile || '',
      bookData.institution || '',
      bookData.designation || '',
      bookData.subject || '',
      bookData.numberOfPages || '',
      bookData.abstract || '',
      '', // DOI
      '', // ISBN
      bookData.coAuthors ? (typeof bookData.coAuthors === 'string' ? (bookData.coAuthors.split(',').length + 1) : 1) : '1',
      bookData.coAuthors || '',
      bookData.proposalLink || '',
      'Under Review', // Status
      '' // Plagiarism %
    ]];

    // Ensure headings exist for a fresh sheet
    try {
      const checkHeadings = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Books!A1:T1'
      });
      if (!checkHeadings.data.values || checkHeadings.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Books!A1:T1',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['Submitted Date', 'Book Ref Number', 'Book Title', 'Publication Type', 'Publication Format', 'Author Name', 'Email', 'Mobile', 'Institution', 'Designation', 'Subject Area', 'Expected Pages', 'Abstract', 'DOI', 'ISBN', 'Co-Authors Count', 'Co-Authors Details', 'Proposal Link', 'Status', 'Plagiarism %']]
          }
        });
      }
    } catch (e) {
      console.warn('Heading check failed, continuing with append');
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Books!A:T',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });

    console.log(`✅ Book publication recorded: ${bookData.bookTitle} (Ref: ${bookRefNumber})`);
    return bookRefNumber;
  } catch (error: any) {
    console.error('Error appending book to sheet:', error.message);
    throw error;
  }
}

// Record newsletter subscription
export async function recordNewsletterSubscription(data: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
    const sheetName = 'Newsletter';

    const row = [
      new Date(data.subscribedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.email
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    console.log('✅ Newsletter subscription recorded:', data.email);
    return true;
  } catch (error: any) {
    console.error('Error recording newsletter subscription:', error.message);
    throw error;
  }
}

// Deactivate reviewer/editor user
export async function deactivateReviewerInSheet(reviewerId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
    const sheetName = 'Reviewers';

    // Get all reviewers to find the row with this reviewer ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:U`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any) => row[0] === reviewerId);

    if (rowIndex === -1) {
      throw new Error(`Reviewer not found: ${reviewerId}`);
    }

    // Column T (20) is Status - set to "Deactivated"
    const updateRange = `${sheetName}!T${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Deactivated']]
      }
    });

    console.log(`✅ User ${reviewerId} deactivated in Google Sheets`);
    return true;
  } catch (error: any) {
    console.error('Error deactivating reviewer:', error.message);
    throw error;
  }
}

// Count how many times a manuscript has been assigned (max 3)
export async function countAssignmentsForManuscript(manuscriptId: string): Promise<number> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Assignments!A2:Z1000'
    });

    const rows = response.data.values || [];
    // Column C (row[2]) = manuscriptId based on expected structure:
    // A=assignedAt, B=reviewerId, C=manuscriptId, D=dueDate, E=notes, F=status, G=manuscriptLink
    const count = rows.filter((row: any[]) => (row[2] || '').toUpperCase() === manuscriptId.toUpperCase()).length;

    return count;
  } catch (error: any) {
    console.warn('Could not count assignments:', error.message);
    return 0;
  }
}

// Generate 8-digit alphanumeric certificate number
function generateCertificateNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Record a new manuscript assignment
export async function recordAssignment(assignmentData: any) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

    const assignedAt = assignmentData.assignedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const manuscriptLink = assignmentData.manuscriptLink || '';
    const certificateNo = generateCertificateNumber();
    
    console.log(`📝 Recording assignment: Reviewer=${assignmentData.reviewerId}, Email=${assignmentData.reviewerEmail}, Manuscript=${assignmentData.manuscriptId}, Certificate=${certificateNo}`);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Assignments!A:M',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          assignedAt,                              // A = assignedAt
          assignmentData.reviewerId,               // B = reviewerId
          assignmentData.manuscriptId,             // C = manuscriptId
          assignmentData.dueDate,                  // D = dueDate
          assignmentData.notes || '',              // E = notes
          'Pending Review',                        // F = status
          manuscriptLink,                          // G = manuscriptLink
          '',                                      // H = recommendation
          '',                                      // I = overallMarks
          assignmentData.reviewerEmail || '',      // J = reviewerEmail
          assignmentData.reviewerFullName || '',   // K = reviewerFullName
          assignmentData.manuscriptTitle || '',    // L = manuscriptTitle
          certificateNo                            // M = certificateNo
        ]]
      }
    });

    // Update Manuscript status to "Under Review" if not already
    const manuscriptRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manuscript!A2:O1000'
    });
    const manuscriptRows = manuscriptRes.data.values || [];
    let msRowIdx = -1;
    for (let i = 0; i < manuscriptRows.length; i++) {
      if (manuscriptRows[i][0] === assignmentData.manuscriptId) {
        msRowIdx = i;
        break;
      }
    }

    if (msRowIdx !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Manuscript!O${msRowIdx + 2}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Under Review']]
        }
      });
    }

    console.log(`✅ Assignment recorded successfully`);
    return true;
  } catch (error: any) {
    console.error('Error recording assignment:', error.message);
    throw error;
  }
}
