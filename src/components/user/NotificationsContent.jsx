'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, Info, AlertTriangle, Clock, X, Sparkles, CheckCheck, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const NotificationsContent = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/user/notifications');
        const json = await res.json();
        if (json.success && json.notifications) {
          setNotifications(json.notifications);
        }
      } catch (err) {
        console.error("Notifications fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch('/api/user/notifications', { method: 'PATCH' });
  };

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch(`/api/user/notifications?id=${id}`, { method: 'PATCH' });
  };

  const removeNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetch(`/api/user/notifications?id=${id}`, { method: 'DELETE' });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>;
      case 'alert': return <div className="p-2 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>;
      default: return <div className="p-2 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center shrink-0"><Info className="w-4 h-4 text-blue-600" /></div>;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    if (diffInMins > 0) return `${diffInMins}m ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8 pt-0 pb-4 sm:pb-6 mb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
              <div className="p-1 px-2 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {unreadCount > 0 ? `${unreadCount} unread` : '0 unread'}
              </div>
            </div>
            <p className="text-sm text-gray-500">Stay updated regarding your bookings and travel alerts.</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllAsRead}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <Separator className="mb-6" />

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => { if (!notif.read) markAsRead(notif.id); }}
              >
                <Card className={`relative group overflow-hidden border transition-all duration-200 cursor-pointer hover:shadow-md ${notif.read ? 'bg-white opacity-80' : 'bg-emerald-50/30'}`}>
                  {/* Unread Indicator Bar */}
                  {!notif.read && <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500"></div>}

                  <div className="flex sm:flex-row items-start gap-4 p-4 sm:p-5">
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1.5 gap-1 sm:gap-4">
                        <h3 className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs font-medium text-gray-400 flex items-center shrink-0">
                          <Clock className="w-3 h-3 mr-1" /> {formatTime(notif.date)}
                        </span>
                      </div>
                      <p className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-600'} leading-relaxed`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Hover Actions */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                      title="Remove notification"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-gray-300" />
                <Sparkles className="w-4 h-4 text-emerald-300 absolute top-2 right-2" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">You're all caught up!</h3>
              <p className="text-sm text-gray-400 max-w-sm">No new notifications. When you get updates about your bookings, they'll show up here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsContent;
