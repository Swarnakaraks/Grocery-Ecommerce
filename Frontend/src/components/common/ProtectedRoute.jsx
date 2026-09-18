import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // auth check
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}

export function RequireRole({ roles = [], children }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  // role check
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!roles.includes(role)) return <Navigate to="/" replace />;

  return children;
}