/**
 * src/features/notifications/types/notification.types.js
 *
 * JSDoc & Type definitions for the Velora Enterprise Notification System.
 */

/**
 * @typedef {
 *   | "FEATURED_JOB" | "NEW_JOB" | "JOB_MATCH" | "JOB_EXPIRED" | "JOB_REOPENED"
 *   | "APPLICATION_SUBMITTED" | "APPLICATION_RECEIVED" | "APPLICATION_SHORTLISTED"
 *   | "APPLICATION_REJECTED" | "APPLICATION_WITHDRAWN" | "APPLICATION_STATUS_UPDATED"
 *   | "INTERVIEW_SCHEDULED" | "INTERVIEW_REMINDER" | "INTERVIEW_COMPLETED"
 *   | "OFFER_RECEIVED" | "OFFER_ACCEPTED" | "OFFER_REJECTED"
 *   | "COMPANY_UPDATE" | "COMPANY_VERIFIED"
 *   | "PROFILE_COMPLETED" | "PROFILE_INCOMPLETE" | "RESUME_ANALYZED" | "AI_JOB_RECOMMENDATION"
 *   | "MESSAGE_RECEIVED"
 *   | "SYSTEM" | "ACCOUNT" | "SECURITY"
 * } NotificationType
 */

/**
 * @typedef {"CRITICAL" | "HIGH" | "MEDIUM" | "LOW"} NotificationPriority
 */

/**
 * @typedef {Object} NotificationItem
 * @property {number} id
 * @property {NotificationType} type
 * @property {NotificationPriority} priority
 * @property {string} title
 * @property {string} message
 * @property {string} [actionUrl]
 * @property {string} [image]
 * @property {string} [icon]
 * @property {number} [referenceId]
 * @property {"JOB" | "APPLICATION" | "COMPANY" | string} [referenceType]
 * @property {boolean} read
 * @property {boolean} archived
 * @property {string} createdAt
 * @property {string} [updatedAt]
 * @property {string} [expiresAt]
 */

/**
 * @typedef {Object} UnreadCountResponse
 * @property {number} count
 * @property {boolean} hasUnread
 */

/**
 * @template T
 * @typedef {Object} Page
 * @property {T[]} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} number
 * @property {number} size
 * @property {boolean} first
 * @property {boolean} last
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {T} data
 */

export {};
