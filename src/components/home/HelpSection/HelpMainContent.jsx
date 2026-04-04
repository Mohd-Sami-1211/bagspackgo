'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Clock, CheckCircle, MessageSquare, Send, AlertCircle, ChevronRight, UserCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HelpMainContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('callback'); // 'callback', 'email', 'history'
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form states
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user]);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoadingQueries(true);
      const res = await fetch('/api/user/support');
      const json = await res.json();
      if (json.success) setQueries(json.queries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQueries(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = activeTab === 'callback' 
        ? { type: 'callback', phone, subject: 'Callback Request', message: 'User requested a call back.' }
        : { type: 'message', subject, message };

      const res = await fetch('/api/user/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setActiveTab('history');
          fetchQueries();
          setSubject('');
          setMessage('');
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'resolved': return <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolved</span>;
      case 'in-progress': return <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span>;
      default: return <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 relative z-10">
      <div className="flex items-center gap-4 mb-8 md:mb-10 -mt-20">
          <button onClick={() => router.back()} className="p-2 sm:p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm active:scale-95 shrink-0">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">How can we help?</h1>
            <p className="text-gray-500 font-medium text-sm md:text-base mt-1">Need assistance? Choose how you want to reach out to us.</p>
          </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-2 relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
           
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Support Options</h3>
           
           <button 
             onClick={() => setActiveTab('callback')}
             className={`flex justify-between items-center px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold ${activeTab === 'callback' ? 'bg-white shadow-md text-emerald-600 ring-1 ring-emerald-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
           >
             <span className="flex items-center gap-3"><Phone className={`w-5 h-5 ${activeTab === 'callback' ? 'text-emerald-500' : 'text-gray-400'}`} /> Callback</span>
             {activeTab === 'callback' && <ChevronRight className="w-4 h-4 opacity-50" />}
           </button>
           
           <button 
             onClick={() => setActiveTab('email')}
             className={`flex justify-between items-center px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold ${activeTab === 'email' ? 'bg-white shadow-md text-emerald-600 ring-1 ring-emerald-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
           >
             <span className="flex items-center gap-3"><Mail className={`w-5 h-5 ${activeTab === 'email' ? 'text-emerald-500' : 'text-gray-400'}`} /> Email Us</span>
             {activeTab === 'email' && <ChevronRight className="w-4 h-4 opacity-50" />}
           </button>

           <div className="my-2 border-t border-gray-200"></div>

           <button 
             onClick={() => setActiveTab('history')}
             className={`flex justify-between items-center px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold ${activeTab === 'history' ? 'bg-white shadow-md text-blue-600 ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
           >
             <span className="flex items-center gap-3"><MessageSquare className={`w-5 h-5 ${activeTab === 'history' ? 'text-blue-500' : 'text-gray-400'}`} /> Past Queries</span>
             {activeTab === 'history' && <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black">{queries.length}</span>}
           </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 md:p-10 min-h-[400px]">
           <AnimatePresence mode="wait">
             
             {/* CALLBACK FORM */}
             {activeTab === 'callback' && (
               <motion.div key="callback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-md mx-auto">
                 <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-sm border border-emerald-200">
                    <Phone className="w-6 h-6 text-emerald-600" />
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Arrange a Callback</h2>
                 <p className="text-gray-500 font-medium mb-8 text-sm">Enter your phone number and our support team will call you back within 2-4 business hours.</p>
                 
                 <form onSubmit={handleSubmit} className="space-y-5">
                   <div>
                     <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Your Phone Number</label>
                     <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold px-2 border-r border-gray-200">+91</span>
                       <input 
                         type="tel" required 
                         value={phone} onChange={(e) => setPhone(e.target.value)}
                         className="w-full pl-20 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold"
                         placeholder="9876543210"
                       />
                     </div>
                   </div>
                   
                   <button disabled={loading || success} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_10px_20px_rgba(5,150,105,0.2)] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                     {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : success ? <><CheckCircle className="w-5 h-5" /> Requested Successfully</> : 'Request Callback'}
                   </button>
                 </form>
               </motion.div>
             )}

             {/* EMAIL FORM */}
             {activeTab === 'email' && (
               <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-none">
                 <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-sm border border-emerald-200">
                    <Mail className="w-6 h-6 text-emerald-600" />
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Send us a Message</h2>
                 <p className="text-gray-500 font-medium mb-8 text-sm">Write to us right here, or email directly at <a href="mailto:bagspackgo01@gmail.com" className="text-emerald-600 font-bold hover:underline">bagspackgo01@gmail.com</a>.</p>
                 
                 <form onSubmit={handleSubmit} className="space-y-5">
                   <div>
                     <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Subject</label>
                     <input 
                       type="text" required 
                       value={subject} onChange={(e) => setSubject(e.target.value)}
                       className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                       placeholder="e.g. Booking Cancellation"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Your Message</label>
                     <textarea 
                       required rows="5"
                       value={message} onChange={(e) => setMessage(e.target.value)}
                       className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium resize-none shadow-inner"
                       placeholder="Please describe your issue in detail..."
                     ></textarea>
                   </div>
                   
                   <div className="flex justify-end pt-2">
                     <button disabled={loading || success} type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-[0_10px_20px_rgba(5,150,105,0.2)] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 min-w-[200px]">
                       {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : success ? <><CheckCircle className="w-5 h-5" /> Sent</> : <><Send className="w-4 h-4" /> Send Message</>}
                     </button>
                   </div>
                 </form>
               </motion.div>
             )}

             {/* HISTORY AREA */}
             {activeTab === 'history' && (
               <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                   <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">Your Support Queries</h2>
                     <p className="text-gray-500 font-medium text-sm mt-1">Track the status of your past requests</p>
                   </div>
                   <div className="w-12 h-12 bg-blue-100 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-blue-200">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                   </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                   {loadingQueries ? (
                     <div className="flex justify-center items-center py-20">
                       <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
                     </div>
                   ) : queries.length > 0 ? (
                     queries.map((q) => (
                       <div key={q._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                             <div>
                               <div className="flex gap-2 items-center mb-1">
                                 <span className="text-[10px] font-black uppercase text-gray-400 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
                                   {q.type === 'callback' ? 'Callback' : 'Email'}
                                 </span>
                                 <span className="text-[10px] font-bold text-gray-400">
                                   {new Date(q.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'})}
                                 </span>
                               </div>
                               <h4 className="font-bold text-gray-900">{q.subject || 'Support Query'}</h4>
                             </div>
                             {getStatusBadge(q.status)}
                          </div>
                          
                          <p className="text-sm text-gray-600 font-medium mb-4 bg-white p-3 rounded-xl border border-gray-100">
                            {q.message}
                          </p>

                          {q.adminReply && (
                            <div className="flex gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                               <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full h-fit flex-shrink-0">
                                 <UserCircle2 className="w-4 h-4 text-blue-600" />
                               </div>
                               <div>
                                 <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Support Team</p>
                                 <p className="text-sm text-gray-700">{q.adminReply}</p>
                               </div>
                            </div>
                          )}
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-3xl">
                        <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-gray-900 mb-1">No Support Queries</h4>
                        <p className="text-sm text-gray-500 font-medium">You haven't made any requests yet. Everything looks good!</p>
                     </div>
                   )}
                 </div>
               </motion.div>
             )}

           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
