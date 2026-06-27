import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import RoleSelection from './pages/RoleSelection';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Shifts from './pages/Shifts';
import Maintenance from './pages/Maintenance';
import EmployeeProfile from './pages/EmployeeProfile';
import Notifications from './pages/Notifications';

const RootElement = () => {
  const { user } = useAuth();
  if (!user) {
    return <RoleSelection />;
  }
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Root Route: Shows role selection or dashboard */}
          <Route path="/" element={<RootElement />} />
          
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Layout><EmployeeProfile /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/notifications" 
            element={
              <PrivateRoute>
                <Layout><Notifications /></Layout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/employees" 
            element={
              <PrivateRoute allowedRoles={['Admin']}>
                <Layout><Employees /></Layout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/attendance" 
            element={
              <PrivateRoute>
                <Layout><Attendance /></Layout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/leaves" 
            element={
              <PrivateRoute>
                <Layout><Leaves /></Layout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/shifts" 
            element={
              <PrivateRoute>
                <Layout><Shifts /></Layout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/maintenance" 
            element={
              <PrivateRoute>
                <Layout><Maintenance /></Layout>
              </PrivateRoute>
            } 
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
