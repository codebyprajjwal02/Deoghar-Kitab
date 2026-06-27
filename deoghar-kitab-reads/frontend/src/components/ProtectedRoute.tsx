import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("buyer" | "user" | "seller" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // If authentication state is still loading from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to the landing auth page
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Normalize role: backend may return 'user' historically — treat 'user' as 'buyer'
  const normalizedRole = user.userType === 'user' ? 'buyer' : user.userType;

  // If roles are specified, check if user's role is allowed
  if (allowedRoles && !allowedRoles.some((r) => r === normalizedRole || (r === 'user' && normalizedRole === 'buyer'))) {
    // Redirect to home if they don't have privileges
    return <Navigate to="/home" replace />;
  }

  // If authenticated and authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute;
