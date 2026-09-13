/**
 * src/api/verificationApi.js
 *
 * Centralized API service for Recruiter Verification and Admin Approval System.
 * Reuses the central Axios instance from src/config/Api.js.
 */

import { api } from "../config/Api";

// ─── Recruiter Self-Service Endpoints ──────────────────────────────────────────

/**
 * Fetch the current recruiter's verification status and submission details.
 * GET /api/recruiter/verification-status (fallback to /api/recruiter/verification)
 */
export const getRecruiterVerificationStatusApi = async () => {
  try {
    const response = await api.get("/recruiter/verification-status");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await api.get("/recruiter/verification");
      return fallback.data?.data ?? fallback.data;
    }
    throw err;
  }
};

/**
 * Submit or update recruiter/company verification details.
 * POST /api/recruiter/verification/submit (fallback to /api/recruiter/verification)
 * @param {Object} data - { designation, note, companyName, companyWebsite, workEmail, companyLocation, companyDescription, linkedinProfile }
 */
export const submitRecruiterVerificationApi = async (data) => {
  try {
    const response = await api.post("/recruiter/verification/submit", data);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await api.post("/recruiter/verification", data);
      return fallback.data?.data ?? fallback.data;
    }
    throw err;
  }
};

// ─── Admin Management Endpoints ───────────────────────────────────────────────

/**
 * Fetch paginated list of recruiters for admin review.
 * GET /api/admin/recruiters?status=...&page=0&size=20&sort=createdAt,desc
 * @param {Object} params - { status, page, size, search, sort }
 */
export const getAdminRecruitersApi = async ({
  status,
  page = 0,
  size = 20,
  search = "",
  sort = "createdAt,desc",
} = {}) => {
  const params = { page, size, sort };
  if (status && status !== "ALL") params.status = status;
  if (search && search.trim()) params.search = search.trim();

  const response = await api.get("/admin/recruiters", { params });
  return response.data?.data ?? response.data;
};

/**
 * Fetch detailed verification profile for a specific recruiter.
 * GET /api/admin/recruiters/{id}
 */
export const getAdminRecruiterDetailsApi = async (idOrPayload) => {
  const id = typeof idOrPayload === "object" ? idOrPayload?.recruiterId || idOrPayload?.id || idOrPayload?.userId : idOrPayload;
  const response = await api.get(`/admin/recruiters/${id}`);
  return response.data?.data ?? response.data;
};

/**
 * Approve a recruiter account and activate the recruiter profile and user account in DB.
 * PATCH /api/admin/recruiters/{id}/approve
 * @param {string|number|Object} idOrPayload
 * @param {string} [maybeReason]
 */
export const approveRecruiterApi = async (idOrPayload, maybeReason) => {
  const id = typeof idOrPayload === "object" ? idOrPayload?.recruiterId || idOrPayload?.id || idOrPayload?.userId : idOrPayload;
  const userId = typeof idOrPayload === "object" ? idOrPayload?.userId : undefined;
  const reason = typeof idOrPayload === "object" ? idOrPayload?.reason : maybeReason;

  const payload = {
    reason: reason || "Corporate email and business registration verified successfully.",
    status: "APPROVED",
    verificationStatus: "APPROVED",
    isActive: true,
    is_active: true,
    active: true,
  };

  try {
    const response = await api.patch(`/admin/recruiters/${id}/approve`, payload);

    // If userId is known, also synchronize the user account state
    if (userId && userId !== id) {
      try {
        await api.patch(`/admin/users/${userId}/status`, { status: "ACTIVE", isActive: true, is_active: true });
      } catch (e) {
        try {
          await api.patch(`/users/${userId}/status`, { status: "ACTIVE", isActive: true, is_active: true });
        } catch (e2) {}
      }
    }

    return response.data?.data ?? response.data;
  } catch (err) {
    // Attempt fallback status endpoint
    try {
      const fb = await api.patch(`/admin/recruiters/${id}/status`, {
        status: "APPROVED",
        verificationStatus: "APPROVED",
        isActive: true,
        is_active: true,
        reason,
      });
      return fb.data?.data ?? fb.data;
    } catch (e) {
      throw err;
    }
  }
};

/**
 * Reject a recruiter account with a required explanation reason.
 * PATCH /api/admin/recruiters/{id}/reject
 * @param {string|number|Object} idOrPayload
 * @param {string} [maybeReason]
 */
export const rejectRecruiterApi = async (idOrPayload, maybeReason) => {
  const id = typeof idOrPayload === "object" ? idOrPayload?.recruiterId || idOrPayload?.id || idOrPayload?.userId : idOrPayload;
  const reason = typeof idOrPayload === "object" ? idOrPayload?.reason : maybeReason;

  const payload = {
    reason: reason || "Verification not approved",
    status: "REJECTED",
    verificationStatus: "REJECTED",
    isActive: false,
    is_active: false,
  };

  const response = await api.patch(`/admin/recruiters/${id}/reject`, payload);
  return response.data?.data ?? response.data;
};

/**
 * Suspend a recruiter account with a required explanation reason.
 * PATCH /api/admin/recruiters/{id}/suspend
 * @param {string|number|Object} idOrPayload
 * @param {string} [maybeReason]
 */
export const suspendRecruiterApi = async (idOrPayload, maybeReason) => {
  const id = typeof idOrPayload === "object" ? idOrPayload?.recruiterId || idOrPayload?.id || idOrPayload?.userId : idOrPayload;
  const userId = typeof idOrPayload === "object" ? idOrPayload?.userId : undefined;
  const reason = typeof idOrPayload === "object" ? idOrPayload?.reason : maybeReason;

  const payload = {
    reason: reason || "Account suspended by platform administrator",
    status: "SUSPENDED",
    verificationStatus: "SUSPENDED",
    isActive: false,
    is_active: false,
  };

  const response = await api.patch(`/admin/recruiters/${id}/suspend`, payload);

  if (userId && userId !== id) {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: "SUSPENDED", isActive: false, is_active: false });
    } catch (e) {}
  }

  return response.data?.data ?? response.data;
};
