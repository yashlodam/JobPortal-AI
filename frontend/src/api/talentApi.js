import { api } from "../config/Api";

/**
 * REST API client for Candidate Directory & Talent Discovery (/api/talent).
 * Matches Spring Boot TalentController.java
 */

const normalizeExperienceLevel = (val) => {
  if (!val) return undefined;
  const upper = String(val).toUpperCase().trim();
  if (upper === "MID" || upper === "MID_LEVEL" || upper === "MID LEVEL") return "MID_LEVEL";
  if (upper === "ENTRY" || upper === "ENTRY_LEVEL" || upper === "ENTRY LEVEL") return "ENTRY_LEVEL";
  if (upper === "SENIOR" || upper === "SENIOR_LEVEL" || upper === "SENIOR LEVEL") return "SENIOR_LEVEL";
  if (upper === "LEAD" || upper === "LEAD_LEVEL" || upper === "LEAD ARCHITECT") return "LEAD";
  return upper;
};

const normalizeAvailability = (val) => {
  if (!val) return undefined;
  return String(val).toUpperCase().trim().replace(/\s+/g, "_");
};

/**
 * GET /api/talent/search
 * Prevents Spring Boot InvalidDataAccessResourceUsageException (CLOB lower() SQL error)
 * by retrieving clean candidate dataset and performing fast client-side keyword matching.
 */
export const searchTalent = async (params = {}) => {
  const cleanParams = { ...params };
  const keywordQuery = (cleanParams.keyword || "").trim().toLowerCase();

  // Omit keyword from backend query params to prevent Spring Boot JPA CLOB lower() Exception
  delete cleanParams.keyword;

  if (cleanParams.experienceLevel) {
    cleanParams.experienceLevel = normalizeExperienceLevel(cleanParams.experienceLevel);
  }
  if (cleanParams.availability) {
    cleanParams.availability = normalizeAvailability(cleanParams.availability);
  }

  try {
    const res = await api.get("/talent/search", { params: { ...cleanParams, size: 100 } });
    let responseData = res.data;

    // Perform instant client-side keyword filtering if keywordQuery was provided
    if (keywordQuery && responseData) {
      const rawContent = responseData?.data?.content || responseData?.data || (Array.isArray(responseData) ? responseData : []);
      if (Array.isArray(rawContent)) {
        const filteredContent = rawContent.filter((item) => {
          const name = item.name || item.fullName || item.user?.name || "";
          const headline = item.headline || item.professionalTitle || item.role || item.title || "";
          const company = item.currentCompany || item.company || "";
          const location = item.location || (item.city ? `${item.city}, ${item.country || ''}` : "");
          const skills = Array.isArray(item.skills) ? item.skills.join(" ") : "";
          const email = item.email || "";

          const fullText = `${name} ${headline} ${company} ${location} ${skills} ${email}`.toLowerCase();
          return fullText.includes(keywordQuery);
        });

        if (responseData?.data?.content) {
          responseData.data.content = filteredContent;
        } else if (Array.isArray(responseData.data)) {
          responseData.data = filteredContent;
        } else if (Array.isArray(responseData)) {
          responseData = filteredContent;
        }
      }
    }

    return responseData;
  } catch (error) {
    console.warn("GET /api/talent/search with params error, attempting clean fetch:", error?.message);
    try {
      const resAll = await api.get("/talent/search", { params: { size: 100 } });
      let responseData = resAll.data;
      if (keywordQuery && responseData) {
        const rawContent = responseData?.data?.content || responseData?.data || (Array.isArray(responseData) ? responseData : []);
        if (Array.isArray(rawContent)) {
          const filteredContent = rawContent.filter((item) => {
            const name = item.name || item.fullName || item.user?.name || "";
            const headline = item.headline || item.professionalTitle || item.role || item.title || "";
            const company = item.currentCompany || item.company || "";
            const location = item.location || (item.city ? `${item.city}, ${item.country || ''}` : "");
            const skills = Array.isArray(item.skills) ? item.skills.join(" ") : "";
            const email = item.email || "";

            const fullText = `${name} ${headline} ${company} ${location} ${skills} ${email}`.toLowerCase();
            return fullText.includes(keywordQuery);
          });

          if (responseData?.data?.content) {
            responseData.data.content = filteredContent;
          } else if (Array.isArray(responseData.data)) {
            responseData.data = filteredContent;
          } else if (Array.isArray(responseData)) {
            responseData = filteredContent;
          }
        }
      }
      return responseData;
    } catch (err) {
      console.error("All candidate search attempts failed:", err?.message);
      return { success: false, data: [] };
    }
  }
};

/**
 * GET /api/talent/{id}
 * Retrieve candidate profile by ID
 */
export const getTalentById = async (id) => {
  try {
    const res = await api.get(`/talent/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error in getTalentById (${id}):`, error);
    return { success: false, data: null };
  }
};

/**
 * GET /api/talent/me
 * Retrieve authenticated candidate's own profile
 */
export const getMyTalentProfile = async () => {
  try {
    const res = await api.get("/talent/me");
    return res.data;
  } catch (error) {
    console.error("Error in getMyTalentProfile:", error);
    return { success: false, data: null };
  }
};

/**
 * POST /api/talent/profile
 * Advanced talent profile search / listing with POST payload
 */
export const filterTalentProfiles = async (payload = {}, params = {}) => {
  try {
    const cleanParams = { ...params };
    if (cleanParams.experienceLevel) {
      cleanParams.experienceLevel = normalizeExperienceLevel(cleanParams.experienceLevel);
    }
    if (cleanParams.availability) {
      cleanParams.availability = normalizeAvailability(cleanParams.availability);
    }
    const res = await api.post("/talent/profile", payload, { params: cleanParams });
    return res.data;
  } catch (error) {
    console.error("Error in filterTalentProfiles:", error);
    return { success: false, data: [] };
  }
};
