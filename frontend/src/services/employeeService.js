import api from './api';

const employeeService = {
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getEmployee: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (employeeId, employeeData) => {
    const response = await api.put(`/employees/${employeeId}`, employeeData);
    // Update local storage user profile if updating self
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser.employee_id === employeeId && response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  deleteEmployee: async (employeeId) => {
    const response = await api.delete(`/employees/${employeeId}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/employees/dashboard/stats');
    return response.data;
  }
};

export default employeeService;
