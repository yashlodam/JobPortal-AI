/**
 * src/utils/assetUtils.js
 * Central resolver for static uploads (resumes, company logos, avatars, banners).
 * Dynamically uses VITE_API_URL or defaults to http://localhost:8080.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
export const BACKEND_BASE_URL = RAW_API_URL.replace(/\/api\/?$/, "");

/**
 * Resolves a relative or absolute asset path to a valid URL.
 * @param {string} path - e.g. "/uploads/avatar/user.png" or "uploads/avatar/user.png" or full http url
 * @returns {string} - fully qualified asset URL
 */
export function getAssetUrl(path) {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
}

/**
 * Robustly resolves any image or document path/filename into a loadable full URL.
 * Handles blobs, data URLs, http(s) URLs, uploads/ prefixes, and bare filenames.
 *
 * @param {string|null} path - Raw path, URL, or filename
 * @param {string} [subfolder="uploads"] - Default subfolder when path is a bare filename
 * @param {string|null} [fallback=null] - Value to return when path is missing or invalid
 * @returns {string|null}
 */
export function resolveImageUrl(path, subfolder = "uploads", fallback = null) {
  if (!path || typeof path !== "string") return fallback;
  const trimmed = path.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return fallback;

  if (
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  // Strip all leading slashes
  const clean = trimmed.replace(/^\/+/, "");

  // If path already starts with uploads/, resolve directly
  if (clean.startsWith("uploads/")) {
    return getAssetUrl(clean);
  }

  // If path starts with common upload subdirectories, prepend uploads/
  const knownSubdirs = ["profile/", "banner/", "resume/", "logo/", "company/", "avatars/", "certificates/"];
  if (knownSubdirs.some((prefix) => clean.startsWith(prefix))) {
    return getAssetUrl(`uploads/${clean}`);
  }

  // Handle custom subfolders (e.g. "uploads/certificates")
  const cleanSub = (subfolder || "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (cleanSub) {
    if (cleanSub.startsWith("uploads")) {
      return getAssetUrl(`${cleanSub}/${clean}`);
    }
    return getAssetUrl(`uploads/${cleanSub}/${clean}`);
  }

  return getAssetUrl(`uploads/${clean}`);
}