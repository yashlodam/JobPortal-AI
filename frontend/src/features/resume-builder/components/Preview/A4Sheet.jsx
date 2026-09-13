/**
 * src/features/resume-builder/components/Preview/A4Sheet.jsx
 * Dynamic A4 Sheet selector rendering any of the 6 enterprise ATS template layouts with page break rules.
 */

import React from "react";
import ProfessionalTemplate from "../Templates/ProfessionalTemplate";
import ModernTemplate from "../Templates/ModernTemplate";
import MinimalTemplate from "../Templates/MinimalTemplate";
import SoftwareEngineerTemplate from "../Templates/SoftwareEngineerTemplate";
import CorporateTemplate from "../Templates/CorporateTemplate";
import CreativeTemplate from "../Templates/CreativeTemplate";
import FresherTemplate from "../Templates/FresherTemplate";
import { BLANK_RESUME_SCHEMA } from "../../constants/resumeTemplates";

export default function A4Sheet({ resume }) {
  const safeResume = resume || BLANK_RESUME_SCHEMA;
  const templateId = (safeResume.templateId || "professional").toLowerCase();

  const renderTemplate = () => {
    switch (templateId) {
      case "modern":
        return <ModernTemplate resume={safeResume} />;
      case "minimal":
        return <MinimalTemplate resume={safeResume} />;
      case "software_engineer":
        return <SoftwareEngineerTemplate resume={safeResume} />;
      case "corporate":
        return <CorporateTemplate resume={safeResume} />;
      case "creative":
        return <CreativeTemplate resume={safeResume} />;
      case "fresher":
        return <FresherTemplate resume={safeResume} />;
      case "professional":
      default:
        return <ProfessionalTemplate resume={safeResume} />;
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume-sheet, #printable-resume-sheet * {
            visibility: visible;
          }
          #printable-resume-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            transform: none !important;
          }
          .break-inside-avoid-page {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
      {renderTemplate()}
    </>
  );
}
