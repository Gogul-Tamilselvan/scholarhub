## Overview

Scholar India Publishers is an academic publishing platform for international peer-reviewed journals, "Scholar Journal of Commerce and Management" and "Scholar Journal of Humanities and Social Sciences". The platform aims to provide a modern, efficient, and SEO-optimized online presence for academic publishing, offering comprehensive journal information, author guidelines, manuscript submission, and various publishing services (book publication with DOI, conference proceedings) to a global audience of authors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite)
- **Routing**: Wouter
- **UI**: Tailwind CSS with shadcn/ui for custom academic design (deep blue backgrounds, gold yellow content cards).
- **Animations**: Framer Motion
- **State Management**: TanStack Query (server state), React hooks (local state).
- **SEO**: Dynamic meta tags, Open Graph, Twitter Cards, JSON-LD structured data, canonical URLs, optimized titles and descriptions, keyword optimization, and geo-targeting.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **API**: RESTful endpoints for submissions.
- **File Handling**: Multer for manuscript uploads.
- **Google Sheets Integration**: Service account for data storage.
- **Google Drive Integration**: OAuth2 for permanent manuscript file storage.
- **Email Automation**: Resend API for confirmation emails.
- **Dynamic SEO**: Dynamic sitemap.xml and robots.txt.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM on Neon Database serverless instance.
- **Schema**: User management with UUID primary keys.
- **Migrations**: Drizzle-kit.
- **Google Sheets**: Centralized spreadsheet for all form submissions and admin data across multiple sheets (Reviewers, Manuscript, Contact, Payment, Books, Assignments, ReviewFormUploads, Reviewer Messages, Admin Replies, Newsletter).
- **Assignments Sheet Structure**: Columns A-M: AssignedAt, ReviewerID, ManuscriptID, DueDate, Notes, Status, ManuscriptLink, Recommendation, OverallMarks, ReviewerEmail, ReviewerFullName, ManuscriptTitle, CertificateNo (8-digit alphanumeric auto-generated).

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store.
- **User Schema**: Basic username/password for admin, editor, and reviewer portals.

### UI/UX Decisions
- Modern About page design.
- Clear presentation of academic journals and services.
- Detailed reviewer information and application process.
- Transparent APC pricing structure with gradient cards.
- Tabbed interface for journal pages (Overview, Current Issue, Archives, Author Guidelines, Editorial Board, Submit Manuscript).
- Consistent blue/white color scheme.
- Redesigned Reviewer and Editor portals with side-by-side navigation, gradient sidebars, and professional single-page layouts.

### Feature Specifications
- **Journal Management**: Dedicated pages, tabbed interface, multi-author support, double-blind peer review, plagiarism policy.
- **Permanent URLs**: Stable landing pages for issues, articles, and PDFs.
- **Services Offered**: Book Publication (with DOI, ISBN), Conference & Seminars (special issue publication), and Other Services (editing, plagiarism check, translation).
- **Reviewer/Editor System**: Application system, Admin Dashboard for manuscript assignment (auto/manual, due dates), reviewer management, tracking, comprehensive 4-part peer review form (Part 1: Review Comments, Part 2: Ethics & Integrity, Part 3: Declaration, Part 4: Objective Evaluation with recommendation dropdown), approval workflow, password management. Reviewer and Editor dashboards display assigned manuscripts, performance metrics, deadlines, and a messaging system.
- **APC & Payment**: Clear pricing for Indian and International authors with payment submission form.
- **Contact & Communication**: Contact form with automated email confirmation.
- **Email Automation**: Specific confirmation emails for submissions and inquiries.
- **SEO & Discoverability**: Comprehensive SEO including meta tag optimization, dynamic routes for sitemap/robots.txt, structured data (Organization, Periodical, WebPage, Article, Breadcrumb, FAQ schemas), social media integration, search engine preferences, geo-targeting, and content optimization.
- **Activity Tracking**: Admin dashboard tracks significant reviewer/editor activities (Login, Updates, Messages, Review Submissions) with timestamps and IP addresses.
- **Admin Broadcast Messages**: Admins can send popup messages to reviewers.
- **Message Read Receipts**: Double tick marks indicate messages read by both parties, tracked in PostgreSQL.
- **Newsletter Subscription**: Footer subscription, emails recorded in PostgreSQL and Google Sheets.
- **Assignment Acceptance System**: Reviewers/Editors can Accept or Reject manuscript assignments.
- **User Deactivation**: Admin portal feature to deactivate reviewers/editors, updating status in Google Sheets.
- **Admin Dashboard**: Features CSV export for various data, enforces max 3 reviewers per manuscript, shows full review details before decision, includes reviewer performance tab, and offers reminder/revoke options for assignments.
- **ID Generation**: Auto-generated IDs for Manuscript, Editor, and Reviewer with a new format including month (e.g., MANSJCM251200AB).

## External Dependencies

- **Database Provider**: Neon Database (PostgreSQL)
- **UI Components**: Radix UI (primitives), shadcn/ui
- **Form Handling**: React Hook Form, Zod
- **File Upload Processing**: Multer
- **Styling**: Tailwind CSS, PostCSS
- **Animations**: Framer Motion
- **Font Loading**: Google Fonts
- **Email Service**: Resend
- **Spreadsheet Integration**: Google Sheets API v4 (googleapis package)