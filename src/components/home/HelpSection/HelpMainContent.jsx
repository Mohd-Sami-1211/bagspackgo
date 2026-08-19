'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Clock, CheckCircle, MessageSquare, Send, AlertCircle, UserCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function HelpMainContent() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState('callback'); // 'callback', 'email', 'history'
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form states
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

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
    if (!user) {
        openAuthModal({ closable: true, tab: 'user' });
        return;
    }
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
          setPhone('');
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
      case 'resolved': return <Badge variant="success" className="text-[10px] gap-1"><CheckCircle className="w-3 h-3" /> Resolved</Badge>;
      case 'in-progress': return <Badge variant="warning" className="text-[10px] gap-1"><Clock className="w-3 h-3" /> In Progress</Badge>;
      default: return <Badge variant="outline" className="text-[10px] gap-1"><AlertCircle className="w-3 h-3" /> Pending</Badge>;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-12 pt-0 pb-4 sm:pb-6 mb-16 font-sans">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">How can we help?</h1>
          <p className="text-sm text-gray-500 mt-0.5">Need assistance? Choose how you want to reach out to us.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar Menu */}
        <div className="flex flex-col gap-1 md:col-span-1">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Support Options</p>
           
           <Button 
             variant={activeTab === 'callback' ? 'secondary' : 'ghost'}
             className="justify-start gap-3 h-11 border border-transparent font-semibold"
             onClick={() => setActiveTab('callback')}
           >
             <Phone className={`w-4 h-4 ${activeTab === 'callback' ? 'text-emerald-600' : 'text-gray-500'}`} />
             Callback
           </Button>
           
           <Button 
             variant={activeTab === 'email' ? 'secondary' : 'ghost'}
             className="justify-start gap-3 h-11 border border-transparent font-semibold"
             onClick={() => setActiveTab('email')}
           >
             <Mail className={`w-4 h-4 ${activeTab === 'email' ? 'text-emerald-600' : 'text-gray-500'}`} />
             Email Us
           </Button>

           <Separator className="my-2" />

           <Button 
             variant={activeTab === 'history' ? 'secondary' : 'ghost'}
             className="justify-between gap-3 h-11 border border-transparent font-semibold"
             onClick={() => setActiveTab('history')}
           >
             <div className="flex items-center gap-3">
               <MessageSquare className={`w-4 h-4 ${activeTab === 'history' ? 'text-emerald-600' : 'text-gray-500'}`} />
               Past Queries
             </div>
             {queries.length > 0 && (
               <Badge variant="secondary" className="px-1.5 min-w-[20px] justify-center">{queries.length}</Badge>
             )}
           </Button>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3">
           <Card className="min-h-[400px] overflow-hidden p-0 border-gray-200/80">
           <AnimatePresence mode="wait">
             
             {/* CALLBACK FORM */}
             {activeTab === 'callback' && (
               <motion.div key="callback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="p-6 md:p-8">
                 <div className="max-w-md">
                   <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-5 border border-emerald-100">
                      <Phone className="w-5 h-5 text-emerald-600" />
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 mb-1.5 tracking-tight">Arrange a Callback</h2>
                   <p className="text-gray-500 font-medium mb-8 text-sm">Enter your phone number and our support team will call you back within 2-4 business hours.</p>
                   
                   <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-gray-700 uppercase tracking-widest">Your Phone Number</label>
                       <div className="flex rounded-md border border-input bg-transparent overflow-hidden text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                         <div className="flex items-center justify-center bg-gray-50 px-3 border-r border-input text-gray-500 font-medium">
                           +91
                         </div>
                         <input
                           type="tel" required 
                           value={phone} onChange={(e) => setPhone(e.target.value)}
                           className="flex-1 bg-transparent px-3 py-2 outline-none font-medium text-gray-900 placeholder:text-gray-400"
                           placeholder="9876543210"
                         />
                       </div>
                     </div>
                     
                     <div className="pt-2">
                       <Button disabled={loading || success} type="submit" className="w-full sm:w-auto min-w-[200px]">
                         {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : success ? <><CheckCircle className="w-4 h-4 mr-2" /> Requested Successfully</> : 'Request Callback'}
                       </Button>
                     </div>
                   </form>
                 </div>
               </motion.div>
             )}

             {/* EMAIL FORM */}
             {activeTab === 'email' && (
               <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="p-6 md:p-8">
                 <div className="max-w-xl">
                   <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-5 border border-emerald-100">
                      <Mail className="w-5 h-5 text-emerald-600" />
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 mb-1.5 tracking-tight">Send us a Message</h2>
                   <p className="text-gray-500 font-medium mb-8 text-sm">Write to us right here, or email directly at <a href="mailto:bagspackgo01@gmail.com" className="text-emerald-600 font-semibold hover:underline">bagspackgo01@gmail.com</a>.</p>
                   
                   <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-gray-700 uppercase tracking-widest">Subject</label>
                       <Input 
                         type="text" required 
                         value={subject} onChange={(e) => setSubject(e.target.value)}
                         placeholder="e.g. Booking Cancellation"
                         className="font-medium bg-gray-50 focus-visible:bg-white"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-gray-700 uppercase tracking-widest">Your Message</label>
                       <Textarea 
                         required rows={5}
                         value={message} onChange={(e) => setMessage(e.target.value)}
                         placeholder="Please describe your issue in detail..."
                         className="font-medium bg-gray-50 focus-visible:bg-white resize-y"
                       />
                     </div>
                     
                     <div className="pt-2">
                       <Button disabled={loading || success} type="submit" className="min-w-[160px]">
                         {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : success ? <><CheckCircle className="w-4 h-4 mr-2" /> Sent</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                       </Button>
                     </div>
                   </form>
                 </div>
               </motion.div>
             )}

             {/* HISTORY AREA */}
             {activeTab === 'history' && (
               <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col min-h-[400px]">
                 <div className="p-6 md:p-8 flex-1 flex flex-col">
                   <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                     <div>
                       <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">Your Support Queries</h2>
                       <p className="text-gray-500 font-medium text-sm mt-0.5">Track the status of your past requests</p>
                     </div>
                   </div>
                   
                   <div className="flex-1 space-y-3">
                     {loadingQueries ? (
                       <div className="flex justify-center items-center py-20">
                         <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                       </div>
                     ) : queries.length > 0 ? (
                       queries.map((q) => (
                         <div key={q._id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-all duration-200">
                            <div className="flex justify-between items-start mb-3 gap-4">
                               <div>
                                 <div className="flex gap-2 items-center mb-1.5">
                                   <Badge variant="secondary" className="text-[9px] uppercase font-bold text-gray-500">
                                     {q.type === 'callback' ? 'Callback' : 'Email'}
                                   </Badge>
                                   <span className="text-[10px] font-medium text-gray-400">
                                     {new Date(q.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'})}
                                   </span>
                                 </div>
                                 <h4 className="font-semibold text-gray-900 text-sm">{q.subject || 'Support Query'}</h4>
                               </div>
                               <div className="shrink-0">{getStatusBadge(q.status)}</div>
                            </div>
                            
                            <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-3 rounded-lg">
                              {q.message}
                            </p>

                            {q.adminReply && (
                              <div className="mt-3 flex gap-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                 <div className="mt-0.5">
                                   <UserCircle2 className="w-4 h-4 text-emerald-600" />
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Support Team</p>
                                   <p className="text-sm text-gray-700 leading-relaxed">{q.adminReply}</p>
                                 </div>
                              </div>
                            )}
                         </div>
                       ))
                     ) : (
                       <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                            <MessageSquare className="w-7 h-7 text-gray-300" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-700 mb-1">No Support Queries</h4>
                          <p className="text-sm text-gray-400 font-medium">You haven't made any requests yet. Everything looks good!</p>
                       </div>
                     )}
                   </div>
                 </div>
               </motion.div>
             )}

           </AnimatePresence>
           </Card>
        </div>
      </div>
    </div>
  );
}
