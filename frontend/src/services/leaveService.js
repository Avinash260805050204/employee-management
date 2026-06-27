import api from './api';

const leaveService = {
  applyLeave: async (leaveData) => {
    const response = await api.post('/leaves/apply', leaveData);
    return response.data;
  },

  getLeaveHistory: async () => {
    const response = await api.get('/leaves/history');
    return response.data;
  },

  getPendingLeaves: async () => {
    const response = await api.get('/leaves/pending');
    return response.data;
  },

  getAllLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  updateLeaveStatus: async (id, status) => {
    const response = await api.put(`/leaves/${id}/status`, { status });
    return response.data;
  }
};

export default leaveService;
