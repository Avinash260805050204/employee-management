import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import maintenanceService from '../services/maintenanceService';
import employeeService from '../services/employeeService';
import CustomTable from '../components/CustomTable';
import Modal from '../components/Modal';
import { Wrench, CheckCircle2, AlertTriangle, AlertOctagon, Plus, UserPlus, Image as ImageIcon, Camera } from 'lucide-react';

const Maintenance = () => {
  const { user, isAdmin, isTechnician } = useAuth();

  // Active tab: 'requests' or 'machines'
  const [activeTab, setActiveTab] = useState('requests');

  // Core datasets
  const [requests, setRequests] = useState([]);
  const [machines, setMachines] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);

  // Focus request for assignment or update
  const [activeRequest, setActiveRequest] = useState(null);

  // Form states
  const [reportFormData, setReportFormData] = useState({
    machine_id: '',
    issue_title: '',
    description: '',
    priority: 'Medium'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const [machineFormData, setMachineFormData] = useState({
    machine_id: '',
    name: '',
    location: '',
    status: 'Operational'
  });

  const [selectedTechId, setSelectedTechId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reqRes = await maintenanceService.getMaintenanceRequests();
      if (reqRes.success) {
        setRequests(reqRes.data);
      }

      const macRes = await maintenanceService.getMachines();
      if (macRes.success) {
        setMachines(macRes.data);
      }

      if (isAdmin) {
        const empRes = await employeeService.getEmployees();
        if (empRes.success) {
          // Filter down to technicians
          setTechnicians(empRes.data.filter(emp => emp.role === 'Technician'));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin, user]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('machine_id', reportFormData.machine_id);
    formData.append('issue_title', reportFormData.issue_title);
    formData.append('description', reportFormData.description);
    formData.append('priority', reportFormData.priority);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await maintenanceService.reportBreakdown(formData);
      if (res.success) {
        alert('Breakdown reported successfully.');
        setReportFormData({ machine_id: '', issue_title: '', description: '', priority: 'Medium' });
        setSelectedFile(null);
        setIsReportModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTech = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await maintenanceService.assignTechnician(activeRequest.id, selectedTechId);
      if (res.success) {
        alert('Technician assigned successfully');
        setIsTechModalOpen(false);
        setSelectedTechId('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    if (!window.confirm(`Update maintenance status to ${status}?`)) return;
    try {
      const res = await maintenanceService.updateRepairStatus(requestId, status);
      if (res.success) {
        alert(`Status updated to ${status}`);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleCreateMachine = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await maintenanceService.createMachine(machineFormData);
      if (res.success) {
        alert('Machine registered successfully');
        setMachineFormData({ machine_id: '', name: '', location: '', status: 'Operational' });
        setIsMachineModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Machine registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper render badges
  const renderPriority = (priority) => {
    const color = {
      Low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      Medium: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      High: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    }[priority];

    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
        {priority}
      </span>
    );
  };

  const renderStatus = (status) => {
    const color = {
      Open: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      'In Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      Closed: 'text-slate-500 bg-slate-800 border-slate-700/65'
    }[status];

    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
        {status}
      </span>
    );
  };

  const renderMachineStatus = (status) => {
    const config = {
      Operational: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
      'Under Maintenance': { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
      Broken: { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: AlertOctagon }
    }[status];

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  // Columns for maintenance requests
  const requestColumns = [
    { 
      header: 'Machine', 
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.machine_name}</p>
          <p className="text-xs text-slate-400">{row.machine_id} - {row.location}</p>
        </div>
      )
    },
    { 
      header: 'Issue Details', 
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-white truncate">{row.issue_title}</p>
          <p className="text-xs text-slate-400 truncate">{row.description}</p>
        </div>
      )
    },
    { 
      header: 'Attachment', 
      render: (row) => row.image_url ? (
        <a 
          href={row.image_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-steel-400 hover:text-steel-300 font-medium flex items-center gap-1"
        >
          <Camera className="w-4 h-4" />
          View Image
        </a>
      ) : (
        <span className="text-xs text-slate-500">No Image</span>
      )
    },
    { header: 'Priority', render: (row) => renderPriority(row.priority) },
    { header: 'Status', render: (row) => renderStatus(row.status) },
    { header: 'Assigned Technician', render: (row) => row.technician_name || 'Unassigned' },
    { 
      header: 'Actions', 
      render: (row) => {
        const isAssignedTech = row.assigned_technician_id === user?.employee_id;
        return (
          <div className="flex gap-2">
            {/* Admin assignment button */}
            {isAdmin && row.status === 'Open' && (
              <button
                onClick={() => {
                  setFormError('');
                  setActiveRequest(row);
                  setIsTechModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-steel-600 hover:bg-steel-500 text-white text-xs font-semibold rounded-lg"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Assign Tech
              </button>
            )}

            {/* Technician Status update options */}
            {(isAssignedTech || isAdmin) && row.status === 'In Progress' && (
              <button
                onClick={() => handleUpdateStatus(row.id, 'Resolved')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
              >
                Mark Resolved
              </button>
            )}

            {(isAssignedTech || isAdmin) && row.status === 'Resolved' && (
              <button
                onClick={() => handleUpdateStatus(row.id, 'Closed')}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg"
              >
                Close File
              </button>
            )}
            
            {row.status === 'Closed' && <span className="text-xs text-slate-500">No Actions</span>}
          </div>
        );
      }
    }
  ];

  // Columns for machines
  const machineColumns = [
    { header: 'ID', accessor: 'machine_id' },
    { header: 'Machine Name', accessor: 'name' },
    { header: 'Location', accessor: 'location' },
    { header: 'Status', render: (row) => renderMachineStatus(row.status) }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'requests' ? 'border-steel-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Maintenance Requests
        </button>
        <button
          onClick={() => setActiveTab('machines')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'machines' ? 'border-steel-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚙️
          Machinery Registry
        </button>
      </div>

      {/* Action Header */}
      <div className="flex justify-end gap-3">
        {isAdmin && activeTab === 'machines' && (
          <button
            onClick={() => {
              setFormError('');
              setIsMachineModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-steel-500 text-slate-300 hover:text-white text-xs font-semibold rounded-lg px-3 py-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Register Machine
          </button>
        )}

        <button
          onClick={() => {
            setFormError('');
            setIsReportModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-steel-600 hover:bg-steel-500 text-white text-xs font-semibold rounded-lg px-4 py-2 shadow transition-colors"
        >
          <Camera className="w-4 h-4" />
          Report Breakdown
        </button>
      </div>

      {/* Main Tables */}
      {activeTab === 'requests' ? (
        <CustomTable 
          columns={requestColumns} 
          data={requests} 
          loading={loading}
          emptyMessage="No machine breakdowns currently reported."
        />
      ) : (
        <CustomTable 
          columns={machineColumns} 
          data={machines} 
          loading={loading}
          emptyMessage="No machinery configured in registry."
        />
      )}

      {/* Report Breakdown Modal */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        title="Report Machine Breakdown"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4" encType="multipart/form-data">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Broken Machine
            </label>
            <select
              value={reportFormData.machine_id}
              onChange={e => setReportFormData({ ...reportFormData, machine_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            >
              <option value="">Select Machine</option>
              {machines.map(m => (
                <option key={m.machine_id} value={m.machine_id}>
                  {m.name} ({m.machine_id}) - {m.location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Issue Title
              </label>
              <input
                type="text"
                value={reportFormData.issue_title}
                onChange={e => setReportFormData({ ...reportFormData, issue_title: e.target.value })}
                placeholder="e.g. Hydraulic leak in valve"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={reportFormData.priority}
                onChange={e => setReportFormData({ ...reportFormData, priority: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Breakdown Details / Description
            </label>
            <textarea
              value={reportFormData.description}
              onChange={e => setReportFormData({ ...reportFormData, description: e.target.value })}
              rows={3}
              placeholder="Describe machine behavior, fault codes, or breakdown reasons..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Upload Breakdown Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-850 hover:border-steel-500 rounded-lg text-slate-300 hover:text-white cursor-pointer text-xs font-semibold transition-colors">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                Choose File
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/*"
                  className="hidden" 
                />
              </label>
              <span className="text-xs text-slate-500 truncate">
                {selectedFile ? selectedFile.name : 'No photo uploaded'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Reporting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Tech Modal */}
      <Modal 
        isOpen={isTechModalOpen} 
        onClose={() => setIsTechModalOpen(false)}
        title="Assign Technician"
      >
        <form onSubmit={handleAssignTech} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Choose Technician
            </label>
            <select
              value={selectedTechId}
              onChange={e => setSelectedTechId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
              required
            >
              <option value="">Select Technician</option>
              {technicians.map(t => (
                <option key={t.employee_id} value={t.employee_id}>
                  {t.name} ({t.employee_id}) - {t.department}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setIsTechModalOpen(false)}
              className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Assigning...' : 'Assign Tech'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Register Machine Modal */}
      <Modal 
        isOpen={isMachineModalOpen} 
        onClose={() => setIsMachineModalOpen(false)}
        title="Register Steel Plant Machine"
      >
        <form onSubmit={handleCreateMachine} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Machine ID / Tag
              </label>
              <input
                type="text"
                value={machineFormData.machine_id}
                onChange={e => setMachineFormData({ ...machineFormData, machine_id: e.target.value })}
                placeholder="e.g. FURNACE-05"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Machine Name
              </label>
              <input
                type="text"
                value={machineFormData.name}
                onChange={e => setMachineFormData({ ...machineFormData, name: e.target.value })}
                placeholder="e.g. Blast Furnace #5"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Shop Location
              </label>
              <input
                type="text"
                value={machineFormData.location}
                onChange={e => setMachineFormData({ ...machineFormData, location: e.target.value })}
                placeholder="e.g. Shop Floor B"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={machineFormData.status}
                onChange={e => setMachineFormData({ ...machineFormData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-sm focus:outline-none focus:border-steel-500"
                required
              >
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Broken">Broken</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setIsMachineModalOpen(false)}
              className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Registering...' : 'Register Machine'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
