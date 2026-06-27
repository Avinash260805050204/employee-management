import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full border-steel-400 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to role selection if not authenticated
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to main dashboard if they don't have authorization
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
