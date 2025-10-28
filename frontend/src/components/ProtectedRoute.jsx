/**
 * Protected Route Component
 * 
 * Wrapper for routes that require authentication.
 * Redirects to login page if user is not authenticated.
 * Shows loading spinner while checking authentication status.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * @param {ReactNode} children - Component to render if user is authenticated
 * @returns {ReactNode} Children if authenticated, loading spinner, or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - render protected content
  return children;
};

export default ProtectedRoute;
