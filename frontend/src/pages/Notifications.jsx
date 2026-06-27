import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { Bell, Check, Trash2, MailOpen, AlertTriangle } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-t-2 border-b-2 rounded-full border-steel-400 animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-steel-400" />
          Inbox Notifications
          {unreadCount > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-industrial-orange text-white font-bold">
              {unreadCount} New
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-steel-400 hover:text-steel-300 flex items-center gap-1 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg transition-all"
          >
            <MailOpen className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm border border-slate-850 rounded-2xl bg-slate-900/10">
            No notifications in your inbox. Check back later!
          </div>
        ) : (
          notifications.map(notif => {
            const notifColor = {
              Leave: 'border-l-4 border-l-purple-500 bg-purple-500/5',
              Shift: 'border-l-4 border-l-sky-500 bg-sky-500/5',
              Maintenance: 'border-l-4 border-l-rose-500 bg-rose-500/5'
            }[notif.type] || 'border-l-4 border-l-slate-500 bg-slate-500/5';

            return (
              <div 
                key={notif.id}
                className={`p-4 rounded-xl border border-slate-850/80 flex items-start justify-between gap-4 transition-colors ${notifColor} ${
                  !notif.is_read ? 'shadow shadow-steel-500/5' : 'opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{notif.title}</h3>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 border border-slate-850 px-1.5 py-0.25 rounded">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                    {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
