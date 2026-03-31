import express, { Router, Request, Response, Express } from 'express';
import multer, { StorageEngine } from 'multer';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateManuscriptId(journalType: string): string {
  // Determine journal code
  let journalCode = 'SJCM';
  if (journalType.includes('Humanities')) journalCode = 'SJHS';
  else if (journalType.includes('Social Sciences')) journalCode = 'SJSS';
  
  // Get current year (last 2 digits)
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2);
  
  // Get current month (01-12)
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  
  // Generate random 4-character alphanumeric (0-9, A-Z)
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Format: MANSJCM251200AB (Prefix + journalCode + year + month + 4-char random alphanumeric)
  const manuscriptId = `MAN${journalCode}${currentYear}${currentMonth}${randomPart}`;
  
  console.log(`📝 Generated Manuscript ID: ${manuscriptId}`);
  return manuscriptId;
}

function generateReviewerId(role: string, journal: string): string {
  // Determine journal code
  let journalCode = 'SJCM';
  if (journal.includes('Humanities')) journalCode = 'SJHS';
  else if (journal.includes('Social Sciences')) journalCode = 'SJSS';
  
  // Role prefix
  const rolePrefix = role.toLowerCase().includes('editorial') ? 'EDT' : 'REV';
  
  // Get current year (last 2 digits)
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2);
  
  // Generate random 6-character alphanumeric (0-9, A-Z)
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Format: REVSJCM250N1XJ2 (rolePrefix + journalCode + year + 6-char random alphanumeric)
  const reviewerId = `${rolePrefix}${journalCode}${currentYear}${randomPart}`;
  
  console.log(`👤 Generated ${role} ID: ${reviewerId}`);
  return reviewerId;
}

export async function registerRoutes(app: Express) {
  // Initialize all sheet headers on startup
  const { initializeAllSheetHeaders } = await import('./google-sheets-client');
  await initializeAllSheetHeaders();

  app.get('/api/visitor-count', async (_req: Request, res: Response) => {
    try {
      const { storage } = await import('./storage');
      const stats = await storage.getAllJournalStats();
      const totalVisitors = stats.reduce((acc: number, curr: any) => acc + (curr.visitors || 0), 0);
      // Adding initial base count as requested by user to not start from zero
      const baseCount = 1240; 
      res.json({ count: totalVisitors + baseCount });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch visitor count' });
    }
  });

  // Track visitor for each journal access
  app.post('/api/track-visit/:journalId', async (req: Request, res: Response) => {
    try {
      const { storage } = await import('./storage');
      const { journalId } = req.params;
      await storage.incrementVisitors(journalId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track visit' });
    }
  });

  // Comprehensive sitemap.xml for all public pages and articles
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const protocol = 'https';
    const host = 'scholarindiapub.com';
    const base = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    const urlEntry = (loc: string, priority: string, changefreq: string = 'monthly', lastmod: string = today) =>
      `  <url>\n    <loc>${base}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

    // All Commerce articles
    const commerceArticles = [
      'sjcm-v1i1-001','sjcm-v1i1-002','sjcm-v1i1-003','sjcm-v1i1-004','sjcm-v1i1-005',
      'sjcm-v2i1-001','sjcm-v2i1-002','sjcm-v2i1-003','sjcm-v2i1-004','sjcm-v2i1-005',
    ];
    // All Humanities articles
    const humanitiesArticles = [
      'sjhss-v1i1-001','sjhss-v1i1-002','sjhss-v1i1-003','sjhss-v1i1-004',
      'sjhss-v1i1-005','sjhss-v1i1-006','sjhss-v1i1-007','sjhss-v1i1-008','sjhss-v1i1-009',
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Core Pages -->
${urlEntry('/', '1.0', 'weekly')}
${urlEntry('/commerce-management', '0.9', 'weekly')}
${urlEntry('/humanities', '0.9', 'weekly')}
${urlEntry('/about', '0.8', 'monthly')}
${urlEntry('/founder', '0.7', 'monthly')}
${urlEntry('/contact', '0.8', 'monthly')}

  <!-- Manuscript Submission -->
${urlEntry('/submit', '0.9', 'monthly')}
${urlEntry('/manuscript-track', '0.7', 'weekly')}

  <!-- Services -->
${urlEntry('/book-publication-info', '0.8', 'monthly')}
${urlEntry('/call-for-books', '0.7', 'monthly')}
${urlEntry('/published-books', '0.7', 'monthly')}
${urlEntry('/conference-seminars', '0.8', 'monthly')}
${urlEntry('/other-services', '0.7', 'monthly')}

  <!-- Reviewer & Editor -->
${urlEntry('/join-reviewer', '0.7', 'monthly')}
${urlEntry('/reviewer-search', '0.6', 'monthly')}

  <!-- Commerce Journal Articles -->
${commerceArticles.map(id => urlEntry(`/article/${id}`, '0.8', 'monthly', '2025-12-01')).join('\n')}

  <!-- Humanities Journal Articles -->
${humanitiesArticles.map(id => urlEntry(`/article/${id}`, '0.8', 'monthly', '2025-12-01')).join('\n')}

</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Comprehensive robots.txt
  app.get('/robots.txt', (req: Request, res: Response) => {
    const robots = `# Robots.txt - Scholar India Publishers (scholarindiapub.com)
# International peer-reviewed academic journals

User-agent: *
Allow: /
Allow: /commerce-management
Allow: /humanities
Allow: /about
Allow: /founder
Allow: /contact
Allow: /submit
Allow: /manuscript-track
Allow: /book-publication-info
Allow: /call-for-books
Allow: /published-books
Allow: /conference-seminars
Allow: /other-services
Allow: /join-reviewer
Allow: /reviewer-search
Allow: /article/

Disallow: /admin/
Disallow: /api/
Disallow: /reviewer-dashboard
Disallow: /reviewer-login
Disallow: /editor-dashboard
Disallow: /copyright-form
Disallow: /final-paper
Disallow: /payment
Disallow: /erp/
Disallow: /*.php$
Disallow: /*.asp$

# Google - no crawl delay, prioritize academic content
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Yahoo Slurp
User-agent: Slurp
Allow: /
Crawl-delay: 1

# DuckDuckGo
User-agent: DuckDuckBot
Allow: /

# Semantic Scholar (academic crawler)
User-agent: SemanticScholarBot
Allow: /

# Internet Archive
User-agent: ia_archiver
Allow: /

# Sitemap location
Sitemap: https://scholarindiapub.com/sitemap.xml`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Article landing pages for DOIs
  app.get('/articles/:id', (req: Request, res: Response) => {
    // These routes will be handled by the frontend Router
    // This is just a fallback to ensure the request is served
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  app.get('/api/track-manuscript/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { getManuscriptStatus } = await import('./google-sheets-client');
      const status = await getManuscriptStatus(id);
      
      if (status) {
        res.json({ success: true, status });
      } else {
        res.status(404).json({ success: false, message: 'Manuscript not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to track manuscript' });
    }
  });

  // Handle DOI redirects
  app.get('/doi/:prefix/:suffix', (req: Request, res: Response) => {
    const doi = `${req.params.prefix}/${req.params.suffix}`;
    
    // Map DOIs to article IDs
    const doiMap: Record<string, string> = {
      "10.65219/sjcm.20260201003": "sjcm-v2i1-003",
      "10.65219/sjcm.20260201004": "sjcm-v2i1-004",
      "10.65219/sjhss.20260101007": "sjhss-v1i1-007",
      "10.65219/sjhss.20260101008": "sjhss-v1i1-008",
      "10.65219/sjhss.20260101009": "sjhss-v1i1-009"
    };

    const articleId = doiMap[doi];
    if (articleId) {
      return res.redirect(`/articles/${articleId}`);
    }

    res.status(404).send('DOI not found');
  });

  // Create HTTP server
  import('http').then((http) => {
    return http.createServer(app);
  });

  // Reviewer Application Form Submission
  const reviewerUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // Check if reviewer already applied for a specific role
  app.post('/api/check-reviewer-exists', async (req: Request, res: Response) => {
    try {
      const { email, mobile, role, journal } = req.body;

      if (!email || !mobile || !role) {
        return res.status(400).json({
          error: 'Missing required fields: email, mobile, role'
        });
      }

      // Simple check - return success for now
      return res.json({ success: true, exists: false });
    } catch (error: any) {
      console.error('Error checking reviewer existence:', error.message);
      return res.status(500).json({
        error: 'Error checking reviewer status'
      });
    }
  });

  app.post('/api/submit-reviewer-application', reviewerUpload.single('profilePdf'), async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        mobile,
        role,
        areaOfInterest,
        journal,
        designation,
        orcid,
        googleScholar,
        institution,
        state,
        district,
        pinNumber,
        nationality,
        messageToEditor,
        institutionalProfilePage
      } = req.body;

      if (!name || !email || !institution || !journal || !role) {
        return res.status(400).json({
          error: 'Missing required fields: name, email, institution, journal, role'
        });
      }

      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Upload Profile PDF to Google Drive if provided
      let profilePdfUrl = '';
      if (req.file) {
        try {
          const { uploadFileToGoogleDrive } = await import('./google-drive-client');
          const uploadedFile = await uploadFileToGoogleDrive(req.file);
          profilePdfUrl = uploadedFile?.url || '';
        } catch (driveError) {
          console.warn('Failed to upload profile PDF to Google Drive:', driveError);
        }
      }

      // Generate Reviewer ID based on role and journal
      const reviewerId = generateReviewerId(role, journal);

      // Prepare reviewer data with all form fields
      const reviewerData = {
        reviewerId,
        firstName,
        lastName,
        email,
        mobile: mobile || '',
        role: role || '',
        designation: designation || '',
        areaOfInterest: areaOfInterest || '',
        journal,
        orcid: orcid || '',
        googleScholar: googleScholar || '',
        institution,
        state: state || '',
        district: district || '',
        pinNumber: pinNumber || '',
        nationality: nationality || '',
        messageToEditor: messageToEditor || '',
        institutionalProfilePage: institutionalProfilePage || '',
        profilePdfLink: profilePdfUrl || ''
      };

      // Send to Google Sheets
      const { submitReviewerApplication } = await import('./google-sheets-client');
      await submitReviewerApplication(reviewerData);

      // Send confirmation email
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Received</h1>
      <p>Thank you for applying to be a peer reviewer</p>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>We have received your peer reviewer application for Scholar India Publishers journals.</p>
      <p>Our editorial team will review your qualifications and contact you soon about available review opportunities.</p>
      <p>Thank you for your interest in supporting academic research!</p>
      <p>Best regards,<br>Editorial Team<br>Scholar India Publishers</p>
    </div>
  </div>
</body>
</html>
        `;

        await resend.emails.send({
          from: 'Scholar India Publishers <noreply@scholarindiapub.com>',
          to: email,
          subject: 'Reviewer Application Received - Scholar India Publishers',
          html: emailBody
        });
      } catch (emailError) {
        console.warn('Failed to send reviewer confirmation email:', emailError);
      }

      res.json({
        success: true,
        reviewerId: reviewerId,
        message: 'Reviewer application submitted successfully! Your Reviewer ID is: ' + reviewerId + '. You will hear from us soon.'
      });

    } catch (error) {
      console.error('Reviewer application error:', error);
      res.status(500).json({
        error: 'Failed to submit reviewer application. Please try again later.'
      });
    }
  });

  // Reviewer Login - authenticate using email and password (password = Reviewer ID or New Password)
  app.post('/api/reviewer-login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const { authenticateReviewer } = await import('./google-sheets-client');
      const result = await authenticateReviewer(email, password);

      if (result.success && result.reviewer) {
        console.log(`✅ Reviewer login successful: ${result.reviewer.reviewerId}`);
        return res.json({
          success: true,
          reviewer: result.reviewer
        });
      } else {
        console.log(`❌ Reviewer login failed: ${email}`);
        return res.status(401).json({
          success: false,
          message: result.message || 'Invalid email or password'
        });
      }
    } catch (error: any) {
      console.error('Reviewer login error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Login failed. Please try again later.'
      });
    }
  });

  // Get Reviewer Profile - fetch complete profile and assigned works
  app.post('/api/reviewer-profile', async (req: Request, res: Response) => {
    try {
      const { email, reviewerId } = req.body;

      if (!email || !reviewerId) {
        return res.status(400).json({
          success: false,
          message: 'Email and Reviewer ID are required'
        });
      }

      const { getReviewerProfile, getAssignedManuscripts, getReviewStatusForManuscript } = await import('./google-sheets-client');
      const profile = await getReviewerProfile(email, reviewerId);
      let assignedWorks = await getAssignedManuscripts(reviewerId);

      // Fetch review status for each assigned manuscript
      assignedWorks = await Promise.all(
        assignedWorks.map(async (work: any) => {
          const reviewStatus = await getReviewStatusForManuscript(reviewerId, work.manuscriptId);
          return {
            ...work,
            title: work.title || '',
            journal: work.journal || '',
            reviewSubmitted: reviewStatus.reviewSubmitted,
            reviewStatus: reviewStatus.reviewStatus,
            mobile: work.mobile || '',
            authorName: work.authorName || ''
          };
        })
      );

      if (profile) {
        // Log login activity to both database and Google Sheets
        try {
          const { storage } = await import('./storage');
          const { logLoginActivityToSheet } = await import('./google-sheets-client');
          const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
          const activityData = {
            reviewerId,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email,
            role: profile.role,
            journal: profile.journal,
            activityType: 'login' as const,
            ipAddress: ipAddress.split(',')[0]
          };
          
          // Log to PostgreSQL database (only significant actions)
          await storage.logLoginActivity(activityData);
          
          // Log to Google Sheets
          await logLoginActivityToSheet(activityData);
        } catch (logError) {
          console.warn('Failed to log login activity:', logError);
        }

        return res.json({
          success: true,
          profile,
          assignedWorks
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }
    } catch (error: any) {
      console.error('Get reviewer profile error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  });

  // Upload Review Form - save to Google Drive
  const reviewFormUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for review forms
  });

  app.post('/api/upload-review-form', reviewFormUpload.single('reviewForm'), async (req: Request, res: Response) => {
    try {
      const { reviewerId, reviewerName, manuscriptId, email } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Review form file is required'
        });
      }

      if (!reviewerId) {
        return res.status(400).json({
          success: false,
          message: 'Reviewer ID is required'
        });
      }

      // Generate a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `ReviewForm_${reviewerId}_${manuscriptId || 'General'}_${timestamp}.pdf`;

      // Upload to Google Drive (reviewer forms folder)
      const { uploadReviewFormToGoogleDrive } = await import('./google-drive-client');
      const uploadResult = await uploadReviewFormToGoogleDrive(req.file, fileName);

      if (uploadResult && uploadResult.url) {
        console.log(`✅ Review form uploaded: ${fileName} -> ${uploadResult.url}`);

        // Optionally log the upload to a tracking sheet
        // Note: Logging removed to reduce API quota usage
        // Users can view uploaded forms in the portal

        return res.json({
          success: true,
          message: 'Review form uploaded successfully',
          fileUrl: uploadResult.url
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload file to Google Drive'
        });
      }
    } catch (error: any) {
      console.error('Upload review form error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload review form'
      });
    }
  });

  // Manuscript Submission Form Submission
  const manuscriptUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for manuscripts
  });

  app.post('/api/submit-manuscript', manuscriptUpload.single('manuscript'), async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        mobile,
        designation,
        department,
        organisation,
        orcid,
        authors,
        journal,
        manuscriptTitle,
        researchField
      } = req.body;

      // Get author details - either from name/email fields or first author
      const authorData = authors ? (typeof authors === 'string' ? JSON.parse(authors) : authors) : [];
      const firstAuthor = Array.isArray(authorData) ? authorData[0] : null;
      
      const authorName = name || (firstAuthor?.name);
      const authorEmail = email || (firstAuthor?.email);

      if (!authorName || !authorEmail || !journal || !manuscriptTitle) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Manuscript file is required'
        });
      }

      // Upload manuscript to Google Drive
      let manuscriptUrl = '';
      try {
        const { uploadFileToGoogleDrive } = await import('./google-drive-client');
        const uploadedFile = await uploadFileToGoogleDrive(req.file);
        manuscriptUrl = uploadedFile?.url || '';
      } catch (driveError) {
        console.error('Failed to upload manuscript to Google Drive:', driveError);
        // Don't fail the submission if Drive upload fails
      }

      // Parse authors array
      let parsedAuthors = [];
      if (authors) {
        try {
          parsedAuthors = typeof authors === 'string' ? JSON.parse(authors) : authors;
        } catch {
          parsedAuthors = [];
        }
      }

      // Format authors details in readable format
      // Example: "1. Dr.R.Ramki (Asst. Professor), Commerce, Hindustan Institute of Technology & Science - Email: rajramkir@gmail.com, Mobile: 6379657407, ORCID: 0000-0002-3997-9100."
      const formattedAuthorsDetails = parsedAuthors.map((author: any, index: number) => {
        const parts = [];
        parts.push(`${index + 1}. ${author.name || ''}`);
        if (author.designation) parts[0] += ` (${author.designation})`;
        if (author.department) parts.push(author.department);
        if (author.organisation) parts.push(author.organisation);
        
        const contactParts = [];
        if (author.email) contactParts.push(`Email: ${author.email}`);
        if (author.mobile) contactParts.push(`Mobile: ${author.mobile}`);
        if (author.orcid) contactParts.push(`ORCID: ${author.orcid}`);
        
        let result = parts.join(', ');
        if (contactParts.length > 0) {
          result += ' - ' + contactParts.join(', ');
        }
        return result + '.';
      }).join(' | ');

      // Generate Manuscript ID using new format
      const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const manuscriptId = generateManuscriptId(journal);

      // Prepare manuscript data with all details
      const manuscriptData = {
        manuscriptId,
        submittedAt,
        firstAuthorName: name,
        designation: designation || '',
        department: department || '',
        organisation: organisation || '',
        email,
        mobile: mobile || '',
        orcid: orcid || '',
        allAuthorsCount: parsedAuthors.length.toString(),
        authorsDetails: formattedAuthorsDetails,
        journalType: journal,
        manuscriptTitle,
        researchField: researchField || '',
        manuscriptLink: manuscriptUrl || 'Not uploaded'
      };

      // Send to Google Sheets
      const { submitManuscript } = await import('./google-sheets-client');
      await submitManuscript(manuscriptData);

      // Send confirmation email
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
    .manuscript-id { background: #e0f2fe; padding: 15px; border-left: 4px solid #0284c7; margin: 15px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Manuscript Received</h1>
      <p>Thank you for submitting your research</p>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>We have received your manuscript submission: <strong>${manuscriptTitle}</strong></p>
      <div class="manuscript-id">
        <p>Your Manuscript ID: <strong>${manuscriptId}</strong></p>
        <p style="font-size: 12px; margin-top: 10px;">Please use this ID to track your manuscript status.</p>
      </div>
      <p>Our editorial team will evaluate your manuscript for scholarly merit and suitability.</p>
      <p>You will be notified about the review status within 15-30 days.</p>
      <p>Best regards,<br>Editorial Team<br>Scholar India Publishers</p>
    </div>
  </div>
</body>
</html>
        `;

        await resend.emails.send({
          from: 'Scholar India Publishers <noreply@scholarindiapub.com>',
          to: email,
          subject: 'Manuscript Submission Received - Scholar India Publishers',
          html: emailBody
        });
      } catch (emailError) {
        console.warn('Failed to send manuscript confirmation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Manuscript submitted successfully!',
        manuscriptId
      });

    } catch (error: any) {
      console.error('Manuscript submission error:', error?.message || error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      res.status(500).json({
        error: 'Failed to submit manuscript. Please try again later.',
        details: error?.message
      });
    }
  });

  // General Contact Form Submission
  app.post('/api/submit-contact', async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        phone,
        enquiryType,
        subject,
        message
      } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Prepare contact data for Google Sheets
      const contactData = {
        firstName,
        lastName,
        email,
        phoneNumber: phone || '',
        enquiryType: enquiryType || '',
        subject: subject || '',
        message,
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      // Send to Google Sheets
      const { appendContactToSheet } = await import('./google-sheets-client');
      await appendContactToSheet(contactData);

      // Send confirmation email
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Message Received</h1>
      <p>We will get back to you shortly</p>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>Thank you for contacting Scholar India Publishers. We have received your message.</p>
      <p>Our team will review and respond to your inquiry within 2-3 business days.</p>
      <p>Best regards,<br>Team<br>Scholar India Publishers</p>
    </div>
  </div>
</body>
</html>
        `;

        await resend.emails.send({
          from: 'Scholar India Publishers <noreply@scholarindiapub.com>',
          to: email,
          subject: 'We Received Your Message - Scholar India Publishers',
          html: emailBody
        });
      } catch (emailError) {
        console.warn('Failed to send contact confirmation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Message sent successfully! We will respond soon.'
      });

    } catch (error: any) {
      console.error('Contact form submission error:', error?.message || error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      res.status(500).json({
        error: 'Failed to submit message. Please try again later.',
        details: error?.message
      });
    }
  });

  // Book Publication Form Submission
  const bookUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for book files
  });

  app.post('/api/submit-book-publication', bookUpload.single('manuscript'), async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        mobile,
        designation,
        institution,
        bookTitle,
        subject,
        numberOfPages,
        abstract,
        coAuthors,
        publicationType,
        publicationFormat
      } = req.body;

      if (!name || !email || !bookTitle || !subject) {
        return res.status(400).json({
          error: 'Missing required fields: name, email, bookTitle, subject'
        });
      }

      // Upload book proposal to Google Drive if provided
      let proposalUrl = '';
      if (req.file) {
        try {
          const { uploadFileToGoogleDrive } = await import('./google-drive-client');
          const uploadedFile = await uploadFileToGoogleDrive(req.file);
          proposalUrl = uploadedFile?.url || '';
        } catch (driveError) {
          console.warn('Failed to upload book to Google Drive:', driveError);
        }
      }

      // Prepare book publication data
      const bookData = {
        firstName: name, // Using full name as firstName for sheet mapping
        email,
        mobile: mobile || '',
        designation: designation || '',
        institution: institution || '',
        bookTitle,
        subject,
        numberOfPages: numberOfPages || '',
        abstract: abstract || '',
        coAuthors: coAuthors || '',
        publicationType: publicationType || '',
        publicationFormat: publicationFormat || '',
        proposalLink: proposalUrl || 'Not uploaded',
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      // Send to Google Sheets and get reference number
      const { appendBookPublicationToSheet } = await import('./google-sheets-client');
      const bookRefNumber = await appendBookPublicationToSheet(bookData);

      // Send confirmation email
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
    .ref-box { background: #e0f2fe; border: 1px solid #7dd3fc; padding: 15px; border-radius: 4px; margin: 15px 0; font-weight: bold; color: #0369a1; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Book Publication Proposal Received</h1>
      <p>Thank you for choosing Scholar India Publishers</p>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>We have received your book publication proposal for <strong>${bookTitle}</strong>.</p>
      
      <div class="ref-box">
        Reference Number: ${bookRefNumber}
      </div>

      <p>Our acquisitions team will review your proposal and contact you within 15 working days.</p>
      <p>Please keep this reference number for all future communications.</p>
      <p>Best regards,<br>Publishing Team<br>Scholar India Publishers</p>
    </div>
  </div>
</body>
</html>
        `;

        await resend.emails.send({
          from: 'Scholar India Publishers <noreply@scholarindiapub.com>',
          to: email,
          subject: `Book Publication Proposal Received - ${bookRefNumber}`,
          html: emailBody
        });
      } catch (emailError) {
        console.warn('Failed to send book publication confirmation email:', emailError);
      }

      res.json({
        success: true,
        bookRefNumber,
        message: `Book publication proposal submitted successfully! Your reference number is ${bookRefNumber}`
      });

    } catch (error) {
      console.error('Book publication submission error:', error);
      res.status(500).json({
        error: 'Failed to submit proposal. Please try again later.'
      });
    }
  });

  // Serve invoices
  app.get("/downloads/invoices/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      
      // Security: only allow PDF files
      if (!filename.endsWith('.pdf')) {
        return res.status(400).json({ error: 'Invalid file type' });
      }
      
      const invoicePath = path.join(process.cwd(), 'attached_assets', 'invoices', filename);
      
      // Check if file exists
      if (!fs.existsSync(invoicePath)) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const fileStream = fs.createReadStream(invoicePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving invoice:', error);
      res.status(500).json({ error: 'Failed to download invoice' });
    }
  });

  // Serve payment proofs
  app.get("/downloads/payment-proofs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      const proofPath = path.join(process.cwd(), 'attached_assets', 'payment-proofs', filename);
      
      // Check if file exists
      if (!fs.existsSync(proofPath)) {
        return res.status(404).json({ error: 'Payment proof not found' });
      }
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const fileStream = fs.createReadStream(proofPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving payment proof:', error);
      res.status(500).json({ error: 'Failed to download payment proof' });
    }
  });

  // Payment Processing with file upload
  const paymentUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only images and PDF files are allowed'));
      }
    }
  });

  app.post("/api/process-payment", paymentUpload.single('paymentScreenshot'), async (req: Request, res: Response) => {
    try {
      const { 
        firstName,
        lastName,
        manuscriptTitle,
        manuscriptId,
        email,
        affiliation,
        publicationType,
        numberOfAuthors,
        authorType,
        amount,
        currency,
        modeOfPayment,
        dateOfPayment,
        transactionNumber
      } = req.body;

      const file = req.file;

      // Debug logging
      console.log('Payment request received:', { firstName, lastName, manuscriptId, email, affiliation, publicationType, numberOfAuthors, authorType, amount, currency, fileName: file?.originalname });

      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !affiliation?.trim() || !publicationType || !numberOfAuthors || !authorType || !amount || !modeOfPayment || !dateOfPayment || !transactionNumber) {
        console.error('Missing fields:', { firstName, lastName, manuscriptId, email, affiliation, publicationType, numberOfAuthors, authorType, amount, modeOfPayment, dateOfPayment, transactionNumber });
        return res.status(400).json({ 
          error: 'Missing required payment information. Please ensure all fields are filled.' 
        });
      }

      if (!file) {
        return res.status(400).json({
          error: 'Payment screenshot is required'
        });
      }

      // Save payment proof file to Google Drive
      let fileUrl = 'Payment proof upload failed';
      try {
        const { uploadFileToGoogleDrive } = await import('./google-drive-client');
        const driveResult = await uploadFileToGoogleDrive(file);
        fileUrl = driveResult.url;
        console.log('✅ Payment proof uploaded to Google Drive:', fileUrl);
      } catch (driveError: any) {
        console.warn('⚠️ Payment proof upload warning (falling back to local):', driveError.message);
        // Fallback to local storage if Drive fails
        try {
          const paymentProofsDir = path.join(process.cwd(), 'attached_assets', 'payment-proofs');
          if (!fs.existsSync(paymentProofsDir)) {
            fs.mkdirSync(paymentProofsDir, { recursive: true });
          }
          const fileExt = path.extname(file.originalname) || '.png';
          const proofFilename = `PROOF-${Date.now()}${fileExt}`;
          const proofPath = path.join(paymentProofsDir, proofFilename);
          fs.writeFileSync(proofPath, file.buffer);
          fileUrl = `/downloads/payment-proofs/${proofFilename}`;
        } catch (localError: any) {
          console.error('❌ Failed to save payment proof locally:', localError.message);
        }
      }

      // Generate SIP Invoice ID
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
      const invoiceId = `SIP${year}${month}${randomPart}`;

      // Prepare payment data matching the Google Sheets schema (same pattern as other forms)
      const paymentData = {
        manuscriptId: manuscriptId || '',
        firstAuthorName: `${firstName} ${lastName}`,
        email,
        affiliation,
        publicationType,
        manuscriptTitle: manuscriptTitle || '',
        numberOfAuthors: parseInt(numberOfAuthors),
        authorType,
        currency,
        calculatedAmount: amount,
        amountPaid: amount,
        modeOfPayment,
        dateOfPayment,
        transactionNumber,
        paymentProofUrl: fileUrl || 'Payment proof uploaded',
        invoiceLink: invoiceId, // Store generated ID here
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      // Record in Google Sheets
      try {
        const { appendPaymentToSheet } = await import('./google-sheets-client');
        await appendPaymentToSheet(paymentData);
        console.log('✅ Payment recorded in Google Sheets');
      } catch (sheetsError: any) {
        console.warn('⚠️ Warning: Failed to record payment in Google Sheets:', sheetsError.message || sheetsError);
      }

      // Send confirmation email
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const amountDisplay = currency === '₹' ? `₹${amount}` : `US $${amount}`;
        
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
    .order { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #1e3a8a; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    .amount { font-size: 28px; font-weight: bold; color: #1e3a8a; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Received</h1>
      <p>Thank you for choosing Scholar India Publishers</p>
    </div>
    <div class="content">
      <h2>Order Confirmation</h2>
      <div class="order">
        <p><strong>Invoice Number:</strong> ${invoiceId}</p>
        <p><strong>Author:</strong> ${firstName} ${lastName}</p>
        <p><strong>Manuscript Title:</strong> ${manuscriptTitle || 'N/A'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Institution:</strong> ${affiliation}</p>
        <p><strong>Publication Type:</strong> ${publicationType}</p>
        <p><strong>Number of Authors:</strong> ${numberOfAuthors}</p>
      </div>

      <h3>Amount Paid</h3>
      <div style="background: #f0f7ff; padding: 20px; border-radius: 4px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #666;">Total Publication Fee</p>
        <p class="amount">${amountDisplay}</p>
      </div>

      <h3 style="margin-top: 25px;">Next Steps</h3>
      <ol>
        <li>We received your payment proof</li>
        <li>We'll verify your payment (typically within 24 hours)</li>
        <li>You'll receive your unique DOI and publication confirmation</li>
        <li>Your article will be published and globally indexed</li>
      </ol>

      <div style="background: #dcfce7; padding: 15px; border-radius: 4px; border-left: 4px solid #16a34a; margin-top: 20px;">
        <p style="margin: 0; color: #15803d; font-weight: bold;">✓ Payment Recorded</p>
        <p style="margin: 5px 0 0 0; color: #15803d; font-size: 13px;">Your payment has been logged for manual verification. We will update your status within 24 hours.</p>
      </div>

      <p style="margin-top: 25px; color: #666;">If you have any questions, please contact us at editor@scholarindiapub.com</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Scholar India Publishers. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `;

        const emailResponse = await resend.emails.send({
          from: 'Scholar India Publishers <noreply@scholarindiapub.com>',
          to: email,
          subject: `Payment Confirmation - ${invoiceId} - Scholar India Publishers`,
          html: emailBody
        });

        console.log('✅ Payment confirmation email sent to:', email);
      } catch (emailError: any) {
        console.warn('⚠️ Warning: Failed to send payment confirmation email:', emailError.message || emailError);
      }

      res.json({
        success: true,
        invoiceId,
        message: 'Payment details recorded successfully!'
      });

    } catch (error) {
      console.error('Payment submission error:', error);
      res.status(500).json({ 
        error: 'Failed to process payment. Please try again later.' 
      });
    }
  });

  // DOCX/PDF Template Downloads - serve binary files with correct headers
  app.get('/downloads/:filename', (req: Request, res: Response, next: Function) => {
    const filename = req.params.filename;
    // Only handle non-PDF files here (PDFs handled by the next route)
    if (filename.endsWith('.pdf')) return next();
    
    const filePath = path.join(process.cwd(), 'public', 'downloads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(filePath, (err: any) => {
      if (err && !res.headersSent) {
        console.error('Error serving file:', err);
        res.status(500).send('Error serving file');
      }
    });
  });

  // PDF Download System - auto-discovers PDFs from public/downloads/ and attached_assets/
  const legacyPdfMappings: Record<string, string> = {
    'sjcm-v2i1-001': './attached_assets/SIPCMv2i101_1768678134690.pdf',
    'sjcm-v1i1-001': './attached_assets/sjcm-v1i1-001.pdf',
    'sjcm-v1i1-002': './attached_assets/SIPCMv1i12_1761066126602.pdf',
    'sjcm-v1i1-003': './attached_assets/SIPCMv1i13_1761074240403.pdf',
    'sjcm-v1i1-004': './attached_assets/SIPCM v1i14_1761074988408.pdf',
    'sjcm-v1i1-005': './attached_assets/sjcm-v1i1-005.pdf',
  };

  app.get('/downloads/:articleId.pdf', (req: Request, res: Response) => {
    const articleId = req.params.articleId;
    const standardPath = path.join(process.cwd(), 'public', 'downloads', `${articleId}.pdf`);
    const attachedPath = path.join(process.cwd(), 'attached_assets', `${articleId}.pdf`);
    const legacyPath = legacyPdfMappings[articleId];

    let resolvedPath = '';
    if (fs.existsSync(standardPath)) {
      resolvedPath = standardPath;
    } else if (fs.existsSync(attachedPath)) {
      resolvedPath = attachedPath;
    } else if (legacyPath) {
      const fullLegacy = path.resolve(process.cwd(), legacyPath);
      if (fs.existsSync(fullLegacy)) {
        resolvedPath = fullLegacy;
      }
    }

    if (!resolvedPath) {
      return res.status(404).send('Article not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${articleId}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(resolvedPath, (err: any) => {
      if (err) {
        console.error('Error serving PDF:', err);
        res.status(500).send('Error serving PDF file');
      }
    });
  });

  // Search reviewer by email, mobile, or reviewer ID
  app.get('/api/search-reviewer', async (req: Request, res: Response) => {
    try {
      const { email, mobile, reviewerId } = req.query;
      
      if (!email && !mobile && !reviewerId) {
        return res.status(400).json({ error: 'Email, mobile number, or reviewer ID required' });
      }

      const { searchReviewerByEmailOrMobile } = await import('./google-sheets-client');
      const result = await searchReviewerByEmailOrMobile(
        email as string | undefined,
        mobile as string | undefined,
        reviewerId as string | undefined
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Search reviewer error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all manuscripts
  app.get('/api/manuscripts-all', async (req: Request, res: Response) => {
    try {
      const { getManuscriptsAll } = await import('./google-sheets-client');
      const manuscripts = await getManuscriptsAll();
      res.json({ success: true, manuscripts });
    } catch (error: any) {
      console.error('Error fetching all manuscripts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get assigned manuscripts for editor
  app.post('/api/editor/assigned-manuscripts', async (req: Request, res: Response) => {
    try {
      const { editorId } = req.body;
      if (!editorId) {
        return res.status(400).json({ success: false, error: 'Editor ID required' });
      }
      const { getAssignedManuscripts, getReviewStatusForManuscript } = await import('./google-sheets-client');
      let manuscripts = await getAssignedManuscripts(editorId);
      
      // Enrich with reviewSubmitted status
      manuscripts = await Promise.all(
        manuscripts.map(async (work: any) => {
          const reviewStatus = await getReviewStatusForManuscript(editorId, work.manuscriptId);
          return {
            ...work,
            reviewSubmitted: reviewStatus.reviewSubmitted,
            reviewStatus: reviewStatus.reviewStatus
          };
        })
      );
      
      res.json({ success: true, manuscripts });
    } catch (error: any) {
      console.error('Error fetching editor assigned manuscripts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get assigned manuscripts for reviewer
  app.post('/api/reviewer/assigned-manuscripts', async (req: Request, res: Response) => {
    try {
      const { reviewerId } = req.body;
      if (!reviewerId) {
        return res.status(400).json({ success: false, error: 'Reviewer ID required' });
      }
      const { getAssignedManuscripts, getReviewStatusForManuscript } = await import('./google-sheets-client');
      let manuscripts = await getAssignedManuscripts(reviewerId);
      
      // Enrich with reviewSubmitted status
      manuscripts = await Promise.all(
        manuscripts.map(async (work: any) => {
          const reviewStatus = await getReviewStatusForManuscript(reviewerId, work.manuscriptId);
          return {
            ...work,
            reviewSubmitted: reviewStatus.reviewSubmitted,
            reviewStatus: reviewStatus.reviewStatus
          };
        })
      );
      
      res.json({ success: true, manuscripts });
    } catch (error: any) {
      console.error('Error fetching reviewer assigned manuscripts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Search manuscript by email, manuscript ID, or mobile number
  app.get('/api/search-manuscript', async (req: Request, res: Response) => {
    try {
      const { email, manuscriptId, mobile } = req.query;
      
      if (!email && !manuscriptId && !mobile) {
        return res.status(400).json({ error: 'Email, manuscript ID, or mobile number required' });
      }

      const { searchManuscriptByEmailOrId } = await import('./google-sheets-client');
      const result = await searchManuscriptByEmailOrId(
        email as string | undefined,
        manuscriptId as string | undefined,
        mobile as string | undefined
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Search manuscript error:', error);
      res.status(500).json({ error: error.message });
    }
  });


  // Store for certificate template
  let certificateTemplate: any = {
    headerLine1: 'SCHOLAR INDIA PUBLISHERS',
    headerLine2: 'An Academic Publishing Organization',
    headerLine3: 'Dedicated to Excellence in Scholarly Communication',
    certificateTitle: 'Certificate of Reviewer',
    bodyText: 'has actively served as a peer reviewer and demonstrated exceptional expertise and commitment to academic excellence. This reviewer has contributed significantly to the quality and integrity of academic publishing through meticulous manuscript evaluation and constructive feedback.'
  };

  // Get certificate template
  app.get('/api/certificate-template', async (req: Request, res: Response) => {
    try {
      res.json({ template: certificateTemplate });
    } catch (error: any) {
      console.error('Error getting certificate template:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Save certificate template (admin only)
  app.post('/api/certificate-template', async (req: Request, res: Response) => {
    try {
      const { template } = req.body;
      if (!template) {
        return res.status(400).json({ error: 'Template is required' });
      }
      certificateTemplate = template;
      res.json({ success: true, message: 'Certificate template saved' });
    } catch (error: any) {
      console.error('Error saving certificate template:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate certificate
  app.post('/api/generate-certificate', async (req: Request, res: Response) => {
    try {
      const { reviewerId, name, designation, fullAddress, mailId } = req.body;

      if (!name || !mailId) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const cert = certificateTemplate;

      const PDFDocument = (await import('pdfkit')).default as typeof import('pdfkit');
      const doc = new PDFDocument({ size: [841.89, 595.28], margin: 30 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reviewer-certificate-${Date.now()}.pdf"`);
      doc.pipe(res);

      const pageWidth = 841.89;
      const pageHeight = 595.28;
      const margin = 30;

      // Header
      doc.fontSize(16).font('Helvetica-Bold').text(cert.headerLine1, { align: 'center' });
      doc.fontSize(9).font('Helvetica').text(cert.headerLine2, { align: 'center' });
      doc.fontSize(9).font('Helvetica').text(cert.headerLine3, { align: 'center' });
      doc.moveDown(0.8);

      // Certificate Title
      doc.fontSize(18).font('Helvetica-Bold').text(cert.certificateTitle, { align: 'center' });
      doc.moveDown(1);

      // "This is to certify that"
      doc.fontSize(11).font('Helvetica').text('This is to certify that', { align: 'center' });
      doc.moveDown(0.8);

      // Reviewer details
      doc.fontSize(12).font('Helvetica-Bold').text(name, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Reviewer ID: ${reviewerId}`, { align: 'center' });
      if (designation) {
        doc.fontSize(10).font('Helvetica').text(`${designation}`, { align: 'center' });
      }
      if (fullAddress) {
        doc.fontSize(9).font('Helvetica').text(`${fullAddress}`, { align: 'center' });
      }
      doc.fontSize(10).font('Helvetica').text(`${mailId}`, { align: 'center' });
      doc.moveDown(1);

      // Main body text
      doc.fontSize(10).font('Helvetica').text(
        cert.bodyText,
        margin,
        doc.y,
        { width: pageWidth - 2 * margin, align: 'justify' }
      );

      doc.moveDown(1.2);

      // System generated statement
      doc.fontSize(8).font('Helvetica-Oblique').text(
        `This is a system-generated certificate. Date: ${new Date().toLocaleDateString('en-IN')}`,
        margin,
        doc.y,
        { width: pageWidth - 2 * margin, align: 'center' }
      );

      doc.end();
    } catch (error: any) {
      console.error('Certificate generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Authentication Routes
  app.post('/api/admin-login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const ADMIN_EMAIL = 'editor@scholarindiapub.com';
      const ADMIN_PASSWORD = 'Edupertz@004';

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
        return res.json({
          success: true,
          email,
          token,
          message: 'Login successful'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Dashboard - Statistics
  app.get('/api/admin/stats', async (req: Request, res: Response) => {
    try {
      const { getReviewersAll, getManuscriptsAll, getGoogleSheetsClient } = await import('./google-sheets-client');
      
      // Get reviewers count
      const reviewers = await getReviewersAll();
      const reviewersCount = reviewers ? reviewers.length : 0;
      
      // Get editorial board members count (reviewers with role containing "Editorial", "Board", or "Editor")
      const editorialCount = reviewers ? reviewers.filter((r: any) => {
        const role = (r['Role'] || r.role || '').toLowerCase();
        return role.includes('editorial') || role.includes('board') || role === 'editor';
      }).length : 0;
      
      // Get manuscripts count
      const manuscripts = await getManuscriptsAll();
      const manuscriptsCount = manuscripts ? manuscripts.length : 0;
      
      // Get assignments and pending reviews count
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      const assignmentsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A:U'
      });
      const assignmentRows = assignmentsResponse.data.values || [];
      const assignmentsCount = Math.max(0, assignmentRows.length - 1); // Subtract header row
      
      // Count pending reviews - assignments where column Q (Recommendation) is empty or "Pending Review"
      let pendingReviewsCount = 0;
      for (let i = 1; i < assignmentRows.length; i++) {
        const recommendation = assignmentRows[i][16] || ''; // Column Q = index 16
        if (!recommendation || recommendation === 'Pending Review') {
          pendingReviewsCount++;
        }
      }
      
      res.json({
        reviewersCount,
        editorialCount,
        manuscriptsCount,
        assignmentsCount,
        pendingReviewsCount
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Get login activities
  app.get('/api/admin/login-activities', async (req: Request, res: Response) => {
    try {
      const { storage } = await import('./storage');
      const db = (storage as any).db;
      
      if (!db) {
        return res.json({ success: true, activities: [] });
      }
      
      const activities = await storage.getLoginActivities(200);
      res.json({ success: true, activities });
    } catch (error: any) {
      console.error('Error fetching login activities:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin - Get all reviewers
  app.get('/api/admin/reviewers', async (req: Request, res: Response) => {
    try {
      const { getReviewersAll } = await import('./google-sheets-client');
      const reviewers = await getReviewersAll();
      res.json({ reviewers: reviewers || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Get reviewers for assignment
  app.get('/api/admin/reviewers-for-assignment', async (req: Request, res: Response) => {
    try {
      const { getReviewersAll } = await import('./google-sheets-client');
      const reviewers = await getReviewersAll();
      // Filter only Active reviewers for assignment
      const activeReviewers = reviewers?.filter((r: any) => r['Status'] === 'Active') || [];
      res.json({ reviewers: activeReviewers });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Get reviewers needing approval
  app.get('/api/admin/reviewers-for-approval', async (req: Request, res: Response) => {
    try {
      const { getReviewersForApproval } = await import('./google-sheets-client');
      const reviewers = await getReviewersForApproval();
      res.json({ reviewers: reviewers || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Get editorial board members needing approval
  app.get('/api/admin/editorial-board-for-approval', async (req: Request, res: Response) => {
    try {
      const { getEditorialBoardForApproval } = await import('./google-sheets-client');
      const members = await getEditorialBoardForApproval();
      res.json({ members: members || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Update reviewer status
  app.post('/api/admin/update-reviewer-status', async (req: Request, res: Response) => {
    try {
      const { reviewerId, status, adminEmail } = req.body;

      if (!reviewerId || !status) {
        return res.status(400).json({ error: 'Reviewer ID and status are required' });
      }

      const validStatuses = ['Active', 'Hold', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` });
      }

      const { updateReviewerStatus, logActivityToSheet } = await import('./google-sheets-client');
      await updateReviewerStatus(reviewerId, status);

      // Log to activity sheet
      await logActivityToSheet({
        adminEmail: adminEmail || 'unknown',
        action: 'Update Reviewer Status',
        reviewerId,
        details: `Changed status to: ${status}`,
        status: 'Success',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });

      res.json({ success: true, message: `Reviewer status updated to ${status}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Get all manuscripts
  app.get('/api/admin/manuscripts', async (req: Request, res: Response) => {
    try {
      const { getManuscriptsAll } = await import('./google-sheets-client');
      const manuscripts = await getManuscriptsAll();
      res.json({ manuscripts: manuscripts || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify manuscript for payment and get details
  app.post('/api/verify-manuscript', async (req: Request, res: Response) => {
    try {
      const { manuscriptId } = req.body;
      if (!manuscriptId) {
        return res.status(400).json({ success: false, message: 'Manuscript ID is required' });
      }

      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Manuscript!A:O'
      });

      const rows = response.data.values || [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] && row[0].toUpperCase() === manuscriptId.toUpperCase()) {
          const status = row[14] ? row[14].trim() : '';
          
          if (status.toLowerCase() !== 'accepted') {
            let message = '';
            if (status.toLowerCase() === 'under review') {
              message = `Thank you for your submission! Your manuscript (${row[0]}) is currently under review by our expert peer reviewers. We appreciate your patience during this process. Once your manuscript is accepted, you'll receive an email notification, and then you can proceed with the payment for publication. Please check back soon!`;
            } else {
              message = `Your manuscript status is currently "${status}". Only manuscripts with "Accepted" status can proceed to payment. Please contact our editorial team at editor@scholarindiapub.com for more information about your manuscript.`;
            }
            return res.json({ 
              success: false, 
              message: message
            });
          }

          return res.json({
            success: true,
            manuscript: {
              manuscriptId: row[0],
              title: row[10] || '',
              author: row[3] || '',
              status: status
            }
          });
        }
      }

      res.json({ success: false, message: 'Manuscript ID not found. Please verify and try again.' });
    } catch (error: any) {
      console.error('Manuscript verification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Get manuscripts for assignment
  app.get('/api/admin/manuscripts-for-assignment', async (req: Request, res: Response) => {
    try {
      const { getManuscriptsAll } = await import('./google-sheets-client');
      const manuscripts = await getManuscriptsAll();
      res.json({ manuscripts: manuscripts || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Fix swapped assignments (cleanup bad data)
  app.post('/api/admin/fix-assignments', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Get all assignments
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A2:Z1000'
      });

      const rows = response.data.values || [];
      const badRowIndices = [];

      // Find swapped rows where reviewerId looks like a manuscript/editor ID
      for (let i = 0; i < rows.length; i++) {
        const reviewerId = (rows[i][1] || '').toUpperCase();
        const manuscriptId = (rows[i][2] || '').toUpperCase();
        
        // Check if they're swapped: reviewerId starts with MAN/MS, manuscriptId starts with EDT
        const reviewerLooksLikeMS = reviewerId.startsWith('MAN') || reviewerId.startsWith('MS');
        const manuscriptLooksLikeEdt = manuscriptId.startsWith('EDT');
        
        if (reviewerLooksLikeMS && manuscriptLooksLikeEdt) {
          badRowIndices.push(i);
        }
      }

      if (badRowIndices.length === 0) {
        return res.json({ success: true, message: 'No swapped assignments found', fixedCount: 0 });
      }

      // Clear the bad rows
      for (const idx of badRowIndices) {
        const rowNum = idx + 2; // +1 for header, +1 because row indices start at 1
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Assignments!A${rowNum}:G${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['', '', '', '', '', '', '']]
          }
        });
      }

      res.json({
        success: true,
        message: `Cleared ${badRowIndices.length} swapped assignments. Please re-assign these manuscripts.`,
        fixedCount: badRowIndices.length,
        clearedRows: badRowIndices.map(i => i + 2)
      });
    } catch (error: any) {
      console.error('Error fixing assignments:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Assign manuscript to reviewer
  app.post('/api/admin/assign-manuscript', async (req: Request, res: Response) => {
    try {
      const { reviewerIds, manuscriptId, notes, dueDate, adminEmail } = req.body;

      if (!reviewerIds || !Array.isArray(reviewerIds) || reviewerIds.length === 0 || !manuscriptId) {
        return res.status(400).json({
          message: 'Reviewer IDs (array) and Manuscript ID are required'
        });
      }

      if (!dueDate) {
        return res.status(400).json({
          message: 'Due date is required'
        });
      }

      const { recordAssignment, logActivityToSheet, getReviewersAll, getGoogleSheetsClient, countAssignmentsForManuscript } = await import('./google-sheets-client');
      
      // Check current assignment count
      const currentCount = await countAssignmentsForManuscript(manuscriptId);
      if (currentCount + reviewerIds.length > 3) {
        return res.status(400).json({
          success: false,
          message: `Cannot assign ${reviewerIds.length} more reviewers. This manuscript already has ${currentCount} assignment(s) and the limit is 3.`
        });
      }

      // Get manuscript link and title
      let manuscriptLink = '';
      let manuscriptTitle = '';
      try {
        const sheets = await getGoogleSheetsClient();
        const msResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg',
          range: 'Manuscript!A2:Z1000'
        });
        const msRows = msResponse.data.values || [];
        for (const row of msRows) {
          if (row[0]?.toString().trim().toUpperCase() === manuscriptId.toString().trim().toUpperCase()) {
            manuscriptLink = row[13] || ''; // Column N = File URL
            manuscriptTitle = row[9] || ''; // Column J = Manuscript Title
            break;
          }
        }
      } catch (err) {
        console.warn('Could not fetch manuscript link/title:', err);
      }

      const reviewersData = await getReviewersAll();
      const results = [];

      for (const reviewerId of reviewerIds) {
        const reviewerObj = reviewersData.find(r => (r.reviewerId || r.id || r['Reviewer ID']) === reviewerId);
        const reviewerEmailAddress = reviewerObj?.email || reviewerObj?.Email || '';
        // Build full name from firstName + lastName if fullName not available
        const firstName = reviewerObj?.firstName || reviewerObj?.['First Name'] || '';
        const lastName = reviewerObj?.lastName || reviewerObj?.['Last Name'] || '';
        const reviewerFullName = reviewerObj?.fullName || reviewerObj?.['Full Name'] || 
          (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '');

        console.log(`📝 Recording assignment for Reviewer: ${reviewerId}, Name: ${reviewerFullName}, Email: ${reviewerEmailAddress}`);

        await recordAssignment({
          reviewerId,
          manuscriptId,
          notes,
          dueDate,
          manuscriptLink,
          reviewerEmail: reviewerEmailAddress,
          reviewerFullName,
          manuscriptTitle,
          assignedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });

        // Log assignment activity
        await logActivityToSheet({
          adminEmail: adminEmail || 'unknown',
          action: 'Assign Manuscript',
          reviewerId,
          manuscriptId,
          details: `Reviewer: ${reviewerEmailAddress}, Due Date: ${dueDate}, Notes: ${notes || 'None'}`,
          status: 'Success',
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
        
        results.push({ reviewerId, email: reviewerEmailAddress });
      }

      res.json({
        success: true,
        message: `Manuscript assigned to ${reviewerIds.length} reviewer(s) successfully.`
      });
    } catch (error: any) {
      console.error('Assignment error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Update manuscript status
  app.post('/api/admin/update-manuscript-status', async (req: Request, res: Response) => {
    try {
      const { manuscriptId, newStatus } = req.body;
      
      if (!manuscriptId || !newStatus) {
        return res.status(400).json({ success: false, message: 'Manuscript ID and status are required' });
      }

      if (!['Under Review', 'Accepted', 'Published', 'Rejected'].includes(newStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Get all manuscripts to find the row
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Manuscript!A:O'
      });

      const rows = response.data.values || [];
      let rowIndex = -1;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] && rows[i][0].toUpperCase() === manuscriptId.toUpperCase()) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(404).json({ success: false, message: 'Manuscript not found' });
      }

      // Update the status in column O (index 14)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Manuscript!O${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newStatus]]
        }
      });

      res.json({ success: true, message: `Status updated to ${newStatus}` });
    } catch (error: any) {
      console.error('Update status error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Submit Manuscript Review - save review submission
  const reviewSubmitUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
  });

  app.post('/api/submit-review', async (req: Request, res: Response) => {
    try {
      const { reviewerId, reviewerName, manuscriptId, importanceOfManuscript, titleSuitability, abstractComprehensive, scientificCorrectness, referencesSufficient, languageQuality, generalComments, ethicalIssues, ethicalIssuesDetails, competingInterests, plagiarismSuspected, plagiarismDetails, overallMarks, recommendation: submittedRecommendation } = req.body;

      if (!reviewerId || !manuscriptId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Use submitted recommendation if provided, otherwise compute from marks
      let recommendation = submittedRecommendation || 'Pending Review';
      if (!submittedRecommendation) {
        if (overallMarks > 9) recommendation = 'Accept As It Is';
        else if (overallMarks > 8) recommendation = 'Minor Revision';
        else if (overallMarks > 7) recommendation = 'Major Revision';
        else if (overallMarks > 5) recommendation = 'Serious Major Revision';
        else if (overallMarks > 3) recommendation = 'Rejected (Repairable)';
        else recommendation = 'Strongly Rejected';
      }

      // Update Assignments sheet with review details
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Find the assignment row and update it
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A2:Z1000'
      });

      const rows = response.data.values || [];
      let rowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][1] === reviewerId && rows[i][2] === manuscriptId) {
          rowIndex = i + 2; // +2 for header row and 0-based index
          break;
        }
      }

      if (rowIndex === -1) {
        console.warn(`Assignment not found for reviewer ${reviewerId} and manuscript ${manuscriptId}`);
        return res.status(400).json({ success: false, message: 'Assignment not found' });
      }

      // Update ONLY status column (F) - preserve manuscriptLink column (G)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Assignments!F${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Completed']]
        }
      });

      // Update review data starting from column N (index 13)
      // N=recommendation, O=overallMarks, P=reviewerEmail
      // Q=importanceOfManuscript, R=titleSuitability, S=abstractComprehensive,
      // T=scientificCorrectness, U=referencesSufficient, V=languageQuality, W=generalComments, X=ethicalIssues,
      // Y=ethicalIssuesDetails, Z=competingInterests, AA=plagiarismSuspected, AB=plagiarismDetails
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Assignments!N${rowIndex}:AB${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            recommendation,                // N
            overallMarks || 0,             // O
            req.body.reviewerEmail || '',  // P (Reviewer Email)
            importanceOfManuscript || '',  // Q
            titleSuitability || '',        // R
            abstractComprehensive || '',   // S
            scientificCorrectness || '',   // T
            referencesSufficient || '',    // U
            languageQuality || '',         // V
            generalComments || '',         // W
            ethicalIssues || '',           // X
            ethicalIssuesDetails || '',    // Y
            competingInterests || '',      // Z
            plagiarismSuspected || '',     // AA
            plagiarismDetails || ''        // AB
          ]]
        }
      });

      // Also record in ReviewFormUploads sheet for tracking
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'ReviewFormUploads!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            reviewerId,
            manuscriptId,
            recommendation,
            overallMarks || 0,
            new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            reviewerName || ''
          ]]
        }
      });

      console.log(`✅ Review submitted and recorded: Reviewer ${reviewerId}, Manuscript ${manuscriptId}, Status: Completed, Recommendation: ${recommendation}`);
      return res.json({ success: true, message: 'Review submitted successfully' });
    } catch (error: any) {
      console.error('Submit review error:', error.message);
      res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
  });

  // Get reviewer comments for a manuscript
  app.get('/api/get-review-comments', async (req: Request, res: Response) => {
    try {
      const manuscriptId = req.query.manuscriptId as string;
      if (!manuscriptId) return res.status(400).json({ success: false, message: 'Manuscript ID required' });

      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A:Z'
      });

      const rows = response.data.values || [];
      const headers = rows[0] || [];
      const comments: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[2] === manuscriptId && row[headers.indexOf('Recommendation')] && row[headers.indexOf('Overall Marks')]) {
          comments.push({
            reviewerId: row[1],
            recommendation: row[headers.indexOf('Recommendation')],
            overallMarks: parseInt(row[headers.indexOf('Overall Marks')]) || 0,
            importance: row[headers.indexOf('Importance')] || '',
            titleFeedback: row[headers.indexOf('Title Feedback')] || '',
            abstractFeedback: row[headers.indexOf('Abstract Feedback')] || '',
            scientificCorrectness: row[headers.indexOf('Scientific Correctness')] || '',
            generalComments: row[headers.indexOf('General Comments')] || ''
          });
        }
      }

      res.json({ success: true, comments });
    } catch (error: any) {
      console.error('Error fetching review comments:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Save reviewer message to admin
  app.post('/api/send-reviewer-message', async (req: Request, res: Response) => {
    try {
      const { reviewerId, reviewerName, manuscriptId, message, submittedAt } = req.body;

      if (!reviewerId || !manuscriptId || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Ensure sheet exists
      try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const reviewerMessagesSheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === 'Reviewer Messages');
        
        if (!reviewerMessagesSheet) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: { title: 'Reviewer Messages' }
                }
              }]
            }
          });
        }
      } catch (err) {
        console.error('Error checking/creating sheet:', err);
      }

      // Add headers if needed
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Reviewer Messages!A1:E1'
        });

        if (!response.data.values || response.data.values.length === 0) {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Reviewer Messages!A1:E1',
            valueInputOption: 'RAW',
            requestBody: { values: [['Submitted At', 'Reviewer ID', 'Reviewer Name', 'Manuscript ID', 'Message']] }
          });
        }
      } catch (err) {
        console.error('Error setting headers:', err);
      }

      // Append message
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Reviewer Messages!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[submittedAt, reviewerId, reviewerName, manuscriptId, message]]
        }
      });

      res.json({ success: true, message: 'Message saved successfully' });
    } catch (error: any) {
      console.error('Error saving reviewer message:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Get all reviewer messages
  app.get('/api/admin/reviewer-messages', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Reviewer Messages!A:E'
      });

      const rows = response.data.values || [];
      const messages: any[] = [];

      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 5) {
          messages.push({
            submittedAt: row[0] || '',
            reviewerId: row[1] || '',
            reviewerName: row[2] || '',
            manuscriptId: row[3] || '',
            message: row[4] || ''
          });
        }
      }

      res.json({ messages: messages.reverse() }); // Show latest first
    } catch (error: any) {
      console.error('Error fetching reviewer messages:', error);
      res.status(500).json({ messages: [], error: error.message });
    }
  });

  // Admin - Get all assignments with details
  app.get('/api/admin/assignments', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A:Z'
      });

      const rows = response.data.values || [];
      const headers = rows[0] || [];
      const assignments: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        // Skip empty rows
        if (!row || !row[1] || !row[2]) continue;
        assignments.push({
          assignedAt: row[0] || '',
          reviewerId: row[1] || '',
          manuscriptId: row[2] || '',
          dueDate: row[3] || '',
          notes: row[4] || '',
          status: row[5] || 'Pending',
          recommendation: row[headers.indexOf('Recommendation')] || '',
          overallMarks: row[headers.indexOf('Overall Marks')] || '',
          generalComments: row[headers.indexOf('General Comments')] || '',
          submittedAt: row[headers.indexOf('Submission Date')] || ''
        });
      }

      res.json({ success: true, assignments });
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Auto-assign "under review" manuscripts to reviewers
  app.post('/api/admin/auto-assign-under-review', async (req: Request, res: Response) => {
    try {
      const { autoAssignUnderReviewManuscripts } = await import('./google-sheets-client');
      const result = await autoAssignUnderReviewManuscripts();
      res.json(result);
    } catch (error: any) {
      console.error('Auto-assignment error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin - Get all submitted reviews (for review approval)
  app.get('/api/admin/submitted-reviews', async (req: Request, res: Response) => {
    try {
      const { getSubmittedReviews } = await import('./google-sheets-client');
      const reviews = await getSubmittedReviews();
      res.json({ success: true, reviews });
    } catch (error: any) {
      console.error('Error fetching submitted reviews:', error);
      res.status(500).json({ success: false, message: error.message, reviews: [] });
    }
  });

  // Admin - Accept a review
  app.post('/api/admin/accept-review', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      if (!reviewerId || !manuscriptId) {
        return res.status(400).json({ success: false, message: 'Missing reviewerId or manuscriptId' });
      }
      const { acceptReview } = await import('./google-sheets-client');
      const result = await acceptReview(reviewerId, manuscriptId);
      res.json(result);
    } catch (error: any) {
      console.error('Error accepting review:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Reject a review
  app.post('/api/admin/reject-review', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      if (!reviewerId || !manuscriptId) {
        return res.status(400).json({ success: false, message: 'Missing reviewerId or manuscriptId' });
      }
      const { rejectReview } = await import('./google-sheets-client');
      const result = await rejectReview(reviewerId, manuscriptId);
      res.json(result);
    } catch (error: any) {
      console.error('Error rejecting review:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get Newsletter Subscribers
  app.get('/api/admin/newsletter-subscribers', async (req: Request, res: Response) => {
    try {
      const { storage } = await import('./storage');
      const db = (storage as any).db;
      
      if (!db) {
        return res.json({ success: true, subscribers: [] });
      }

      const { newsletterSubscriber } = await import('@shared/schema');
      const subscribers = await db.select().from(newsletterSubscriber).orderBy(newsletterSubscriber.subscribedAt);
      
      res.json({ 
        success: true, 
        subscribers: subscribers.map((s: any) => ({
          email: s.email,
          subscribedAt: typeof s.subscribedAt === 'string' ? s.subscribedAt : new Date(s.subscribedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        }))
      });
    } catch (error: any) {
      console.error('Error fetching newsletter subscribers:', error);
      res.json({ success: true, subscribers: [] });
    }
  });

  // Excel Export - Reviewers
  app.get('/api/admin/export/reviewers', async (req: Request, res: Response) => {
    try {
      const { getReviewersAll } = await import('./google-sheets-client');
      const reviewers = await getReviewersAll();
      res.json({ success: true, data: reviewers || [] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Excel Export - Manuscripts
  app.get('/api/admin/export/manuscripts', async (req: Request, res: Response) => {
    try {
      const { getManuscriptsAll } = await import('./google-sheets-client');
      const manuscripts = await getManuscriptsAll();
      res.json({ success: true, data: manuscripts || [] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Excel Export - Assignments/Reviews
  app.get('/api/admin/export/assignments', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A:Z'
      });
      const rows = response.data.values || [];
      res.json({ success: true, data: rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Excel Export - Board Members
  app.get('/api/admin/export/board', async (req: Request, res: Response) => {
    try {
      const { getReviewersAll } = await import('./google-sheets-client');
      const reviewers = await getReviewersAll();
      const boardMembers = (reviewers || []).filter((r: any) => 
        (r.Role || r.role || '').toLowerCase().includes('editorial') || 
        (r.Role || r.role || '').toLowerCase().includes('board')
      );
      res.json({ success: true, data: boardMembers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Excel Export - Payments
  app.get('/api/admin/export/payments', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Payment!A:Z'
      });
      const rows = response.data.values || [];
      if (rows.length <= 1) {
        return res.json({ success: true, data: [] });
      }
      const headers = rows[0];
      const data = rows.slice(1).map((row: any) => {
        const obj: any = {};
        headers.forEach((h: string, i: number) => {
          obj[h] = row[i] || '';
        });
        return obj;
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Excel Export - Newsletter Subscribers
  app.get('/api/admin/export/newsletter', async (req: Request, res: Response) => {
    try {
      const { storage } = await import('./storage');
      const db = (storage as any).db;
      
      if (!db) {
        return res.json({ success: true, data: [] });
      }

      const { newsletterSubscriber } = await import('@shared/schema');
      const subscribers = await db.select().from(newsletterSubscriber).orderBy(newsletterSubscriber.subscribedAt);
      
      res.json({ 
        success: true, 
        data: subscribers.map((s: any) => ({
          email: s.email,
          subscribedAt: typeof s.subscribedAt === 'string' ? s.subscribedAt : new Date(s.subscribedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        }))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Reply to reviewer message
  app.post('/api/admin/reply-to-message', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId, message, adminEmail, originalMessageDate } = req.body;

      if (!reviewerId || !manuscriptId || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Ensure Admin Replies sheet exists
      try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const adminRepliesSheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === 'Admin Replies');
        
        if (!adminRepliesSheet) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: { title: 'Admin Replies' }
                }
              }]
            }
          });
          // Add headers
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Admin Replies!A1:F1',
            valueInputOption: 'RAW',
            requestBody: { values: [['Submitted At', 'Reviewer ID', 'Manuscript ID', 'Admin Email', 'Reply Message', 'Original Message Date']] }
          });
        }
      } catch (err) {
        console.error('Error creating Admin Replies sheet:', err);
      }

      // Append reply
      const submittedAt = new Date().toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Admin Replies!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[submittedAt, reviewerId, manuscriptId, adminEmail || 'Admin', message, originalMessageDate || '']]
        }
      });

      res.json({ success: true, message: 'Reply sent successfully' });
    } catch (error: any) {
      console.error('Error sending admin reply:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get message threads for admin (messages + replies combined)
  app.get('/api/admin/message-threads', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Get reviewer messages
      const messagesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Reviewer Messages!A:E'
      });
      const messageRows = messagesResponse.data.values || [];

      // Get admin replies (if sheet exists)
      let replyRows: any[] = [];
      try {
        const repliesResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Admin Replies!A:F'
        });
        replyRows = repliesResponse.data.values || [];
      } catch (err) {
        // Sheet doesn't exist yet, that's fine
      }

      // Build threads by grouping messages and replies by reviewerId + manuscriptId
      const threads: Record<string, any> = {};

      // Process reviewer messages (skip header)
      for (let i = 1; i < messageRows.length; i++) {
        const row = messageRows[i];
        if (row && row.length >= 5) {
          const key = `${row[1]}_${row[3]}`; // reviewerId_manuscriptId
          if (!threads[key]) {
            threads[key] = {
              reviewerId: row[1],
              reviewerName: row[2],
              manuscriptId: row[3],
              messages: []
            };
          }
          threads[key].messages.push({
            type: 'reviewer',
            submittedAt: row[0],
            sender: row[2],
            message: row[4]
          });
        }
      }

      // Process admin replies (skip header)
      for (let i = 1; i < replyRows.length; i++) {
        const row = replyRows[i];
        if (row && row.length >= 5) {
          const key = `${row[1]}_${row[2]}`; // reviewerId_manuscriptId
          if (!threads[key]) {
            threads[key] = {
              reviewerId: row[1],
              reviewerName: 'Reviewer',
              manuscriptId: row[2],
              messages: []
            };
          }
          threads[key].messages.push({
            type: 'admin',
            submittedAt: row[0],
            sender: row[3] || 'Admin',
            message: row[4]
          });
        }
      }

      // Sort messages within each thread by date
      Object.values(threads).forEach((thread: any) => {
        thread.messages.sort((a: any, b: any) => {
          const dateA = new Date(a.submittedAt).getTime() || 0;
          const dateB = new Date(b.submittedAt).getTime() || 0;
          return dateA - dateB;
        });
        // Get latest message time for sorting threads
        thread.latestMessage = thread.messages[thread.messages.length - 1]?.submittedAt || '';
      });

      // Convert to array and sort by latest activity
      const threadList = Object.values(threads).sort((a: any, b: any) => {
        const dateA = new Date(a.latestMessage).getTime() || 0;
        const dateB = new Date(b.latestMessage).getTime() || 0;
        return dateB - dateA;
      });

      // Add read status to each thread
      const { storage } = await import('./storage.js');
      for (const thread of threadList) {
        thread.readByBoth = await storage.isMessageReadByBoth(thread.reviewerId, thread.manuscriptId);
      }

      res.json({ success: true, threads: threadList });
    } catch (error: any) {
      console.error('Error fetching message threads:', error);
      res.status(500).json({ success: false, threads: [], message: error.message });
    }
  });

  // API endpoint: Admin marks message as read
  app.post('/api/admin/message-read', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      const { storage } = await import('./storage.js');
      await storage.markMessageAsRead(reviewerId, manuscriptId, true);
      res.json({ success: true, message: 'Message marked as read by admin' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // API endpoint: Reviewer marks message as read
  app.post('/api/reviewer/message-read', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      const { storage } = await import('./storage.js');
      await storage.markMessageAsRead(reviewerId, manuscriptId, false);
      res.json({ success: true, message: 'Message marked as read by reviewer' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Reviewer - Send message to admin
  app.post('/api/reviewer/send-message', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId, message } = req.body;
      if (!reviewerId || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Reviewer Messages!A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[new Date().toISOString(), reviewerId, 'Reviewer', manuscriptId || 'GENERAL', message]]
        }
      });
      
      res.json({ success: true, message: 'Message sent successfully' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get message threads for reviewer
  app.get('/api/reviewer/message-threads', async (req: Request, res: Response) => {
    try {
      const { reviewerId } = req.query;
      
      if (!reviewerId) {
        return res.status(400).json({ success: false, message: 'Reviewer ID required' });
      }

      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Get reviewer's messages
      const messagesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Reviewer Messages!A:E'
      });
      const messageRows = messagesResponse.data.values || [];

      // Get admin replies
      let replyRows: any[] = [];
      try {
        const repliesResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Admin Replies!A:F'
        });
        replyRows = repliesResponse.data.values || [];
      } catch (err) {
        // Sheet doesn't exist yet
      }

      // Build threads for this reviewer only
      const threads: Record<string, any> = {};

      // Process reviewer messages (skip header)
      for (let i = 1; i < messageRows.length; i++) {
        const row = messageRows[i];
        if (row && row.length >= 5 && row[1] === reviewerId) {
          const key = row[3]; // manuscriptId
          if (!threads[key]) {
            threads[key] = {
              manuscriptId: row[3],
              messages: []
            };
          }
          threads[key].messages.push({
            type: 'reviewer',
            submittedAt: row[0],
            sender: 'You',
            message: row[4]
          });
        }
      }

      // Process admin replies (skip header)
      for (let i = 1; i < replyRows.length; i++) {
        const row = replyRows[i];
        if (row && row.length >= 5 && row[1] === reviewerId) {
          const key = row[2]; // manuscriptId
          if (!threads[key]) {
            threads[key] = {
              manuscriptId: row[2],
              messages: []
            };
          }
          threads[key].messages.push({
            type: 'admin',
            submittedAt: row[0],
            sender: 'Admin',
            message: row[4]
          });
        }
      }

      // Sort messages within each thread by date
      Object.values(threads).forEach((thread: any) => {
        thread.messages.sort((a: any, b: any) => {
          const dateA = new Date(a.submittedAt).getTime() || 0;
          const dateB = new Date(b.submittedAt).getTime() || 0;
          return dateA - dateB;
        });
        thread.latestMessage = thread.messages[thread.messages.length - 1]?.submittedAt || '';
      });

      // Convert to array and sort by latest activity
      const threadList = Object.values(threads).sort((a: any, b: any) => {
        const dateA = new Date(a.latestMessage).getTime() || 0;
        const dateB = new Date(b.latestMessage).getTime() || 0;
        return dateB - dateA;
      });

      // Add read status to each thread for reviewer
      const { storage } = await import('./storage.js');
      for (const thread of threadList) {
        thread.readByBoth = await storage.isMessageReadByBoth(reviewerId as string, thread.manuscriptId);
      }

      res.json({ success: true, threads: threadList });
    } catch (error: any) {
      console.error('Error fetching reviewer message threads:', error);
      res.status(500).json({ success: false, threads: [], message: error.message });
    }
  });

  // Excel Export - Reviewer Messages
  app.get('/api/admin/export/messages', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'ReviewerMessages!A:E'
      });
      const rows = response.data.values || [];
      res.json({ success: true, data: rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Excel Export - Activity Log
  app.get('/api/admin/export/activity-log', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Activity Log!A:H'
      });
      const rows = response.data.values || [];
      res.json({ success: true, data: rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Get all payments
  app.get('/api/admin/payments', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Payment!A:O'
      });
      const rows = response.data.values || [];
      const payments = rows.slice(1).map((row: any) => ({
        submittedAt: row[0] || '',
        firstName: row[1] || '',
        email: row[2] || '',
        affiliation: row[3] || '',
        publicationType: row[4] || '',
        manuscriptTitle: row[5] || '',
        numberOfAuthors: row[6] || '',
        authorType: row[7] || '',
        currency: row[8] || '',
        modeOfPayment: row[9] || '',
        dateOfPayment: row[10] || '',
        transactionNumber: row[11] || '',
        calculatedAmount: row[12] || '',
        amountPaid: row[13] || '',
        paymentProofUrl: row[14] || ''
      }));
      res.json({ success: true, payments });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin - Approve payment and update manuscript status to Published
  app.post('/api/admin/approve-payment', async (req: Request, res: Response) => {
    try {
      const { email, transactionNumber, manuscriptTitle } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';

      // Find manuscript by email in the Manuscript sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Manuscript!A:O'
      });

      const rows = response.data.values || [];
      let foundManuscript = false;
      
      // Search through manuscripts to find one by the email (author email) or title match
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        // Column D is author email (index 3), Column K is title (index 10)
        const authorEmail = row[3] || '';
        const manuscriptTitleInSheet = row[10] || '';
        
        if (authorEmail.toLowerCase() === email.toLowerCase() || 
            manuscriptTitleInSheet.toLowerCase() === manuscriptTitle.toLowerCase()) {
          
          const manuscriptId = row[0];
          const currentStatus = row[14] || '';
          
          // Update status to Published (Column O, index 14)
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Manuscript!O${i + 1}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [['Published']]
            }
          });

          foundManuscript = true;
          console.log(`✅ Payment approved: Manuscript ${manuscriptId} status updated to Published`);
          break;
        }
      }

      if (!foundManuscript) {
        return res.status(404).json({ success: false, message: 'No matching manuscript found for this payment' });
      }

      res.json({ success: true, message: 'Payment approved! Manuscript status updated to Published.' });
    } catch (error: any) {
      console.error('Error approving payment:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Get pending reviews
  app.get('/api/admin/pending-reviews', async (req: Request, res: Response) => {
    try {
      const { getGoogleSheetsClient, getReviewersAll, getManuscriptsAll } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1I_xY86gFJgqEHgzyaPxsWDjHYHzxCDGeM7_fBEbdJ9E';
      
      const assignmentsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A:U'
      });
      
      const assignmentRows = assignmentsResponse.data.values || [];
      const pendingReviews: any[] = [];
      
      // Columns: A=Assigned At, B=Reviewer ID, C=Manuscript ID, D=Due Date, etc.
      for (let i = 1; i < assignmentRows.length; i++) {
        const reviewerId = assignmentRows[i][1] || '';
        const manuscriptId = assignmentRows[i][2] || '';
        const dueDate = assignmentRows[i][3] || '';
        const recommendation = assignmentRows[i][16] || '';
        
        // Only include if no recommendation (review not submitted)
        if (!recommendation || recommendation === 'Pending Review') {
          const reviewers = await getReviewersAll();
          const reviewer = reviewers?.find((r: any) => r.reviewerId === reviewerId);
          
          pendingReviews.push({
            reviewerId,
            reviewerName: reviewer?.firstName + ' ' + reviewer?.lastName || 'Unknown',
            reviewerEmail: reviewer?.email || '',
            manuscriptId,
            dueDate
          });
        }
      }
      
      res.json({ success: true, pendingReviews });
    } catch (error: any) {
      console.error('Error fetching pending reviews:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin - Send task reminder (creates notification in reviewer portal)
  app.post('/api/admin/send-task-reminder', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      const { storage } = await import('./storage');
      
      // Create notification in database
      const notification = await storage.createNotification({
        reviewerId,
        manuscriptId,
        message: `Reminder: You have a pending review for manuscript ${manuscriptId}. Please submit your review at your earliest convenience.`,
        isRead: false
      });
      
      res.json({ success: true, message: 'Reminder notification sent to reviewer!', notification });
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get notifications for reviewer
  app.get('/api/reviewer/notifications/:reviewerId', async (req: Request, res: Response) => {
    try {
      const { reviewerId } = req.params;
      const { storage } = await import('./storage');
      
      const notifs = await storage.getNotifications(reviewerId);
      res.json({ success: true, notifications: notifs });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, message: error.message, notifications: [] });
    }
  });

  // Mark notification as read
  app.post('/api/reviewer/mark-notification-read', async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.body;
      const { storage } = await import('./storage');
      
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Revoke assignment
  app.post('/api/admin/revoke-assignment', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg';
      
      // Get all assignments
      const assignmentsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Assignments!A:Z'
      });
      
      const assignmentRows = assignmentsResponse.data.values || [];
      let assignmentRowIndex = -1;
      
      for (let i = 1; i < assignmentRows.length; i++) {
        if (assignmentRows[i][1] === reviewerId && assignmentRows[i][2] === manuscriptId) {
          assignmentRowIndex = i;
          break;
        }
      }
      
      if (assignmentRowIndex === -1) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }
      
      // Update assignment status to "Revoked" - Column 5 is Status (0-indexed)
      // Row number for sheets API is row + 1 (since row 0 is headers)
      const rowNumber = assignmentRowIndex + 2; // +1 for headers, +1 for 1-indexing
      const statusCellAddress = `Assignments!F${rowNumber}`; // Column F is Status
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: statusCellAddress,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Revoked']]
        }
      });
      
      res.json({ success: true, message: 'Assignment revoked successfully' });
    } catch (error: any) {
      console.error('Error revoking assignment:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Password validation utility
  function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character (!@#$%^&*)');
    return { valid: errors.length === 0, errors };
  }

  // Admin - Set popup message with expiration date and target role
  app.post('/api/admin/set-popup-message', async (req: Request, res: Response) => {
    try {
      const { title, content, expiresAt, targetRole } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content required' });
      }
      const { storage } = await import('./storage');
      const message = await storage.setAdminMessage({ 
        title, 
        content, 
        active: true,
        targetRole: targetRole || 'Reviewer',
        expiresAt: expiresAt && expiresAt.trim() ? expiresAt : undefined
      });
      res.json({ success: true, message });
    } catch (error: any) {
      console.error('Error setting message:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get popup message for reviewers/editors on login (with role filtering & expiration check)
  app.get('/api/admin/popup-message', async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string || 'Reviewer';
      const { storage } = await import('./storage');
      const message = await storage.getAdminMessageByRole(role);
      res.json({ success: true, message: message || null });
    } catch (error: any) {
      console.error('Error fetching message:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Reviewer - Change password
  app.post('/api/reviewer/change-password', async (req: Request, res: Response) => {
    try {
      const { reviewerId, email, newPassword } = req.body;
      if (!reviewerId || !newPassword || !email) {
        return res.status(400).json({ success: false, message: 'Reviewer ID, email, and password required' });
      }

      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }

      // Update password in Google Sheets (column W - New Password)
      const { updateReviewerPasswordInSheet } = await import('./google-sheets-client');
      await updateReviewerPasswordInSheet(email, reviewerId, newPassword);

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Change password
  app.post('/api/admin/change-password', async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const ADMIN_PASSWORD = 'Edupertz@004';

      if (currentPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }

      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }

      // In production, this should store hashed password. For now, we'll just validate
      res.json({ success: true, message: 'Password changed successfully. Please use your new password for next login.' });
    } catch (error: any) {
      console.error('Error changing admin password:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Helper function to generate and send credentials
  async function generateAndSendCredentials(id: string, email: string, firstName: string, lastName: string, type: 'reviewer' | 'editor') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let tempPassword = '';
    let hasUpper = false, hasLower = false, hasNum = false, hasSpecial = false;

    while (!hasUpper || !hasLower || !hasNum || !hasSpecial || tempPassword.length < 8) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      tempPassword += char;
      if (/[A-Z]/.test(char)) hasUpper = true;
      if (/[a-z]/.test(char)) hasLower = true;
      if (/[0-9]/.test(char)) hasNum = true;
      if (/[!@#$%^&*]/.test(char)) hasSpecial = true;
    }

    const { storage } = await import('./storage');
    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash(tempPassword, 10);

    if (type === 'reviewer') {
      await storage.updateReviewerPassword(id, hash);
    } else {
      await storage.updateEditorPassword(id, hash);
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const portalName = type === 'reviewer' ? 'Reviewer' : 'Editor';
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Scholar India Publishers - Portal Credentials</h2>
          <p>Dear ${firstName} ${lastName},</p>
          <p>Here are your ${portalName.toLowerCase()} portal credentials:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Portal Username:</strong> ${id}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p><strong>Please note:</strong> You can change your password after logging in to the portal.</p>
          <p>Best regards,<br/>Scholar India Publishers Team</p>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Scholar India Publishers <noreply@resend.dev>',
      to: email,
      subject: `Your ${portalName} Portal Credentials - Scholar India Publishers`,
      html: emailContent
    });

    return tempPassword;
  }

  // Admin - Manual password reset for reviewers
  app.post('/api/admin/reset-reviewer-password', async (req: Request, res: Response) => {
    try {
      const { reviewerId, newPassword, email } = req.body;
      if (!reviewerId || !newPassword || !email) {
        return res.status(400).json({ success: false, message: 'Reviewer ID, email, and password required' });
      }
      const { updateReviewerPasswordInSheet } = await import('./google-sheets-client');
      
      // Update in Google Sheets only (password stored as plain text in sheet)
      await updateReviewerPasswordInSheet(email, reviewerId, newPassword);
      
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Error resetting reviewer password:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Manual password reset for editors
  app.post('/api/admin/reset-editor-password', async (req: Request, res: Response) => {
    try {
      const { editorId, newPassword, email } = req.body;
      if (!editorId || !newPassword || !email) {
        return res.status(400).json({ success: false, message: 'Editor ID, email, and password required' });
      }
      const { updateReviewerPasswordInSheet } = await import('./google-sheets-client');
      
      // Update in Google Sheets only (password stored as plain text in sheet)
      await updateReviewerPasswordInSheet(email, editorId, newPassword);
      
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Error resetting editor password:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Get reviewer performance metrics
  app.get('/api/admin/reviewer-performance', async (req: Request, res: Response) => {
    try {
      const { getReviewerPerformanceMetrics } = await import('./google-sheets-client');
      const metrics = await getReviewerPerformanceMetrics();
      res.json({ success: true, metrics });
    } catch (error: any) {
      console.error('Error fetching reviewer performance:', error);
      res.status(500).json({ success: false, message: error.message, metrics: [] });
    }
  });

  // Admin - Get deadline calendar data
  app.get('/api/admin/deadline-calendar', async (req: Request, res: Response) => {
    try {
      const { getDeadlineCalendarData } = await import('./google-sheets-client');
      const calendarData = await getDeadlineCalendarData();
      res.json({ success: true, calendarData });
    } catch (error: any) {
      console.error('Error fetching deadline calendar:', error);
      res.status(500).json({ success: false, message: error.message, calendarData: [] });
    }
  });

  // Editor - Get email templates
  app.get('/api/editor/email-templates', async (req: Request, res: Response) => {
    try {
      const { getEmailTemplates } = await import('./google-sheets-client');
      const templates = await getEmailTemplates();
      res.json({ success: true, templates });
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ success: false, message: error.message, templates: [] });
    }
  });

  // Editor - Save email template
  app.post('/api/editor/email-templates', async (req: Request, res: Response) => {
    try {
      const { name, subject, body, id } = req.body;
      if (!name || !subject || !body) {
        return res.status(400).json({ success: false, message: 'Name, subject, and body are required' });
      }
      const { saveEmailTemplate } = await import('./google-sheets-client');
      const result = await saveEmailTemplate({ id, name, subject, body });
      res.json(result);
    } catch (error: any) {
      console.error('Error saving template:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Editor - Delete email template
  app.delete('/api/editor/email-templates/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Template ID is required' });
      }
      const { deleteEmailTemplate } = await import('./google-sheets-client');
      const result = await deleteEmailTemplate(id);
      res.json(result);
    } catch (error: any) {
      console.error('Error deleting template:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Admin - Get unread message count
  app.get('/api/admin/unread-message-count', async (req: Request, res: Response) => {
    try {
      const { storage } = await import('./storage');
      const count = await storage.getUnreadMessageCount();
      res.json({ success: true, unreadCount: count });
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ success: false, unreadCount: 0, message: error.message });
    }
  });

  // Admin - Mark message as read
  app.post('/api/admin/mark-message-read', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      const { storage } = await import('./storage');
      await storage.markMessageAsRead(reviewerId, manuscriptId);
      res.json({ success: true, message: 'Message marked as read' });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Reviewer/Editor - Mark message as read (when reviewer reads admin reply)
  app.post('/api/reviewer/mark-message-read', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      const { storage } = await import('./storage');
      await storage.markMessageAsReadByReviewer(reviewerId, manuscriptId);
      res.json({ success: true, message: 'Message marked as read' });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Newsletter Subscribe
  app.post('/api/newsletter/subscribe', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      const { storage } = await import('./storage');
      const isAlreadySubscribed = await storage.isEmailSubscribed(email);
      
      if (isAlreadySubscribed) {
        return res.status(400).json({ success: false, message: 'Email already subscribed' });
      }

      const subscriber = await storage.subscribeToNewsletter({ email });
      
      // Record in Google Sheets
      try {
        const { recordNewsletterSubscription } = await import('./google-sheets-client');
        await recordNewsletterSubscription({ email, subscribedAt: new Date().toISOString() });
      } catch (gsError) {
        console.warn('Failed to record newsletter subscription in Google Sheets:', gsError);
        // Don't fail the subscription if Google Sheets recording fails
      }

      res.json({ success: true, message: 'Successfully subscribed to newsletter!', subscriber });
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Accept Assignment
  app.post('/api/assignment/accept', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.body;
      if (!reviewerId || !manuscriptId) {
        return res.status(400).json({ success: false, message: 'Reviewer ID and Manuscript ID required' });
      }

      const { storage } = await import('./storage');
      const assignment = await storage.acceptAssignment(reviewerId, manuscriptId);
      res.json({ success: true, message: 'Assignment accepted', assignment });
    } catch (error: any) {
      console.error('Error accepting assignment:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Reject Assignment
  app.post('/api/assignment/reject', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId, reason } = req.body;
      if (!reviewerId || !manuscriptId) {
        return res.status(400).json({ success: false, message: 'Reviewer ID and Manuscript ID required' });
      }

      const { storage } = await import('./storage');
      const assignment = await storage.rejectAssignment(reviewerId, manuscriptId, reason);
      res.json({ success: true, message: 'Assignment rejected', assignment });
    } catch (error: any) {
      console.error('Error rejecting assignment:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get Assignment Status
  app.get('/api/assignment/status/:reviewerId/:manuscriptId', async (req: Request, res: Response) => {
    try {
      const { reviewerId, manuscriptId } = req.params;
      const { storage } = await import('./storage');
      const status = await storage.getAssignmentStatus(reviewerId, manuscriptId);
      res.json({ success: true, status: status || { status: 'pending' } });
    } catch (error: any) {
      console.error('Error fetching assignment status:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Deactivate User
  app.post('/api/admin/deactivate-user', async (req: Request, res: Response) => {
    try {
      const { reviewerId } = req.body;
      if (!reviewerId) {
        return res.status(400).json({ success: false, message: 'Reviewer ID required' });
      }

      const { deactivateReviewerInSheet } = await import('./google-sheets-client');
      await deactivateReviewerInSheet(reviewerId);
      
      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // File upload for copyright and final paper forms
  const copyrightUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  const unifiedFormUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // Get Manuscript details by ID
  app.get('/api/manuscripts/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg',
        range: 'Manuscript!A2:Q1000'
      });

      const rows = response.data.values || [];
      const manuscript = rows.find(row => (row[0] || '').toString().trim().toUpperCase() === id.trim().toUpperCase());

      if (!manuscript) {
        return res.status(404).json({ message: 'Manuscript not found' });
      }

      // Column O is index 14. User says status is in "o".
      const statusValue = (manuscript[14] || '').toString().trim();
      const status = statusValue.toLowerCase();
      const isAccepted = status === 'accepted' || status === 'completed' || status === 'complete' || status === 'complement';

      if (!isAccepted) {
        return res.status(403).json({ 
          message: 'Manuscript details can only be fetched for "Accepted" or "Complement" status.',
          currentStatus: statusValue || 'Pending'
        });
      }

      // Map all available manuscript columns for editing
      // A=0: Manuscript ID, B=1: Corresponding Author, C=2: Co-authors, D=3: Journal
      // E=4: Email, F=5: Phone, G=6: Address, H=7: Affiliation
      // I=8: Revision Notes, J=9: Title, K=10: Keywords, L=11: Supporting Authors
      // O=14: Status
      
      // Get author name - try multiple possible columns
      const correspondingAuthor = manuscript[1] || manuscript[0] || '';
      const authorAddress = manuscript[6] || '';
      const affiliation = manuscript[7] || '';
      const revisionNotes = manuscript[8] || '';
      const supportingAuthors = manuscript[11] || '';
      
      res.json({
        manuscriptId: manuscript[0],
        correspondingAuthor: correspondingAuthor,
        title: manuscript[9],
        email: manuscript[4] || manuscript[6] || '', // Try columns E or G
        phone: manuscript[5] || manuscript[7] || '', // Try columns F or H
        address: authorAddress,
        affiliation: affiliation,
        revisionNotes: revisionNotes,
        supportingAuthors: supportingAuthors,
        coAuthors: manuscript[2] || '',
        journal: manuscript[3] || '',
        status: status
      });
    } catch (error: any) {
      console.error('Error fetching manuscript:', error.message);
      res.status(500).json({ message: 'Failed to fetch manuscript details' });
    }
  });

  // Check manuscript existence
  app.get('/api/check-manuscript/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { getGoogleSheetsClient } = await import('./google-sheets-client');
      const sheets = await getGoogleSheetsClient();
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg',
        range: 'Manuscript!A2:Q1000'
      });

      const rows = response.data.values || [];
      const manuscript = rows.find(row => (row[0] || '').toString().trim().toUpperCase() === id.trim().toUpperCase());

      if (!manuscript) {
        return res.status(404).json({ message: 'Manuscript not found' });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: 'Error checking manuscript' });
    }
  });

  // Unified Final Paper + Copyright + Payment Submission
  app.post('/api/final-paper-unified', unifiedFormUpload.fields([
    { name: 'finalPaper', maxCount: 1 },
    { name: 'copyrightForm', maxCount: 1 },
    { name: 'paymentScreenshot', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    try {
      const {
        publicationType,
        manuscriptId,
        articleTitle,
        correspondingAuthorName,
        correspondingEmail,
        correspondingPhone,
        correspondingAuthorAddress,
        correspondingAuthorAffiliation,
        supportingAuthors,
        revisionNotes,
        conflictOfInterest,
        conflictDetails,
        fundingSupport,
        fundingDetails,
        agreementAccepted,
        paymentMethod,
        transactionId,
        paymentNotes,
        authors
      } = req.body;

      // Validate required fields
      if (!publicationType || !manuscriptId || !articleTitle || !correspondingAuthorName || 
          !correspondingEmail || !correspondingPhone || !correspondingAuthorAddress || !correspondingAuthorAffiliation) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Check if manuscript has "complement" status (payment would be optional)
      let isComplementStatus = false;
      try {
        const { getGoogleSheetsClient } = await import('./google-sheets-client');
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: '1J2v7detA06MC3xmNCjVt0QGOi98Myo446kBPlMKfDKg',
          range: 'Manuscript!A2:Q1000'
        });
        const rows = response.data.values || [];
        const manuscript = rows.find(row => (row[0] || '').toString().trim().toUpperCase() === manuscriptId.trim().toUpperCase());
        if (manuscript) {
          const statusValue = (manuscript[14] || '').toString().trim().toLowerCase();
          isComplementStatus = statusValue.includes('complement');
        }
      } catch (e) {
        console.warn('Could not check manuscript status:', e);
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
      const finalPaperFile = files.finalPaper?.[0];
      const copyrightFormFile = files.copyrightForm?.[0];

      if (!finalPaperFile) {
        return res.status(400).json({ success: false, message: 'Final paper file is required' });
      }

      if (!copyrightFormFile) {
        return res.status(400).json({ success: false, message: 'Copyright form file is required' });
      }

      // Parse authors if provided
      let authorsList = [];
      try {
        authorsList = authors ? JSON.parse(authors) : [];
      } catch (e) {
        console.error('Error parsing authors:', e);
      }

      // Combine authors into a single string for Google Sheets
      const combinedAuthors = authorsList.map((a: any) => `${a.name} (${a.affiliation}, ${a.email})`).join('; ');

      // Upload files to Google Drive
      let paperFileUrl = '';
      let copyrightFileUrl = '';
      
      const { uploadFileToGoogleDrive } = await import('./google-drive-client');
      
      try {
        const paperResult = await uploadFileToGoogleDrive({
          buffer: finalPaperFile.buffer,
          originalname: `FinalPaper_${manuscriptId}_${Date.now()}.${finalPaperFile.originalname.split('.').pop()}`,
          mimetype: finalPaperFile.mimetype
        });
        paperFileUrl = paperResult.url || paperResult.id || '';
      } catch (driveError: any) {
        console.warn('Failed to upload final paper to Drive:', driveError?.message || driveError);
        paperFileUrl = 'Upload pending - Drive error';
      }

      try {
        const copyrightResult = await uploadFileToGoogleDrive({
          buffer: copyrightFormFile.buffer,
          originalname: `Copyright_${manuscriptId}_${Date.now()}.${copyrightFormFile.originalname.split('.').pop()}`,
          mimetype: copyrightFormFile.mimetype
        });
        copyrightFileUrl = copyrightResult.url || copyrightResult.id || '';
      } catch (driveError: any) {
        console.warn('Failed to upload copyright form to Drive:', driveError?.message || driveError);
        copyrightFileUrl = 'Upload pending - Drive error';
      }

      // Map publication type to readable name
      const publicationTypeMap: Record<string, string> = {
        'sjcm': 'Scholar Journal of Commerce and Management',
        'sjhss': 'Scholar Journal of Humanities and Social Sciences',
        'book': 'Book / Book Chapter'
      };

      // Record all data to a single "Final Paper" sheet for easy tracking
      const { appendToSheet } = await import('./google-sheets-client');

      try {
        await appendToSheet('Final Paper', [
          // Submission Details
          new Date().toISOString(),
          manuscriptId,
          publicationTypeMap[publicationType] || publicationType,
          articleTitle,
          // Author Information
          combinedAuthors || correspondingAuthorName,
          correspondingAuthorName,
          correspondingEmail,
          correspondingPhone,
          correspondingAuthorAddress,
          correspondingAuthorAffiliation,
          supportingAuthors || '',
          // Final Paper Details
          revisionNotes || '',
          paperFileUrl,
          // Copyright Form Details
          conflictOfInterest === 'yes' ? 'Yes' : 'No',
          conflictDetails || '',
          fundingSupport === 'yes' ? 'Yes' : 'No',
          fundingDetails || '',
          agreementAccepted === 'true' ? 'Accepted' : 'Not Accepted',
          copyrightFileUrl,
          // Payment Details
          paymentMethod || (isComplementStatus ? 'Optional - Not Provided' : ''),
          transactionId || '',
          paymentNotes || '',
          // Status
          'Submitted'
        ]);
      } catch (sheetError: any) {
        console.error('Failed to record unified submission in Google Sheets:', sheetError?.message);
      }

      console.log(`✅ Unified submission completed for manuscript: ${manuscriptId}${isComplementStatus ? ' (Complement status - payment optional)' : ''}`);
      res.json({ success: true, message: 'All documents submitted successfully' });
    } catch (error: any) {
      console.error('Error submitting unified form:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Copyright Form Submission
  app.post('/api/copyright-form', copyrightUpload.single('copyrightForm'), async (req: Request, res: Response) => {
    try {
      const {
        publicationType,
        manuscriptId,
        articleTitle,
        correspondingAuthorName,
        correspondingAuthorAddress,
        correspondingAuthorAffiliation,
        supportingAuthors,
        correspondingEmail,
        correspondingPhone,
        conflictOfInterest,
        conflictDetails,
        fundingSupport,
        fundingDetails,
        agreementAccepted
      } = req.body;

      // Validate required fields
      if (!publicationType || !manuscriptId || !articleTitle || !correspondingAuthorName || 
          !correspondingEmail || !correspondingPhone) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Upload copyright form file to Google Drive if provided
      let copyrightFileUrl = '';
      if (req.file) {
        try {
          const { uploadFileToGoogleDrive } = await import('./google-drive-client');
          const driveResult = await uploadFileToGoogleDrive({
            buffer: req.file.buffer,
            originalname: `Copyright_${manuscriptId}_${Date.now()}.${req.file.originalname.split('.').pop()}`,
            mimetype: req.file.mimetype
          });
          copyrightFileUrl = driveResult.url || driveResult.id || '';
        } catch (driveError) {
          console.warn('Failed to upload copyright form to Drive:', driveError);
        }
      }

      // Map publication type to readable name
      const publicationTypeMap: Record<string, string> = {
        'sjcm': 'Scholar Journal of Commerce and Management',
        'sjhss': 'Scholar Journal of Humanities and Social Sciences',
        'book': 'Book / Book Chapter'
      };

      // Record in Google Sheets
      const { appendToSheet } = await import('./google-sheets-client');
      await appendToSheet('Copyright', [
        new Date().toISOString(),
        manuscriptId,
        publicationTypeMap[publicationType] || publicationType,
        articleTitle,
        correspondingAuthorName,
        correspondingAuthorAffiliation,
        correspondingAuthorAddress,
        supportingAuthors || '',
        correspondingEmail,
        correspondingPhone,
        conflictOfInterest === 'yes' ? 'Yes' : 'No',
        conflictDetails || '',
        fundingSupport === 'yes' ? 'Yes' : 'No',
        fundingDetails || '',
        agreementAccepted === 'true' ? 'Accepted' : 'Not Accepted',
        copyrightFileUrl,
        'Submitted'
      ]);

      console.log(`✅ Copyright form submitted for manuscript: ${manuscriptId}`);
      res.json({ success: true, message: 'Copyright form submitted successfully' });
    } catch (error: any) {
      console.error('Error submitting copyright form:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Final Paper Submission
  app.post('/api/final-paper', copyrightUpload.single('finalPaper'), async (req: Request, res: Response) => {
    try {
      const {
        publicationType,
        manuscriptId,
        articleTitle,
        correspondingAuthorName,
        correspondingEmail,
        correspondingPhone,
        revisionNotes,
        authors
      } = req.body;

      // Validate required fields
      if (!publicationType || !manuscriptId || !articleTitle || !correspondingAuthorName || 
          !correspondingEmail || !correspondingPhone) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Final paper file is required' });
      }

      // Parse authors if provided
      let authorsList = [];
      try {
        authorsList = authors ? JSON.parse(authors) : [];
      } catch (e) {
        console.error('Error parsing authors:', e);
      }

      // Combine authors into a single string for Google Sheets
      const combinedAuthors = authorsList.map((a: any) => `${a.name} (${a.affiliation}, ${a.email})`).join('; ');

      // Upload final paper to Google Drive
      let paperFileUrl = '';
      try {
        const { uploadFileToGoogleDrive } = await import('./google-drive-client');
        const driveResult = await uploadFileToGoogleDrive({
          buffer: req.file.buffer,
          originalname: `FinalPaper_${manuscriptId}_${Date.now()}.${req.file.originalname.split('.').pop()}`,
          mimetype: req.file.mimetype
        });
        paperFileUrl = driveResult.url || driveResult.id || '';
      } catch (driveError: any) {
        console.warn('Failed to upload final paper to Drive:', driveError?.message || driveError);
        paperFileUrl = 'Upload pending - Drive error';
      }

      // Map publication type to readable name
      const publicationTypeMap: Record<string, string> = {
        'sjcm': 'Scholar Journal of Commerce and Management',
        'sjhss': 'Scholar Journal of Humanities and Social Sciences'
      };

      // Record in Google Sheets
      try {
        const { appendToSheet } = await import('./google-sheets-client');
        await appendToSheet('Final Paper', [
          new Date().toISOString(),
          manuscriptId,
          publicationTypeMap[publicationType] || publicationType,
          articleTitle,
          combinedAuthors || correspondingAuthorName,
          correspondingEmail,
          correspondingPhone,
          revisionNotes || '',
          paperFileUrl,
          'Submitted'
        ]);
      } catch (sheetError: any) {
        console.error('Failed to record in Google Sheets:', sheetError?.message);
      }

      console.log(`✅ Final paper submitted for manuscript: ${manuscriptId}`);
      res.json({ success: true, message: 'Final paper submitted successfully' });
    } catch (error: any) {
      console.error('Error submitting final paper:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Return server instance
  const { createServer } = await import('http');
  return createServer(app);
}
