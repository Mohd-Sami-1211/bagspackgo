'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, Link2, FileText, Sparkles, CheckCircle2,
  AlertCircle, Loader2, X, FileUp, Globe, Type, ChevronRight,
  Zap, Brain, Package as PackageIcon, Wand2
} from 'lucide-react';

const IMPORT_MODES = [
  {
    id: 'pdf',
    label: 'Upload PDF',
    desc: 'Upload a brochure or package PDF',
    icon: FileUp,
    color: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    lightText: 'text-violet-600',
    border: 'border-violet-200',
    ring: 'ring-violet-100',
  },
  {
    id: 'url',
    label: 'Paste Link',
    desc: 'Paste a URL to an existing package page',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    border: 'border-blue-200',
    ring: 'ring-blue-100',
  },
  {
    id: 'text',
    label: 'Paste Text',
    desc: 'Copy-paste package details directly',
    icon: Type,
    color: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
    border: 'border-amber-200',
    ring: 'ring-amber-100',
  },
];

const STEPS = [
  { icon: Upload, label: 'Upload Source' },
  { icon: Brain, label: 'AI Analysis' },
  { icon: CheckCircle2, label: 'Review & Edit' },
];

export default function SmartImport({ adminMode = false, providerId = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const backPath = adminMode
    ? `/admin/providers/${providerId}`
    : '/serviceprovider/dashboard/settings/packages';

  const [mode, setMode] = useState(null);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [step, setStep] = useState(0); // 0=input, 1=processing, 2=done
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.includes('pdf')) { setError('Only PDF files are accepted.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return; }
    setFile(f);
    setError('');
  };

  const canSubmit = () => {
    if (mode === 'pdf') return !!file;
    if (mode === 'url') return url.trim().length > 5;
    if (mode === 'text') return text.trim().length >= 50;
    return false;
  };

  const handleImport = async () => {
    if (!canSubmit()) return;
    setError('');
    setStep(1);
    setProgress(0);

    // Simulate progress steps
    const msgs = [
      'Uploading content…',
      'Reading document…',
      'AI is analyzing the package…',
      'Extracting pricing & itinerary…',
      'Structuring data for your form…',
      'Almost done…',
    ];
    let idx = 0;
    setStatusMsg(msgs[0]);
    const interval = setInterval(() => {
      idx++;
      if (idx < msgs.length) {
        setStatusMsg(msgs[idx]);
        setProgress(Math.min(90, (idx / msgs.length) * 100));
      }
    }, 2500);

    try {
      const formData = new FormData();
      formData.append('importType', mode);
      if (mode === 'pdf') formData.append('file', file);
      if (mode === 'url') formData.append('url', url.trim());
      if (mode === 'text') formData.append('text', text.trim());

      const res = await fetch('/api/provider/packages/smart-import', {
        method: 'POST',
        body: formData,
      });
      // Note: the provider API route already allows role === 'admin'

      clearInterval(interval);
      const result = await res.json();

      if (!result.success) {
        setError(result.message || 'Import failed. Please try again.');
        setStep(0);
        return;
      }

      setProgress(100);
      setStatusMsg('Package data extracted!');

      // Store extracted data in sessionStorage and redirect to the form
      const data = result.data;
      const isTrip = data.category === 'trip';

      sessionStorage.setItem('smartImportData', JSON.stringify(data));
      sessionStorage.setItem('smartImportCategory', data.category);

      // Brief pause to show completion
      setTimeout(() => {
        if (adminMode) {
          router.push(`/admin/providers/${providerId}/packages/new?type=${isTrip ? 'trip' : 'trek'}&fromImport=true`);
        } else if (isTrip) {
          router.push('/serviceprovider/dashboard/settings/packages/new?fromImport=true');
        } else {
          router.push('/serviceprovider/dashboard/settings/packages/new-trek?fromImport=true');
        }
      }, 1200);

    } catch (err) {
      clearInterval(interval);
      console.error('Smart import error:', err);
      setError('Network error. Please check your connection and try again.');
      setStep(0);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(backPath)}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-black text-gray-900 tracking-tight leading-none mb-1">Smart Import</h1>
              <p className="text-[12px] text-gray-400 font-medium">AI-powered package creation from existing content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-1 py-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
              step >= i
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <s.icon size={13} className={step >= i ? 'text-emerald-500' : ''} />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className={step > i ? 'text-emerald-400' : 'text-gray-200'} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Input */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {/* Info Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-5 sm:p-7 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-amber-300" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/70">Powered by Google Gemini AI</span>
                </div>
                <h2 className="text-[20px] sm:text-[24px] font-black leading-tight mb-2">
                  Import your existing packages<br className="hidden sm:block" /> in seconds
                </h2>
                <p className="text-[13px] text-white/70 max-w-lg leading-relaxed">
                  Upload a PDF brochure, paste a link to your package page, or copy-paste the details.
                  Our AI will extract everything and pre-fill the creation form for you.
                </p>
              </div>
            </div>

            {/* Mode Selector */}
            <div>
              <h3 className="text-[14px] font-bold text-gray-800 mb-3">Choose import method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {IMPORT_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setError(''); }}
                    className={`group relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      mode === m.id
                        ? `${m.border} ${m.lightBg} ring-2 ${m.ring}`
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3 shadow-sm`}>
                      <m.icon size={20} className="text-white" />
                    </div>
                    <p className={`text-[14px] font-bold ${mode === m.id ? m.lightText : 'text-gray-800'}`}>{m.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
                    {mode === m.id && (
                      <motion.div
                        layoutId="mode-check"
                        className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center`}
                      >
                        <CheckCircle2 size={12} className="text-white" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <AnimatePresence mode="wait">
              {mode === 'pdf' && (
                <motion.div key="pdf" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-white border-2 border-dashed border-violet-200 rounded-2xl p-8 text-center hover:border-violet-400 transition-all">
                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    {file ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                          <FileText size={28} className="text-violet-600" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">{file.name}</p>
                          <p className="text-[11px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={() => { setFile(null); fileInputRef.current.value = ''; }}
                          className="text-[12px] text-rose-500 font-semibold hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                          <Upload size={24} className="text-violet-400" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-700">Click to upload PDF</p>
                          <p className="text-[11px] text-gray-400">Max 10 MB · PDF only</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {mode === 'url' && (
                <motion.div key="url" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Package URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/your-package-page"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">Paste the full URL of an existing package listing</p>
                  </div>
                </motion.div>
              )}

              {mode === 'text' && (
                <motion.div key="text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Package Content</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={8}
                      placeholder="Paste the complete package details here — including name, destination, duration, pricing, itinerary, inclusions, exclusions, terms & conditions..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all resize-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">{text.length} / 30,000 characters (minimum 50)</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-rose-700">{error}</p>
                  <p className="text-[11px] text-rose-400 mt-0.5">Please fix the issue and try again.</p>
                </div>
              </motion.div>
            )}

            {/* Submit */}
            {mode && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={!canSubmit()}
                  className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Zap size={16} />
                  Extract with AI
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 1: Processing */}
        {step === 1 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-20 px-4"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-200">
                <Brain size={40} className="text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
            <h3 className="text-[20px] font-black text-gray-900 mb-2 text-center">AI is analyzing your package</h3>
            <p className="text-[13px] text-gray-400 text-center max-w-sm mb-8">{statusMsg}</p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-2 font-bold">{Math.round(progress)}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
