import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../State/Store";

/**
 * PublicRoute — guards auth routes (/login, /signup, /auth, /register).
 * If user is already authenticated, redirects them directly to the app:
 * - /admin/dashboard for admins
 * - /recruiter/dashboard for recruiters
 * - / for candidates
 */
export default function PublicRoute() {
  const user = useAppSelector((state) => state.auth.profile);

  if (user) {
    const isAdmin =
      user.accountType === "ADMIN" ||
      user.role === "ADMIN" ||
      (Array.isArray(user.roles) && user.roles.includes("ADMIN"));

    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    const isEmployer =
      user.accountType === "EMPLOYER" ||
      user.role === "EMPLOYER" ||
      user.accountType === "RECRUITER" ||
      user.role === "RECRUITER";

    return <Navigate to={isEmployer ? "/recruiter/dashboard" : "/"} replace />;
  }

  return <Outlet />;
}
