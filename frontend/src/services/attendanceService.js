import api from './api';

const attendanceService = {
  checkIn: async () => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getAttendanceHistory: async () => {
    const response = await api.get('/attendance/history');
    return response.data;
  },

  getAllAttendanceRecords: async (params = {}) => {
    const response = await api.get('/attendance/records', { params });
    return response.data;
  },

  getMonthlyReport: async (params = {}) => {
    const response = await api.get('/attendance/monthly-report', { params });
    return response.data;
  }
};

export default attendanceService;
