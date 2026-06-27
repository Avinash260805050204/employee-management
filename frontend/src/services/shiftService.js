import api from './api';

const shiftService = {
  getShifts: async () => {
    const response = await api.get('/shifts');
    return response.data;
  },

  createShift: async (shiftData) => {
    const response = await api.post('/shifts', shiftData);
    return response.data;
  },

  assignShift: async (employee_id, shift_id) => {
    const response = await api.put('/shifts/assign', { employee_id, shift_id });
    return response.data;
  }
};

export default shiftService;
