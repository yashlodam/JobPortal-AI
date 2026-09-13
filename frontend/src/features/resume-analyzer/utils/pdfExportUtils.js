/**
 * src/features/resume-analyzer/utils/pdfExportUtils.js
 * Utility helpers for printing and exporting PDF audit reports.
 */

export function triggerPrintReport() {
  window.print();
}

export function copyShareableLink(url = window.location.href) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    return true;
  }
  return false;
}
