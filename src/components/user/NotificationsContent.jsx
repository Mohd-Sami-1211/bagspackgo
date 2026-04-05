'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, Info, AlertTriangle, Clock, MoreVertical, X, Sparkles, CheckCheck, ArrowLeft } from 'lucide-react';

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
    switch(type) {
       case 'success': return <div className="p-2.5 bg-emerald-100 rounded-full shadow-inner"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>;
       case 'alert': return <div className="p-2.5 bg-amber-100 rounded-full shadow-inner"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>;
       default: return <div className="p-2.5 bg-blue-100 rounded-full shadow-inner"><Info className="w-5 h-5 text-blue-600" /></div>;
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
         <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
         <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="p-2 sm:p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm active:scale-95 shrink-0">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
             <div>
                 <div className="flex items-center gap-3 mb-1">
                     <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Notifications</h1>
                     <div className="p-1.5 bg-emerald-500 rounded-lg shadow-md shadow-emerald-500/20 text-white relative">
                         <Bell className="w-4 h-4" />
                         {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span></span>}
                     </div>
                 </div>
                 <p className="text-gray-500 font-medium text-sm md:text-base">You have <strong className="text-emerald-600">{unreadCount} unread</strong> messages.</p>
             </div>
         </div>
         
         {unreadCount > 0 && (
           <button onClick={markAllAsRead} className="flex flex-shrink-0 items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-bold px-5 py-2.5 rounded-full transition-all text-sm w-full md:w-auto shadow-sm active:scale-95">
              <CheckCheck className="w-4 h-4" /> Mark all as read
           </button>
         )}
      </div>

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
                     className={`relative group overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${notif.read ? 'bg-white border-gray-100 hover:shadow-md' : 'bg-emerald-50/40 border-emerald-200 shadow-md hover:shadow-lg backdrop-blur-3xl'}`}
                  >
                     {/* Unread Indicator dot */}
                     {!notif.read && <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-12 bg-emerald-500 rounded-r-full"></div>}

                     <div className="flex gap-4 sm:gap-5 items-start pl-2">
                        <div className={`mt-0.5 transition-opacity duration-300 ${notif.read ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                           {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-8 md:pr-24">
                           <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1 gap-1">
                              <h3 className={`text-base font-black truncate tracking-tight ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                 {notif.title}
                              </h3>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center flex-shrink-0">
                                 <Clock className="w-3 h-3 mr-1" /> {formatTime(notif.date)}
                              </span>
                           </div>
                           <p className={`text-sm font-medium leading-relaxed ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notif.message}
                           </p>
                        </div>
                     </div>

                     {/* Action Buttons (Desktop Hover) */}
                     <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white to-transparent pl-8 md:pl-2">
                        {!notif.read && (
                           <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="p-2 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl shadow-sm text-gray-400 transition-all active:scale-95" title="Mark as read">
                              <CheckCircle className="w-4 h-4" />
                           </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }} className="p-2 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl shadow-sm text-gray-400 transition-all active:scale-95" title="Remove">
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  </motion.div>
               ))
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center px-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-5 relative">
                     <Sparkles className="w-8 h-8 text-emerald-300 absolute -top-1 -right-1" />
                     <Bell className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">You're all caught up!</h3>
                  <p className="text-gray-500 font-medium max-w-sm">No new notifications. When you get updates about your bookings, they'll show up here.</p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsContent;
