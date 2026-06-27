import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  CalendarRange, 
  Wrench, 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X,
  Check
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isTechnician } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      if (user) {
        const res = await notificationService.getNotifications();
        if (res.success) {
          setNotifications(res.data);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, show: true },
    { name: 'Employees', path: '/employees', icon: Users, show: isAdmin },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, show: true },
    { name: 'Leaves', path: '/leaves', icon: FileSpreadsheet, show: true },
    { name: 'Shifts', path: '/shifts', icon: CalendarRange, show: true },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, show: true }
  ];

  const activeMenuItem = menuItems.find(item => item.path === location.pathname) || { name: 'Smart Steel Plant' };
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-slate-800">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-steel-500/10 text-steel-400">
            <Wrench className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-steel-300 to-white bg-clip-text text-transparent">
              Smart Steel
            </h1>
            <p className="text-xs text-slate-400">Operations Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (!item.show) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-steel-600 text-white shadow-lg shadow-steel-600/15'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-steel-800 border border-slate-700">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs truncate text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-steel-400 transition-colors"
              title="Switch Role"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
          <aside className="w-64 h-full bg-slate-900 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <span className="font-bold text-lg text-white">Smart Steel</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {menuItems.map((item) => {
                if (!item.show) return null;
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-steel-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-steel-800 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-steel-400" title="Switch Role">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="glass-navbar h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {activeMenuItem.name}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsProfileOpen(false);
                }}
                className={`p-2 rounded-full border transition-all ${
                  isNotifOpen 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-industrial-orange text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-steel-400 hover:text-steel-300 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-3 border-b border-slate-800/50 flex gap-3 transition-colors ${
                            !notif.is_read ? 'bg-steel-500/5' : 'hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-white">{notif.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          {!notif.is_read && (
                            <button 
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white h-fit mt-1"
                              title="Mark read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-800 text-center bg-slate-900/50">
                    <button 
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/notifications');
                      }}
                      className="text-xs text-steel-400 hover:text-steel-300 font-semibold"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-steel-800 border border-slate-700 flex items-center justify-center text-white font-semibold">
                  {user?.name ? user.name[0] : 'U'}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/30">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate(`/profile`);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-steel-400 hover:bg-slate-800 hover:text-steel-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Switch Role
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
