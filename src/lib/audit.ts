/**
 * Audit logging utility for tracking admin actions
 * Logs are stored in Firestore for compliance and security monitoring
 */

import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

/**
 * All possible audit action types that can be logged
 */
export type AuditAction =
  | 'event.create'
  | 'event.update'
  | 'event.delete'
  | 'event.duplicate'
  | 'event.import'
  | 'event.bulk_delete'
  | 'reflection.create'
  | 'reflection.update'
  | 'reflection.delete'
  | 'reflection.duplicate'
  | 'reflection.bulk_delete'
  | 'gallery.upload'
  | 'gallery.delete'
  | 'settings.update'
  | 'auth.login'
  | 'auth.logout';

/**
 * Structure of an audit log entry stored in Firestore
 */
export interface AuditLogEntry {
  /** Type of action performed */
  action: AuditAction;
  /** Firebase user ID who performed the action */
  userId: string;
  /** Email address of the user */
  userEmail: string;
  /** Server timestamp when action occurred */
  timestamp: ReturnType<typeof serverTimestamp>;
  /** Additional context about the action */
  details?: Record<string, unknown>;
  /** IP address of the user (if available) */
  ipAddress?: string;
  /** Browser user agent string */
  userAgent?: string;
}

/**
 * Log an admin action to Firestore for audit trail
 * Automatically captures user info, timestamp, and browser details
 * 
 * @param action - The type of action being performed
 * @param details - Additional context about the action (e.g., item ID, changes made)
 * @returns Promise that resolves when log is saved (errors are caught internally)
 * 
 * @example
 * await logAuditAction('event.create', { eventId: '123', title: 'New Event' });
 */
export async function logAuditAction(
  action: AuditAction,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    if (!auth) {
      console.warn('Firebase auth not configured');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      console.warn('Attempted to log audit action without authenticated user');
      return;
    }

    const logEntry: AuditLogEntry = {
      action,
      userId: user.uid,
      userEmail: user.email || 'unknown',
      timestamp: serverTimestamp(),
      details,
      userAgent: navigator.userAgent,
    };

    if (db) {
      await addDoc(collection(db, 'audit-logs'), logEntry);
    }
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw - audit logging failure shouldn't break the app
  }
}

/**
 * Get recent audit logs for the current authenticated user
 * 
 * @param maxResults - Maximum number of logs to retrieve (default: 50)
 * @returns Array of audit log entries, ordered by timestamp (newest first)
 * 
 * @example
 * const recentLogs = await getRecentAuditLogs(10);
 */
export async function getRecentAuditLogs(maxResults = 50): Promise<AuditLogEntry[]> {
  try {
    if (!auth) return [];
    const user = auth.currentUser;
    if (!user || !db) return [];

    const logsRef = collection(db, 'audit-logs');
    const q = query(
      logsRef,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AuditLogEntry);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Get all audit logs across all users (admin only)
 * Use with caution - may return large datasets
 * 
 * @param maxResults - Maximum number of logs to retrieve (default: 100)
 * @returns Array of audit log entries from all users, ordered by timestamp (newest first)
 * 
 * @example
 * const allLogs = await getAllAuditLogs(50);
 */
export async function getAllAuditLogs(maxResults = 100): Promise<AuditLogEntry[]> {
  try {
    if (!db) return [];

    const logsRef = collection(db, 'audit-logs');
    const q = query(
      logsRef,
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AuditLogEntry);
  } catch (error) {
    console.error('Failed to fetch all audit logs:', error);
    return [];
  }
}
