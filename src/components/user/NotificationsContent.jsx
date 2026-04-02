'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, Clock, MoreVertical, X } from 'lucide-react';

const NotificationsContent = () => {
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

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Optional: await fetch(`/api/user/notifications?id=${id}`, { method: 'PATCH' });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Optional: await fetch(`/api/user/notifications?id=${id}`, { method: 'DELETE' });
  };

  const getIcon = (type) => {
    switch(type) {
       case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
       case 'alert': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
       default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Format datestring into relative time (e.g., "2 hours ago")
  const formatTime = (dateString) => {
     const date = new Date(dateString);
     const now = new Date();
     const diffInMs = now.getTime() - date.getTime();
     const diffInMins = Math.floor(diffInMs / 60000);
     const diffInHours = Math.floor(diffInMins / 60);
     const diffInDays = Math.floor(diffInHours / 24);

     if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
     if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
     if (diffInMins > 0) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
     return 'Just now';
  };

  if (loading) {
     return (
       <div className="flex justify-center items-center h-[70vh]">
         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
       </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
         <div className="flex items-center gap-3">
             <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-600">
                 <Bell className="w-6 h-6" />
             </div>
             <div>
                 <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                 <p className="text-sm text-gray-500 mt-0.5">Stay updated with your bookings and alerts</p>
             </div>
         </div>
      </div>

      <div className="space-y-4">
         <AnimatePresence>
            {notifications.length > 0 ? (
               notifications.map((notif) => (
                  <motion.div
                     key={notif.id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                     className={`relative overflow-hidden group rounded-xl p-5 border ${notif.read ? 'bg-white border-gray-100' : 'bg-emerald-50/50 border-emerald-100/50'} shadow-sm transition-all hover:shadow-md`}
                  >
                     <div className="flex gap-4">
                        <div className={`flex-shrink-0 mt-1 ${notif.read ? 'opacity-60' : 'opacity-100'}`}>
                           {getIcon(notif.type)}
                        </div>
                        <div className="flex-grow">
                           <div className="flex justify-between items-start mb-1">
                              <h3 className={`text-base font-semibold ${notif.read ? 'text-gray-800' : 'text-gray-900'}`}>
                                 {notif.title}
                              </h3>
                              <span className="text-xs font-medium text-gray-400 flex items-center whitespace-nowrap ml-4">
                                 <Clock className="w-3 h-3 mr-1" /> {formatTime(notif.date)}
                              </span>
                           </div>
                           <p className={`text-sm leading-relaxed pr-8 ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notif.message}
                           </p>
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                           <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="p-1.5 bg-white border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 rounded shadow-sm text-gray-400 transition-colors" title="Mark as read">
                              <CheckCircle className="w-4 h-4" />
                           </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }} className="p-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 rounded shadow-sm text-gray-400 transition-colors" title="Delete">
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  </motion.div>
               ))
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
                  <p className="text-gray-500">You don't have any new notifications.</p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsContent;
