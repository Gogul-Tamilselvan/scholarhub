import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username"),
  password: text("password").notNull(),
  role: text("role").notNull().default('admin'), // 'admin', 'reviewer', 'editor'
});

export const journals = pgTable("journals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subject: text("subject"),
  startingYear: text("starting_year"),
  aim: text("aim"),
  scope: text("scope"),
  publicationTypes: text("publication_types"),
  researchFocus: text("research_focus"),
  targetAudience: text("target_audience"),
  subjectCovers: text("subject_covers"), // Comma-separated list
  referenceStyle: text("reference_style").default("APA"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const journalVolumes = pgTable("journal_volumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalId: text("journal_id").notNull(), // FK to journals.id
  volumeNumber: integer("volume_number").notNull(),
  label: text("label"), // e.g. "Volume 1"
  period: text("period"), // e.g. "Jan - Dec 2026"
  status: text("status").default("In Progress"), // Published, In Progress
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const journalIssues = pgTable("journal_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  volumeId: text("volume_id").notNull(), // FK to journal_volumes.id
  journalId: text("journal_id").notNull(), // FK to journals.id
  issueNumber: integer("issue_number").notNull(),
  label: text("label"), // e.g. "Issue 1"
  period: text("period"), // e.g. "Jan - Mar 2026"
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const journalArticles = pgTable("journal_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  issueId: text("issue_id").notNull(), // FK to journal_issues.id
  journalId: text("journal_id").notNull(), // FK to journals.id
  articleId: text("article_id").notNull(), // e.g. "sjcm-v1i1-001"
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  affiliation: text("affiliation"),
  pages: text("pages"),
  doi: text("doi"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const journalStats = pgTable("journal_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalId: text("journal_id").notNull().unique(),
  journalTitle: text("journal_title").notNull(),
  visitors: integer("visitors").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: text("reviewer_id").notNull(),
  manuscriptId: text("manuscript_id").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reviewerPasswords = pgTable("reviewer_passwords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: text("reviewer_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const editorPasswords = pgTable("editor_passwords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  editorId: text("editor_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminMessage = pgTable("admin_message", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  targetRole: text("target_role").notNull().default('Reviewer'), // Reviewer, Editor, Editorial Board Member, or All
  expiresAt: timestamp("expires_at"), // When the message should stop showing (null = never expires)
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const loginActivity = pgTable("login_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: text("reviewer_id").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  role: text("role"),
  journal: text("journal"),
  activityType: text("activity_type").notNull().default('login'), // login, update, message, review_submission
  loginTime: timestamp("login_time").notNull().default(sql`CURRENT_TIMESTAMP`),
  ipAddress: text("ip_address"),
});

export const messageReadStatus = pgTable("message_read_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: text("reviewer_id").notNull(),
  manuscriptId: text("manuscript_id").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  readByBoth: boolean("read_by_both").notNull().default(false),
  adminReadAt: timestamp("admin_read_at"),
  reviewerReadAt: timestamp("reviewer_read_at"),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const newsletterSubscriber = pgTable("newsletter_subscriber", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const assignmentStatus = pgTable("assignment_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: text("reviewer_id").notNull(),
  manuscriptId: text("manuscript_id").notNull(),
  status: text("status").notNull().default('pending'), // pending, accepted, rejected
  acceptedAt: timestamp("accepted_at"),
  rejectionReason: text("rejection_reason"),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const copyrightSubmissions = pgTable("copyright_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  manuscriptId: text("manuscript_id").notNull(),
  journalOrBook: text("journal_or_book").notNull(), // Scholar Journal of Commerce and Management, Scholar Journal of Humanities and Social Sciences, Book/Book Chapter
  manuscriptTitle: text("manuscript_title").notNull(),
  correspondingAuthor: text("corresponding_author").notNull(),
  email: text("email").notNull(),
  contactNumber: text("contact_number").notNull(),
  conflictOfInterest: text("conflict_of_interest").notNull(),
  fundSupport: text("fund_support").notNull(),
  signatureName: text("signature_name").notNull(),
  submissionDate: text("submission_date").notNull(),
  place: text("place").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const finalPaperSubmissions = pgTable("final_paper_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  manuscriptId: text("manuscript_id").notNull(),
  manuscriptTitle: text("manuscript_title").notNull(),
  correspondingAuthor: text("corresponding_author").notNull(),
  email: text("email").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  role: true,
});

export const insertJournalStatsSchema = createInsertSchema(journalStats).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertReviewerPasswordSchema = createInsertSchema(reviewerPasswords).omit({
  id: true,
  updatedAt: true,
});

export const insertEditorPasswordSchema = createInsertSchema(editorPasswords).omit({
  id: true,
  updatedAt: true,
});

export const insertAdminMessageSchema = createInsertSchema(adminMessage).omit({
  id: true,
  updatedAt: true,
}).extend({
  expiresAt: z.string().optional(), // ISO date string
  targetRole: z.string().optional(),
});

export const insertLoginActivitySchema = createInsertSchema(loginActivity).omit({
  id: true,
  loginTime: true,
}).extend({
  activityType: z.enum(['login', 'update', 'message', 'review_submission']).default('login'),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscriber).omit({
  id: true,
  subscribedAt: true,
}).extend({
  email: z.string().email('Invalid email address'),
});

export const insertAssignmentStatusSchema = createInsertSchema(assignmentStatus).omit({
  id: true,
  updatedAt: true,
}).extend({
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
  acceptedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const insertCopyrightSubmissionSchema = createInsertSchema(copyrightSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertFinalPaperSubmissionSchema = createInsertSchema(finalPaperSubmissions).omit({
  id: true,
  createdAt: true,
});

// --- NEW SUPABASE-READY TYPES ---

export const manuscriptSchema = z.object({
  id: z.string(),
  submittedAt: z.string().or(z.date()).optional(),
  authorName: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  affiliation: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  journal: z.string().optional(),
  title: z.string().optional(),
  researchField: z.string().optional(),
  authorCount: z.number().optional(),
  authorNames: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.string().optional(),
  doi: z.string().optional(),
});

export const reviewerSchema = z.object({
  id: z.string(),
  submittedDate: z.string().or(z.date()).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  role: z.string().optional(),
  designation: z.string().optional(),
  areaOfInterest: z.string().optional(),
  journal: z.string().optional(),
  orcid: z.string().optional(),
  googleScholar: z.string().optional(),
  institution: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  pinNumber: z.string().optional(),
  nationality: z.string().optional(),
  messageToEditor: z.string().optional(),
  profilePdfLink: z.string().optional(),
  status: z.string().optional(),
  reviewsSubmitted: z.number().optional(),
  lastSubmissionDate: z.string().or(z.date()).optional(),
});

export const assignmentSchema = z.object({
  id: z.string().optional(),
  assignedAt: z.string().or(z.date()).optional(),
  reviewerId: z.string(),
  manuscriptId: z.string(),
  dueDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  manuscriptLink: z.string().optional(),
  recommendation: z.string().optional(),
  overallMarks: z.string().optional(),
  reviewerEmail: z.string().optional(),
});

export type Manuscript = z.infer<typeof manuscriptSchema>;
export type Reviewer = z.infer<typeof reviewerSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;

export const bookDownloads = pgTable("book_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: text("book_id").notNull().unique(),
  bookTitle: text("book_title").notNull(),
  downloads: integer("downloads").notNull().default(0),
});

export const insertBookDownloadSchema = createInsertSchema(bookDownloads).omit({
  id: true,
});

export type BookDownload = typeof bookDownloads.$inferSelect;
export type InsertBookDownload = z.infer<typeof insertBookDownloadSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type JournalStats = typeof journalStats.$inferSelect;
export type InsertJournalStats = z.infer<typeof insertJournalStatsSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ReviewerPassword = typeof reviewerPasswords.$inferSelect;
export type InsertReviewerPassword = z.infer<typeof insertReviewerPasswordSchema>;
export type EditorPassword = typeof editorPasswords.$inferSelect;
export type InsertEditorPassword = z.infer<typeof insertEditorPasswordSchema>;
export type AdminMessage = typeof adminMessage.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;
export type LoginActivity = typeof loginActivity.$inferSelect;
export type InsertLoginActivity = z.infer<typeof insertLoginActivitySchema>;
export type NewsletterSubscriber = typeof newsletterSubscriber.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type AssignmentStatus = typeof assignmentStatus.$inferSelect;
export type InsertAssignmentStatus = z.infer<typeof insertAssignmentStatusSchema>;

export type CopyrightSubmission = typeof copyrightSubmissions.$inferSelect;
export type InsertCopyrightSubmission = z.infer<typeof insertCopyrightSubmissionSchema>;

export type FinalPaperSubmission = typeof finalPaperSubmissions.$inferSelect;
export type InsertFinalPaperSubmission = z.infer<typeof insertFinalPaperSubmissionSchema>;
