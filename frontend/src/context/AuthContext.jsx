import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const simulatedProfiles = {
  EMP001: { id: 1, employee_id: 'EMP001', name: 'System Admin', email: 'admin@steelplant.com', phone: '9876543210', department: 'Management', designation: 'System Administrator', joining_date: '2026-01-01', role: 'Admin', shift_id: 1, shift_name: 'Morning Shift', start_time: '06:00:00', end_time: '14:00:00' },
  EMP002: { id: 2, employee_id: 'EMP002', name: 'John Mechanic', email: 'john@steelplant.com', phone: '9876543211', department: 'Maintenance', designation: 'Technician', joining_date: '2026-01-01', role: 'Technician', shift_id: 1, shift_name: 'Morning Shift', start_time: '06:00:00', end_time: '14:00:00' },
  EMP003: { id: 3, employee_id: 'EMP003', name: 'Alice Operator', email: 'alice@steelplant.com', phone: '9876543212', department: 'Production', designation: 'Control Room Operator', joining_date: '2026-01-01', role: 'Employee', shift_id: 1, shift_name: 'Morning Shift', start_time: '06:00:00', end_time: '14:00:00' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth initialization error', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const selectRole = (employeeId) => {
    const profile = simulatedProfiles[employeeId];
    if (profile) {
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    selectRole,
    logout,
    updateProfileState,
    isAdmin: user?.role === 'Admin',
    isTechnician: user?.role === 'Technician',
    isEmployee: user?.role === 'Employee'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
