import api from './api';

const maintenanceService = {
  getMachines: async () => {
    const response = await api.get('/maintenance/machines');
    return response.data;
  },

  createMachine: async (machineData) => {
    const response = await api.post('/maintenance/machines', machineData);
    return response.data;
  },

  reportBreakdown: async (formData) => {
    const response = await api.post('/maintenance/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getMaintenanceRequests: async (params = {}) => {
    const response = await api.get('/maintenance/requests', { params });
    return response.data;
  },

  assignTechnician: async (request_id, technician_id) => {
    const response = await api.put('/maintenance/assign-tech', { request_id, technician_id });
    return response.data;
  },

  updateRepairStatus: async (id, status) => {
    const response = await api.put(`/maintenance/status/${id}`, { status });
    return response.data;
  }
};

export default maintenanceService;
