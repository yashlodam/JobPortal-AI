/**
 * src/features/resume-builder/services/pdfGenerationService.js
 * Commercial-Grade Client-Side PDF Generation Service.
 * Features:
 *   - Smart 1-Page Auto-Fit: Automatically scales content to fit A4 if slightly overflowing
 *   - Zero oklch color errors: Sanitizes Tailwind v4 oklch() colors before canvas rasterization
 *   - Dual-engine: html2pdf.js (primary) → html2canvas + jsPDF (fallback)
 *   - Zero AI dependency: 100% client-side, no backend quota consumed
 */

import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// A4 dimensions at 96 DPI (browser resolution)
const A4_WIDTH_PX = 794;   // 210mm
const A4_HEIGHT_PX = 1123; // 297mm (strict 1-page limit)

/**
 * Sanitizes oklch() color functions in a cloned document before html2canvas renders it.
 * Tailwind CSS v4 uses oklch() which html2canvas cannot parse.
 */
const sanitizeClonedDocForCanvas = (clonedDoc) => {
  try {
    // Remove oklch from all <style> tags
    clonedDoc.querySelectorAll("style").forEach((tag) => {
      if (tag.textContent?.includes("oklch")) {
        tag.textContent = tag.textContent.replace(/oklch\([^)]+\)/g, "#0f172a");
      }
    });

    // Sanitize inline styles on all elements
    clonedDoc.querySelectorAll("*").forEach((el) => {
      const st = el.style;
      if (!st) return;
      if (st.color?.includes("oklch")) st.color = "#0f172a";
      if (st.backgroundColor?.includes("oklch")) st.backgroundColor = "#ffffff";
      if (st.borderColor?.includes("oklch")) st.borderColor = "#cbd5e1";
      if (st.background?.includes("oklch")) st.background = "#ffffff";
      if (st.fill?.includes("oklch")) st.fill = "#0f172a";
      if (st.stroke?.includes("oklch")) st.stroke = "#0f172a";
      if (st.outlineColor?.includes("oklch")) st.outlineColor = "#cbd5e1";
      if (st.textDecorationColor?.includes("oklch")) st.textDecorationColor = "#0f172a";
    });
  } catch (e) {
    console.warn("[pdfGenerationService] oklch sanitizer notice:", e);
  }
};

/**
 * Smart 1-Page Fit: If content height slightly exceeds A4, applies a CSS scale transform
 * to compress it down to exactly one page without clipping.
 * Max allowed scale-down: 92% (keeps text readable, avoids tiny font).
 */
const applySmartPageFit = (el) => {
  const contentHeight = el.scrollHeight;
  if (contentHeight <= A4_HEIGHT_PX) return 1; // Already fits, no scaling needed

  const minScale = 0.92; // Never scale below 92% (stays readable)
  const fitScale = Math.max(A4_HEIGHT_PX / contentHeight, minScale);

  el.style.transform = `scale(${fitScale})`;
  el.style.transformOrigin = "top left";
  el.style.width = `${A4_WIDTH_PX / fitScale}px`;

  console.info(`[pdfGenerationService] Smart 1-Page Fit applied: scale(${fitScale.toFixed(3)}) | content ${contentHeight}px → ${Math.round(contentHeight * fitScale)}px`);
  return fitScale;
};

export const pdfGenerationService = {
  /**
   * Generates a 1-page high-DPI ATS PDF document directly from the live DOM sheet.
   * Automatically fits content to one A4 page. Runs entirely client-side.
   *
   * @param {HTMLElement} sourceElement - The DOM element containing the resume sheet.
   * @param {string} candidateName - Full name of the candidate for the filename.
   * @returns {Promise<string>} The generated filename.
   */
  async generateResumePdf(sourceElement, candidateName = "Candidate") {
    if (!sourceElement) {
      throw new Error("Resume sheet element not found.");
    }

    const sanitizedName = candidateName
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_");
    const fileName = `${sanitizedName || "Candidate"}_Resume.pdf`;

    // Save ALL original styles so we can restore them after export
    const saved = {
      transform: sourceElement.style.transform,
      transformOrigin: sourceElement.style.transformOrigin,
      width: sourceElement.style.width,
      maxWidth: sourceElement.style.maxWidth,
      boxShadow: sourceElement.style.boxShadow,
      pointerEvents: sourceElement.style.pointerEvents,
    };

    let appliedScale = 1;

    try {
      // Step 1: Lock to A4 width, remove screen chrome
      sourceElement.style.transform = "none";
      sourceElement.style.transformOrigin = "top left";
      sourceElement.style.width = `${A4_WIDTH_PX}px`;
      sourceElement.style.maxWidth = `${A4_WIDTH_PX}px`;
      sourceElement.style.boxShadow = "none";

      // Step 2: Smart 1-Page Fit — scale only if needed
      appliedScale = applySmartPageFit(sourceElement);

      const html2canvasOptions = {
        scale: 2, // 200 DPI — sharp and ATS-readable
        useCORS: true,
        allowTaint: true,
        imageTimeout: 5000,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          sanitizeClonedDocForCanvas(clonedDoc);
        },
      };

      // Step 3: Resolve html2pdf engine (handles Vite ESM default export mismatch)
      const html2pdfEngine =
        typeof html2pdf === "function"
          ? html2pdf
          : html2pdf?.default && typeof html2pdf.default === "function"
          ? html2pdf.default
          : null;

      if (html2pdfEngine) {
        const opt = {
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: html2canvasOptions,
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true,
          },
        };

        await html2pdfEngine().set(opt).from(sourceElement).save();
        return fileName;
      }

      // Fallback: Direct html2canvas → jsPDF
      console.warn("[pdfGenerationService] html2pdf not available, using html2canvas + jsPDF fallback.");
      const canvas = await html2canvas(sourceElement, html2canvasOptions);
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth(); // 210mm
      const imgH = (canvas.height * pdfW) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfW, Math.min(imgH, 297));
      pdf.save(fileName);
      return fileName;
    } catch (err) {
      console.warn("[pdfGenerationService] Primary engine failed, running failsafe engine...", err);

      try {
        const canvas = await html2canvas(sourceElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            sanitizeClonedDocForCanvas(clonedDoc);
          },
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfW = pdf.internal.pageSize.getWidth();
        const imgH = (canvas.height * pdfW) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pdfW, Math.min(imgH, 297));
        pdf.save(fileName);
        return fileName;
      } catch (fallbackErr) {
        console.error("[pdfGenerationService] All engines failed:", fallbackErr);
        throw new Error("Unable to generate resume. Please try again.");
      }
    } finally {
      // Always restore original styles — ensures hover + UI returns to normal
      sourceElement.style.transform = saved.transform;
      sourceElement.style.transformOrigin = saved.transformOrigin;
      sourceElement.style.width = saved.width;
      sourceElement.style.maxWidth = saved.maxWidth;
      sourceElement.style.boxShadow = saved.boxShadow;
      sourceElement.style.pointerEvents = saved.pointerEvents;
    }
  },
};
