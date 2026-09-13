import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../State/Store";

/**
 * ProtectedRoute — guards all application routes.
 * If user is not authenticated, redirects them to /login
 * while preserving the attempted URL in navigation state.
 */
export default function ProtectedRoute() {
  const user = useAppSelector((state) => state.auth.profile);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
