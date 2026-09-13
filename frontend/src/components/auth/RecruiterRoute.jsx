/**
 * src/components/auth/RecruiterRoute.jsx
 *
 * Route guard that ensures ONLY EMPLOYER/RECRUITER account types
 * can access /recruiter/* routes.
 *
 * If an APPLICANT or ADMIN navigates to a recruiter route they are
 * redirected to the appropriate home page instead.
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../State/Store";

export default function RecruiterRoute() {
  const user = useAppSelector((state) => state.auth.profile);
  const location = useLocation();

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const accountType = (user.accountType || user.role || "").toUpperCase();

  const isAdmin = accountType === "ADMIN";
  const isRecruiter = accountType === "EMPLOYER" || accountType === "RECRUITER";

  // Admins go to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Applicants (and any other non-recruiter role) go to home
  if (!isRecruiter) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
