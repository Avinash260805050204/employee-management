import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';
import { User, Shield, Briefcase, Calendar, Phone, Mail, Clock, Key, AlertCircle } from 'lucide-react';

const EmployeeProfile = () => {
  const { user, updateProfileState } = useAuth();
  
  // States
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      if (user) {
        const res = await employeeService.getEmployee(user.employee_id);
        if (res.success) {
          setProfile(res.data);
          setPhone(res.data.phone || '');
          setEmail(res.data.email || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { email, phone };
      if (password) {
        payload.password = password;
      }
      
      const res = await employeeService.updateEmployee(user.employee_id, payload);
      if (res.success) {
        setMsg('Profile details updated successfully.');
        updateProfileState(res.data);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-t-2 border-b-2 rounded-full border-steel-400 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Messages */}
      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
          {msg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card - Metadata */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-steel-800 border border-slate-700/60 flex items-center justify-center text-white text-3xl font-extrabold shadow-inner shadow-black/20">
            {profile?.name ? profile.name[0] : 'U'}
          </div>
          <h2 className="text-xl font-bold text-white mt-4">{profile?.name}</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">{profile?.designation}</p>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-steel-500/10 border border-steel-500/20 text-steel-400 mt-4 capitalize">
            <Shield className="w-3.5 h-3.5" />
            {profile?.role}
          </span>

          <div className="w-full space-y-3 mt-6 pt-6 border-t border-slate-800/80 text-left text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Department</p>
                <p>{profile?.department || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Shift Schedule</p>
                <p className="text-steel-400 font-medium">{profile?.shift_name || 'No Shift Pattern'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Joining Date</p>
                <p>{profile?.joining_date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - Form Details */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-6">
            Edit Contact Credentials
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-steel-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-steel-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 my-6 pt-6">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-steel-400" />
                Change Password
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-steel-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-steel-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-steel-600 hover:bg-steel-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg hover:shadow-steel-500/10"
              >
                {submitting ? 'Updating...' : 'Update Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
