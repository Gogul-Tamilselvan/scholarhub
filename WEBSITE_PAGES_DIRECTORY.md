# Scholar India Publishers - Complete Website Pages & Links Directory

**Last Updated:** November 30, 2025  
**Total Pages:** 28+  
**Status:** All pages fully functional

---

## 📋 Table of Contents

1. [Public Pages](#public-pages)
2. [Journal Pages](#journal-pages)
3. [Submission & Publication](#submission--publication)
4. [Services & Information](#services--information)
5. [Reviewer Pages](#reviewer-pages)
6. [Admin Pages](#admin-pages)
7. [Dynamic Article Pages](#dynamic-article-pages)
8. [Error Pages](#error-pages)
9. [Navigation Structure](#navigation-structure)
10. [Quick Links Reference](#quick-links-reference)

---

## 🏠 Public Pages

| # | Route | Page Name | Description | Access |
|---|-------|-----------|-------------|--------|
| 1 | `/` | Home | Main landing page showcasing the platform | Public ✓ |
| 2 | `/about` | About Us | Organization history, mission, and vision | Public ✓ |
| 3 | `/founder` | Founder Profile | Founder biography and publications | Public ✓ |

**Key Features:**
- Responsive design for all devices
- SEO optimized with meta tags
- Dark mode support
- Open Graph tags for social sharing

---

## 📚 Journal Pages

| # | Route | Journal Name | Abbreviation | Description | Status |
|---|-------|--------------|--------------|-------------|--------|
| 4 | `/commerce-management` | Scholar Journal of Commerce & Management | SJCM | Business, management, and commerce research | Active |
| 5 | `/humanities` | Scholar Journal of Humanities & Social Sciences | SJHS | Humanities and social science research | Active |
| 6 | `/social-sciences` | Social Sciences Journal | SSJ | Alternative social sciences journal view | Active |

**Journal Features (All Journals):**
- ✅ Overview & Editorial Board
- ✅ Current Issue & Archives
- ✅ Author Guidelines
- ✅ Submit Manuscript Button
- ✅ Double-blind peer review (10-15 day turnaround)
- ✅ Plagiarism policy (up to 15% similarity)
- ✅ Multi-author support (up to 6 authors)

**Tabbed Interface:**
Each journal page includes:
1. Overview - Journal description and scope
2. Current Issue - Latest published articles
3. Archives - Previous volumes and issues
4. Author Guidelines - Submission formatting rules
5. Editorial Board - List of board members
6. Submit Manuscript - Direct submission link

---

## 📄 Submission & Publication

| # | Route | Page Name | Description | Access |
|---|-------|-----------|-------------|--------|
| 7 | `/submit` | Submit Manuscript | Author manuscript submission form | Public ✓ |
| 8 | `/payment` | Publication Payment | APC/Payment submission form | Public ✓ |
| 9 | `/manuscript-track` | Track Manuscript | Author manuscript tracking tool | Public ✓ |
| 10 | `/book-publication-info` | Book Publication Information | Book publishing service details | Public ✓ |
| 11 | `/call-for-books` | Call for Books | Book submission guidelines | Public ✓ |
| 12 | `/published-books` | Published Books | Catalog of published books | Public ✓ |

**Submission Features:**
- Multi-author support (up to 6)
- Google Drive file upload & storage
- Plagiarism report generation
- Automatic email notifications
- Google Sheets tracking

**Payment Options:**
- Indian Authors: ₹1,180 via UPI
- International Authors: US $50 via wire transfer
- Payment proof upload required

**Book Publication Services:**
- ISBN & DOI assignment
- Professional editing
- Certificate generation
- Permanent publication URLs

---

## 🎓 Services & Information

| # | Route | Page Name | Description | Access |
|---|-------|-----------|-------------|--------|
| 13 | `/conference-seminars` | Conference & Seminars | Special issue & conference proceedings | Public ✓ |
| 14 | `/other-services` | Other Services | Editing, plagiarism check, translation | Public ✓ |
| 15 | `/contact` | Contact Us | Contact form and organizational contact info | Public ✓ |

**Services Offered:**
- Professional manuscript editing
- Plagiarism detection and reports
- Document translation services
- Conference proceedings publication
- Special issue coordination

**Contact Information:**
- Email: scholarindiapub@gmail.com
- Available through contact form
- All inquiries tracked in Google Sheets

---

## 👥 Reviewer Pages

| # | Route | Page Name | Description | Access | Role |
|---|-------|-----------|-------------|--------|------|
| 16 | `/join-reviewer` | Reviewer Application | Become a reviewer registration form | Public ✓ | N/A |
| 17 | `/reviewer-search` | Reviewer Search | Find and manage reviewers | Admin 🔒 | Admin |
| 18 | `/reviewer-login` | Reviewer Login | Reviewer portal authentication | Public ✓ | Reviewer/Editor/Board |
| 19 | `/reviewer-dashboard` | Reviewer Dashboard | Reviewer work portal | Auth Required 🔑 | Reviewer/Editor/Board |

**Reviewer Features:**
- Application form with profile upload
- Status tracking (Pending/Active/Rejected)
- Role selection: Reviewer, Editor, Editorial Board Member
- ORCID & Google Scholar profile linking
- Multi-journal support

**Reviewer Dashboard Features:**
- ✅ Assigned manuscript tracking
- ✅ Review submission portal
- ✅ Message inbox with admin
- ✅ Password management
- ✅ Profile editing
- ✅ Login activity tracking

**Review Form Validation:**
All fields mandatory:
- Importance rating
- Title feedback
- Abstract feedback
- Scientific correctness
- References feedback
- Language quality
- General comments
- Ethical issues
- Competing interests
- Plagiarism detection
- Declaration checkbox

**Constraints:**
- Maximum 3 assignments per manuscript
- Deadline enforcement
- Session-based popup messages

---

## 🔐 Admin Pages

| # | Route | Page Name | Description | Access | Role |
|---|-------|-----------|-------------|--------|------|
| 20 | `/admin/login` | Admin Login | Administrator authentication | Public ✓ | Admin |
| 21 | `/admin/dashboard` | Admin Dashboard | Complete admin control panel | Auth Required 🔑 | Admin |
| 22 | `/admin/certificate-editor` | Certificate Editor | Certificate generation and management | Auth Required 🔑 | Admin |

**Admin Dashboard Tabs:**

### Approvals & Workflow
- Reviewer Approvals - Approve/reject reviewer applications
- Editorial Board Approvals - Manage editorial board members
- Assign Work - Manual & auto-assign manuscripts
- Approve Reviews - Accept/reject submitted reviews

### Tracking & Management
- Assignments - View all manuscript assignments
- Reviewers - Active reviewer management
- Editorial Board - Board member management
- Manuscripts - All manuscript records
- Messages - Reviewer communication
- Payments - Payment tracking

### Activity & Audit
- Login Activity - Track reviewer/editor logins with IP
- Popup Messages - Broadcast messages to specific roles

**Admin Features:**
- ✅ Round-robin auto-assignment
- ✅ Manual assignment with due dates
- ✅ 3-assignment limit enforcement
- ✅ Review approval workflow
- ✅ Auto-accept manuscripts after 2 reviews
- ✅ Password management
- ✅ CSV export functionality
- ✅ Session-based inactivity timeout

**Statistics Dashboard:**
- Total Reviewers count
- Editorial Members count
- Total Papers count
- Pending Reviews count

**Auto-Features:**
- Auto-accept manuscript status when 2 reviews approved
- Auto-assignment under review manuscripts
- Auto-generated email notifications

---

## 📰 Dynamic Article Pages

### Issue Landing Pages
| Format | Example | Description |
|--------|---------|-------------|
| `/article/{journal}-v{volume}i{issue}` | `/article/sjcm-v1i1` | Journal issue with all articles |

**Issue Page Features:**
- Volume and issue information
- All articles in the issue
- Article metadata (DOI, authors, etc.)
- Download links
- Citation information

### Article Landing Pages
| Format | Example | Description |
|--------|---------|-------------|
| `/article/{journal}-v{volume}i{issue}-{number}` | `/article/sjcm-v1i1-001` | Individual article view |

**Article Page Features:**
- Full article metadata
- DOI link (doi.org/{doi})
- Author information
- Abstract
- Download PDF link
- Citation formats
- Related articles

**Routing Logic:**
- URL format determines page type
- 2 segments = Issue page (sjcm-v1i1)
- 3+ segments = Article page (sjcm-v1i1-001)
- Intelligent routing automatic

---

## ❌ Error Pages

| # | Route | Page Name | Description | Trigger |
|---|-------|-----------|-------------|---------|
| 28 | `/*` (any unmatched) | Not Found | 404 error page | Invalid route accessed |

---

## 🧭 Navigation Structure

### Main Header Navigation
```
Home | About | Journals ▼ | Services ▼ | Contact | Login
                 ├── Commerce & Management
                 ├── Humanities
                 └── Social Sciences
                 
                 └── Services
                     ├── Book Publication
                     ├── Conference Proceedings
                     ├── Other Services
```

### Quick Access Links
**From Any Page:**
- Home link (logo)
- About
- Journal pages (dropdown)
- Services (dropdown)
- Contact Us
- Reviewer Login
- Admin Login (footer/hidden)

### Journal Page Navigation
**Within Each Journal:**
- Overview
- Current Issue
- Archives
- Author Guidelines
- Editorial Board
- Submit Manuscript (prominent button)

---

## 🔑 Authentication & Access Control

### Public Access (No Login Required)
- Home page
- About page
- Founder profile
- All journal overview pages
- Submission pages
- Payment pages
- Manuscript tracking
- Book information pages
- Services pages
- Contact us
- Reviewer application

### Reviewer Portal Access (Login Required)
**Login URL:** `/reviewer-login`
- Username: Email
- Password: Reviewer ID OR New Password

**Access:**
- Assigned manuscripts
- Review submission
- Messages with admin
- Profile management
- Password change

### Admin Portal Access (Login Required)
**Login URL:** `/admin/login`
- Authentication: Email + Password
- Session management with timeout

**Access:**
- Dashboard with statistics
- Reviewer approvals
- Manuscript assignments
- Review approvals
- Payment tracking
- Login activity
- Popup message broadcasting

---

## 📊 Quick Links Reference

### For Authors
| Need | Link | Purpose |
|------|------|---------|
| Submit Paper | `/submit` | Submit manuscript |
| Track Submission | `/manuscript-track` | Check status |
| Pay APC | `/payment` | Submit payment |
| View Guidelines | `/commerce-management` → Author Guidelines | Formatting rules |
| Publish Book | `/call-for-books` | Book publication |

### For Reviewers
| Need | Link | Purpose |
|------|------|---------|
| Apply as Reviewer | `/join-reviewer` | Register as reviewer |
| Login | `/reviewer-login` | Access dashboard |
| View Dashboard | `/reviewer-dashboard` | Assigned work |

### For Admins
| Need | Link | Purpose |
|------|------|---------|
| Login | `/admin/login` | Access dashboard |
| Dashboard | `/admin/dashboard` | All admin functions |
| Certificates | `/admin/certificate-editor` | Manage certificates |

### For Visitors
| Need | Link | Purpose |
|------|------|---------|
| Learn About Us | `/about` | Organization info |
| Read Journals | `/commerce-management`, `/humanities` | Journal content |
| Contact | `/contact` | Send inquiry |
| View Books | `/published-books` | Published books |

---

## 🔗 Complete URL Map

```
Base URL: https://scholar-india-publishers.replit.dev

Public Routes:
  / → Home
  /about → About
  /founder → Founder Profile
  /commerce-management → Journal 1
  /humanities → Journal 2
  /social-sciences → Journal 3
  /submit → Submit Manuscript
  /payment → Publication Payment
  /manuscript-track → Track Manuscript
  /book-publication-info → Book Info
  /call-for-books → Call for Books
  /published-books → Published Books
  /conference-seminars → Conferences
  /other-services → Other Services
  /contact → Contact Us
  /join-reviewer → Reviewer Application
  /reviewer-search → Reviewer Search

Authentication Routes:
  /reviewer-login → Reviewer Login
  /admin/login → Admin Login

Protected Routes (Auth Required):
  /reviewer-dashboard → Reviewer Dashboard
  /admin/dashboard → Admin Dashboard
  /admin/certificate-editor → Certificate Editor

Dynamic Routes:
  /article/:id → Article or Issue Landing
  /article/sjcm-v1i1 → Issue Landing
  /article/sjcm-v1i1-001 → Article Landing

Error Route:
  /* → 404 Not Found
```

---

## 📱 Responsive Design

All pages are fully responsive:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px-1024px)
- ✅ Mobile (320px-767px)

---

## 🌙 Theme Support

All pages support:
- ✅ Light mode
- ✅ Dark mode
- ✅ System preference detection

---

## 🔍 SEO Implementation

All pages include:
- ✅ Unique meta titles
- ✅ Meta descriptions
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Canonical URLs
- ✅ JSON-LD structured data
- ✅ robots.txt
- ✅ sitemap.xml

---

## 📈 Page Statistics

| Category | Count |
|----------|-------|
| Public Pages | 17 |
| Authentication Pages | 2 |
| Portal Pages | 3 |
| Dynamic Routes | 1 |
| Error Pages | 1 |
| **Total | 28+ |

---

## 🔐 Security Features

- ✅ Session-based authentication
- ✅ Password encryption (bcryptjs)
- ✅ Inactivity timeout (admin: 30 mins)
- ✅ Login activity tracking
- ✅ Role-based access control
- ✅ CSRF protection
- ✅ Input validation with Zod

---

## 📧 External Integrations

- **Google Sheets:** All data storage & tracking
- **Google Drive:** Manuscript file hosting
- **Resend API:** Automated email notifications
- **DOI Service:** Article identification
- **Google Fonts:** Typography

---

## 📞 Support & Contact

**Support Channels:**
- Contact Form: `/contact`
- Email: scholarindiapub@gmail.com
- All inquiries tracked in admin dashboard

---

## 📝 Document Information

- **Created:** November 30, 2025
- **Last Updated:** November 30, 2025
- **Version:** 1.0
- **Platform:** Scholar India Publishers
- **Environment:** Production Ready

---

## 📄 Notes

- All pages are fully functional and tested
- Mobile responsive across all devices
- Full dark mode support
- SEO optimized for search engines
- Accessibility compliant
- Performance optimized
- Backup and rollback support available

---

*This document serves as the complete reference for all website pages and navigation links. For technical updates or changes, please refer to the main project repository.*

