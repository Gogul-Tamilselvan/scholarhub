import { type User, type InsertUser, type JournalStats, type Notification, type InsertNotification, type AdminMessage, type InsertAdminMessage, type LoginActivity, type InsertLoginActivity, type NewsletterSubscriber, type InsertNewsletterSubscriber, type AssignmentStatus, type InsertAssignmentStatus, type BookDownload, users, journalStats, notifications, adminMessage, loginActivity, reviewerPasswords, editorPasswords, messageReadStatus, newsletterSubscriber, assignmentStatus, bookDownloads } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getJournalStats(journalId: string): Promise<JournalStats | undefined>;
  initializeJournalStats(stats: JournalStats[]): Promise<void>;
  incrementVisitors(journalId: string): Promise<JournalStats | undefined>;
  incrementDownloads(journalId: string): Promise<JournalStats | undefined>;
  getAllJournalStats(): Promise<JournalStats[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(reviewerId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  updateReviewerPassword(reviewerId: string, passwordHash: string): Promise<void>;
  updateEditorPassword(editorId: string, passwordHash: string): Promise<void>;
  setAdminMessage(message: InsertAdminMessage): Promise<AdminMessage>;
  getAdminMessage(): Promise<AdminMessage | undefined>;
  getAdminMessageByRole(role: string): Promise<AdminMessage | undefined>;
  logLoginActivity(activity: InsertLoginActivity): Promise<LoginActivity>;
  getLoginActivities(limit?: number): Promise<LoginActivity[]>;
  markMessageAsRead(reviewerId: string, manuscriptId: string, isAdmin?: boolean): Promise<void>;
  markMessageAsReadByReviewer(reviewerId: string, manuscriptId: string): Promise<void>;
  isMessageRead(reviewerId: string, manuscriptId: string): Promise<boolean>;
  isMessageReadByBoth(reviewerId: string, manuscriptId: string): Promise<boolean>;
  getUnreadMessageCount(): Promise<number>;
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  isEmailSubscribed(email: string): Promise<boolean>;
  acceptAssignment(reviewerId: string, manuscriptId: string): Promise<AssignmentStatus>;
  rejectAssignment(reviewerId: string, manuscriptId: string, reason?: string): Promise<AssignmentStatus>;
  getAssignmentStatus(reviewerId: string, manuscriptId: string): Promise<AssignmentStatus | undefined>;
  isAssignmentAccepted(reviewerId: string, manuscriptId: string): Promise<boolean>;
  deactivateUser(reviewerId: string): Promise<void>;
  getBookDownloads(bookId: string): Promise<BookDownload | undefined>;
  incrementBookDownloads(bookId: string, bookTitle: string): Promise<BookDownload>;
}

// In-memory storage for users (unchanged)
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private db: any;
  private rawSql: any;

  constructor(db?: any, rawSql?: any) {
    this.users = new Map();
    this.db = db;
    this.rawSql = rawSql;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getJournalStats(journalId: string): Promise<JournalStats | undefined> {
    if (!this.db) return undefined;
    try {
      const result = await this.db
        .select()
        .from(journalStats)
        .where(eq(journalStats.journalId, journalId));
      return result[0] || undefined;
    } catch (error) {
      console.warn("Error fetching journal stats from DB:", error);
      return undefined;
    }
  }

  async initializeJournalStats(stats: JournalStats[]): Promise<void> {
    if (!this.db) return;
    try {
      for (const stat of stats) {
        const existing = await this.db
          .select()
          .from(journalStats)
          .where(eq(journalStats.journalId, stat.journalId));
        
        if (existing.length === 0) {
          await this.db.insert(journalStats).values(stat);
        }
      }
    } catch (error) {
      console.warn("Error initializing journal stats:", error);
    }
  }

  async incrementVisitors(journalId: string): Promise<JournalStats | undefined> {
    if (!this.db) return undefined;
    try {
      const result = await this.db
        .select()
        .from(journalStats)
        .where(eq(journalStats.journalId, journalId));
      
      if (result.length === 0) return undefined;
      
      const current = result[0];
      const updated = {
        ...current,
        visitors: (current.visitors || 0) + 1
      };
      
      await this.db
        .update(journalStats)
        .set({ visitors: updated.visitors })
        .where(eq(journalStats.journalId, journalId));
      
      return updated as JournalStats;
    } catch (error) {
      console.warn("Error incrementing visitors:", error);
      return undefined;
    }
  }

  async incrementDownloads(journalId: string): Promise<JournalStats | undefined> {
    if (!this.db) return undefined;
    try {
      const result = await this.db
        .select()
        .from(journalStats)
        .where(eq(journalStats.journalId, journalId));
      
      if (result.length === 0) return undefined;
      
      const current = result[0];
      const updated = {
        ...current,
        downloads: (current.downloads || 0) + 1
      };
      
      await this.db
        .update(journalStats)
        .set({ downloads: updated.downloads })
        .where(eq(journalStats.journalId, journalId));
      
      return updated as JournalStats;
    } catch (error) {
      console.warn("Error incrementing downloads:", error);
      return undefined;
    }
  }

  async getAllJournalStats(): Promise<JournalStats[]> {
    if (!this.db) return [];
    try {
      return await this.db.select().from(journalStats);
    } catch (error) {
      console.warn("Error fetching all journal stats:", error);
      return [];
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const result = await this.db
        .insert(notifications)
        .values(notification)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotifications(reviewerId: string): Promise<Notification[]> {
    if (!this.db) return [];
    try {
      return await this.db
        .select()
        .from(notifications)
        .where(eq(notifications.reviewerId, reviewerId))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.warn("Error fetching notifications:", error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));
    } catch (error) {
      console.warn("Error marking notification as read:", error);
    }
  }

  async updateReviewerPassword(reviewerId: string, passwordHash: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const existing = await this.db
        .select()
        .from(reviewerPasswords)
        .where(eq(reviewerPasswords.reviewerId, reviewerId));
      
      if (existing.length > 0) {
        await this.db
          .update(reviewerPasswords)
          .set({ passwordHash, updatedAt: new Date() })
          .where(eq(reviewerPasswords.reviewerId, reviewerId));
      } else {
        await this.db
          .insert(reviewerPasswords)
          .values({ reviewerId, passwordHash });
      }
    } catch (error) {
      console.error("Error updating reviewer password:", error);
      throw error;
    }
  }

  async updateEditorPassword(editorId: string, passwordHash: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const existing = await this.db
        .select()
        .from(editorPasswords)
        .where(eq(editorPasswords.editorId, editorId));
      
      if (existing.length > 0) {
        await this.db
          .update(editorPasswords)
          .set({ passwordHash, updatedAt: new Date() })
          .where(eq(editorPasswords.editorId, editorId));
      } else {
        await this.db
          .insert(editorPasswords)
          .values({ editorId, passwordHash });
      }
    } catch (error) {
      console.error("Error updating editor password:", error);
      throw error;
    }
  }

  async setAdminMessage(message: InsertAdminMessage): Promise<AdminMessage> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      // Convert expiresAt string to Date if provided
      const messageData: any = {
        ...message,
        expiresAt: message.expiresAt ? new Date(message.expiresAt) : null
      };
      const result = await this.db
        .insert(adminMessage)
        .values(messageData)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error setting admin message:", error);
      throw error;
    }
  }

  async getAdminMessage(): Promise<AdminMessage | undefined> {
    if (!this.db) return undefined;
    try {
      const result = await this.db
        .select()
        .from(adminMessage)
        .where(eq(adminMessage.active, true))
        .orderBy(desc(adminMessage.updatedAt));
      return result[0];
    } catch (error) {
      console.warn("Error fetching admin message:", error);
      return undefined;
    }
  }

  async getAdminMessageByRole(role: string): Promise<AdminMessage | undefined> {
    if (!this.db) return undefined;
    try {
      const now = new Date();
      const result = await this.db
        .select()
        .from(adminMessage)
        .where(eq(adminMessage.active, true))
        .orderBy(desc(adminMessage.updatedAt));
      
      // Normalize role for flexible comparison (handles "Reviewer", "Editorial Board Member", "Editor", etc.)
      const normalizedUserRole = role.toLowerCase();
      const isReviewer = normalizedUserRole.includes('reviewer');
      const isEditor = normalizedUserRole.includes('editor') || normalizedUserRole.includes('board');
      
      // Filter for matching role and non-expired messages
      for (const msg of result) {
        const targetRole = (msg as any).targetRole || (msg as any).target_role || 'All';
        const targetRoleLower = targetRole.toLowerCase();
        
        // Check if message applies to this role: "All" applies to everyone, otherwise check specific role match
        let roleMatch = targetRoleLower === 'all';
        if (!roleMatch) {
          // Check if target role matches user's role (normalize role names for flexibility)
          if (targetRoleLower.includes('reviewer') && isReviewer) roleMatch = true;
          if ((targetRoleLower.includes('editor') || targetRoleLower.includes('board')) && isEditor) roleMatch = true;
          if (targetRoleLower === normalizedUserRole) roleMatch = true; // Exact match as fallback
        }
        
        const notExpired = !msg.expiresAt || new Date(msg.expiresAt) > now;
        
        if (roleMatch && notExpired) {
          return msg;
        }
      }
      return undefined;
    } catch (error: any) {
      // If targetRole column doesn't exist yet, gracefully return undefined
      if (error.code === '42703' || error.message?.includes('target_role')) {
        return undefined;
      }
      console.warn("Error fetching admin message by role:", error);
      return undefined;
    }
  }

  async logLoginActivity(activity: InsertLoginActivity): Promise<LoginActivity> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const result = await this.db
        .insert(loginActivity)
        .values(activity)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error logging login activity:", error);
      throw error;
    }
  }

  async getLoginActivities(limit: number = 100): Promise<LoginActivity[]> {
    if (!this.db) return [];
    try {
      const result = await this.db
        .select()
        .from(loginActivity)
        .orderBy(desc(loginActivity.loginTime))
        .limit(limit);
      return result;
    } catch (error) {
      console.warn("Error fetching login activities:", error);
      return [];
    }
  }

  async markMessageAsRead(reviewerId: string, manuscriptId: string, isAdmin: boolean = true): Promise<void> {
    if (!this.db) return;
    try {
      const existing = await this.db
        .select()
        .from(messageReadStatus)
        .where(eq(messageReadStatus.reviewerId, reviewerId) && eq(messageReadStatus.manuscriptId, manuscriptId));
      
      const now = new Date();
      const updateData: any = { isRead: true };
      
      if (isAdmin) {
        updateData.adminReadAt = now;
      } else {
        updateData.reviewerReadAt = now;
      }
      
      if (existing.length === 0) {
        await this.db.insert(messageReadStatus).values({
          reviewerId,
          manuscriptId,
          isRead: true,
          ...(isAdmin ? { adminReadAt: now } : { reviewerReadAt: now })
        });
      } else {
        const updated = await this.db.update(messageReadStatus)
          .set(updateData)
          .where(eq(messageReadStatus.reviewerId, reviewerId) && eq(messageReadStatus.manuscriptId, manuscriptId))
          .returning();
        
        // Check if both have read now
        if (updated[0]?.adminReadAt && updated[0]?.reviewerReadAt) {
          await this.db.update(messageReadStatus)
            .set({ readByBoth: true })
            .where(eq(messageReadStatus.reviewerId, reviewerId) && eq(messageReadStatus.manuscriptId, manuscriptId));
        }
      }
    } catch (error) {
      console.warn("Error marking message as read:", error);
    }
  }

  async markMessageAsReadByReviewer(reviewerId: string, manuscriptId: string): Promise<void> {
    return this.markMessageAsRead(reviewerId, manuscriptId, false);
  }

  async isMessageRead(reviewerId: string, manuscriptId: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      const result = await this.db
        .select()
        .from(messageReadStatus)
        .where(eq(messageReadStatus.reviewerId, reviewerId) && eq(messageReadStatus.manuscriptId, manuscriptId));
      return result.length > 0 && result[0].isRead;
    } catch (error) {
      console.warn("Error checking if message is read:", error);
      return false;
    }
  }

  async isMessageReadByBoth(reviewerId: string, manuscriptId: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      const result = await this.db
        .select()
        .from(messageReadStatus)
        .where(eq(messageReadStatus.reviewerId, reviewerId) && eq(messageReadStatus.manuscriptId, manuscriptId));
      return result.length > 0 && result[0].readByBoth;
    } catch (error) {
      console.warn("Error checking if message read by both:", error);
      return false;
    }
  }

  async getUnreadMessageCount(): Promise<number> {
    if (!this.db) return 0;
    try {
      const result = await this.db
        .select()
        .from(messageReadStatus)
        .where(eq(messageReadStatus.isRead, false));
      return result.length;
    } catch (error) {
      console.warn("Error getting unread message count:", error);
      return 0;
    }
  }

  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const result = await this.db
        .insert(newsletterSubscriber)
        .values(subscriber)
        .onConflictDoNothing()
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      throw error;
    }
  }

  async isEmailSubscribed(email: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      const result = await this.db
        .select()
        .from(newsletterSubscriber)
        .where(eq(newsletterSubscriber.email, email));
      return result.length > 0;
    } catch (error) {
      console.warn("Error checking subscription status:", error);
      return false;
    }
  }

  async acceptAssignment(reviewerId: string, manuscriptId: string): Promise<AssignmentStatus> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const result = await this.db
        .insert(assignmentStatus)
        .values({ reviewerId, manuscriptId, status: 'accepted', acceptedAt: new Date() })
        .onConflictDoUpdate({
          target: [assignmentStatus.reviewerId, assignmentStatus.manuscriptId],
          set: { status: 'accepted', acceptedAt: new Date() }
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error accepting assignment:", error);
      throw error;
    }
  }

  async rejectAssignment(reviewerId: string, manuscriptId: string, reason?: string): Promise<AssignmentStatus> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      const result = await this.db
        .insert(assignmentStatus)
        .values({ reviewerId, manuscriptId, status: 'rejected', rejectionReason: reason })
        .onConflictDoUpdate({
          target: [assignmentStatus.reviewerId, assignmentStatus.manuscriptId],
          set: { status: 'rejected', rejectionReason: reason }
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error rejecting assignment:", error);
      throw error;
    }
  }

  async getAssignmentStatus(reviewerId: string, manuscriptId: string): Promise<AssignmentStatus | undefined> {
    if (!this.db) return undefined;
    try {
      const result = await this.db
        .select()
        .from(assignmentStatus)
        .where(eq(assignmentStatus.reviewerId, reviewerId) && eq(assignmentStatus.manuscriptId, manuscriptId));
      return result[0];
    } catch (error) {
      console.warn("Error fetching assignment status:", error);
      return undefined;
    }
  }

  async isAssignmentAccepted(reviewerId: string, manuscriptId: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      const status = await this.getAssignmentStatus(reviewerId, manuscriptId);
      return status?.status === 'accepted';
    } catch (error) {
      console.warn("Error checking assignment acceptance:", error);
      return false;
    }
  }

  async deactivateUser(reviewerId: string): Promise<void> {
    // This marks user as deactivated in Reviewers sheet (will be done via API to Google Sheets)
    // For now, just log the action - actual deactivation happens in Google Sheets via the API
    console.log(`User ${reviewerId} marked for deactivation`);
  }

  async getBookDownloads(bookId: string): Promise<BookDownload | undefined> {
    if (!this.rawSql) return undefined;
    try {
      const result = await this.rawSql`SELECT id, book_id, book_title, downloads FROM book_downloads WHERE book_id = ${bookId} LIMIT 1`;
      if (!result || result.length === 0) return undefined;
      const r = result[0];
      return { id: r.id, bookId: r.book_id, bookTitle: r.book_title, downloads: Number(r.downloads) };
    } catch (error) {
      console.warn("Error fetching book downloads:", error);
      return undefined;
    }
  }

  async incrementBookDownloads(bookId: string, bookTitle: string): Promise<BookDownload> {
    if (!this.rawSql) {
      return { id: "mem", bookId, bookTitle, downloads: 0 };
    }
    try {
      const countResult = await this.rawSql`SELECT COUNT(*) as cnt FROM book_downloads WHERE book_id = ${bookId}`;
      const exists = countResult && countResult[0] && Number(countResult[0].cnt) > 0;

      if (!exists) {
        const id = randomUUID();
        await this.rawSql`INSERT INTO book_downloads (id, book_id, book_title, downloads) VALUES (${id}, ${bookId}, ${bookTitle}, 1)`;
        return { id, bookId, bookTitle, downloads: 1 };
      } else {
        const current = await this.rawSql`SELECT id, downloads FROM book_downloads WHERE book_id = ${bookId} LIMIT 1`;
        const currentDownloads = current && current[0] ? Number(current[0].downloads) : 0;
        const newCount = currentDownloads + 1;
        await this.rawSql`UPDATE book_downloads SET downloads = ${newCount} WHERE book_id = ${bookId}`;
        return { id: current[0].id, bookId, bookTitle, downloads: newCount };
      }
    } catch (error) {
      console.warn("Error incrementing book downloads:", error);
      return { id: "err", bookId, bookTitle, downloads: 0 };
    }
  }
}

// Initialize storage with database
let storage: IStorage = new MemStorage(); // Default fallback

// Async initialization function
export async function initializeStorage() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const sql = neon(dbUrl);
      const db = drizzle(sql);
      
      storage = new MemStorage(db, sql);

      // Ensure book_downloads table exists
      try {
        await sql`CREATE TABLE IF NOT EXISTS book_downloads (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          book_id TEXT NOT NULL UNIQUE,
          book_title TEXT NOT NULL,
          downloads INTEGER NOT NULL DEFAULT 0
        )`;
      } catch (tableErr) {
        console.warn("Could not create book_downloads table:", tableErr);
      }
      
      // Initialize default journals
      await storage.initializeJournalStats([
        {
          id: randomUUID(),
          journalId: "sjcm",
          journalTitle: "Commerce & Management",
          visitors: 0,
          downloads: 0
        },
        {
          id: randomUUID(),
          journalId: "sjhss",
          journalTitle: "Humanities and Social Sciences",
          visitors: 0,
          downloads: 0
        }
      ]);
      
      console.log("✅ Database storage initialized for journal stats");
      return storage;
    } else {
      storage = new MemStorage();
      console.log("⚠️  Using in-memory storage (DATABASE_URL not set)");
      return storage;
    }
  } catch (error) {
    console.error("❌ Failed to initialize database storage:", error);
    storage = new MemStorage();
    console.log("⚠️  Falling back to in-memory storage");
    return storage;
  }
}

export { storage };
