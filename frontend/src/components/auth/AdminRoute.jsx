/**
 * src/components/auth/AdminRoute.jsx
 *
 * Route guard that ensures only ADMIN users can access /admin/* routes.
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../State/Store";

export default function AdminRoute() {
  const user = useAppSelector((state) => state.auth.profile);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin =
    user.role === "ADMIN" ||
    user.accountType === "ADMIN" ||
    (user.roles && user.roles.includes("ADMIN"));

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
