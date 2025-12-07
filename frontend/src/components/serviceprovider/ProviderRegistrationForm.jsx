'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector , useDispatch } from 'react-redux';
import {addProviderCompany} from 'src/slices/providerCompanySlice'
import { 
  Send, 
  Hourglass, 
  CheckCircle2, 
  MessageCircle, 
  MapPin, 
  Building, 
  Mail, 
  Phone, 
  Map, 
  Instagram, 
  Facebook, 
  FileText, 
  IdCard,
  ChevronRight,
  Clock,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import destinationsData from 'src/data/data.json';
import axios from 'axios';
import { useRouter } from 'next/navigation'

// Modern form field component
function FormField({ label, hint, error, children, required, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <label className="text-sm font-medium flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-emerald-500" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <div className="text-xs text-neutral-500 flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {hint}</div>}
      {error && <div className="text-xs text-rose-600">{error}</div>}
    </motion.div>
  );
}

// Progress status with modern design
function ProgressStatus({ step = 'submitted' }) {
  const STEPS = [
    { id: 'submitted', label: 'Submitted', icon: Send, color: 'bg-blue-500' },
    { id: 'pending', label: 'Under Review', icon: Hourglass, color: 'bg-amber-500' },
    { id: 'approved', label: 'Approved', icon: CheckCircle2, color: 'bg-emerald-500' },
  ];

  const activeIndex = STEPS.findIndex(s => s.id === step);
  
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const active = idx <= activeIndex;
          const completed = idx < activeIndex;
          
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`h-12 w-12 rounded-full ${active ? s.color : 'bg-gray-200'} flex items-center justify-center text-white transition-all duration-500 shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-2 font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              
              {idx < STEPS.length - 1 && (
                <div className={`h-1 w-16 sm:w-24 mx-2 sm:mx-4 rounded-full ${completed ? s.color : 'bg-gray-200'} transition-all duration-500`} />
              )}
            </div>
          );
        })}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm text-gray-600 max-w-md"
      >
        {step === 'submitted' && "We've received your application and will begin processing shortly."}
        {step === 'pending' && "Our team is reviewing your application. This usually takes 1-2 business days."}
        {step === 'approved' && "Congratulations! Your application has been approved. Welcome to BagspackGo!"}
      </motion.div>
    </div>
  );
}

export default function ProviderRegistrationForm() {
  const dispatch = useDispatch();
  const providerData = useSelector((store)=>store?.provider?.currentProvider)
  const [form, setForm] = useState({
    companyName: 'Kavi Pvt Ltd',
    companyMail: 'kavi.workspaceofficial@gmail.com',
    companyMobile: '7827428895',
    destinationId: 'Kashmir',
    address: 'Dwarka',
    instagram: 'https://Kavi/instagram.com',
    facebook: 'https://Kavi/facebook.com',
    licenseFile: null,
    idFile: null,
    availability: { trips: true, treks: true, mergers: true },
    agree: false,
  });
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('form');
  const [status, setStatus] = useState('submitted');
  const [submitted, setSubmitted] = useState(false);

// Process destinations data
const destinations = useMemo(() => {
  const dests = destinationsData.destinations || [];
  return dests
    .filter(d => d && d.value && d.label)
    .map(d => ({
      value: d.value,
      label: d.label
    }));
}, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!form.companyMail.trim()) newErrors.companyMail = 'Email is required';
    if (!form.companyMobile.trim()) newErrors.companyMobile = 'Mobile number is required';
    if (!form.destinationId) newErrors.destinationId = 'Please select a destination';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.licenseFile) newErrors.licenseFile = 'License file is required';
    if (!form.idFile) newErrors.idFile = 'ID proof is required';
    if (!form.agree) newErrors.agree = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function update(path, value) {
    setForm(prev => ({ ...prev, [path]: value }));
    // Clear error when field is updated
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  }

  function updateAvail(key) {
    setForm(prev => ({ ...prev, availability: { ...prev.availability, [key]: !prev.availability[key] } }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Call the backend Api here to store the information of company details
    const formData = new FormData();
    formData.append("providerId" , String(providerData?._id));
    formData.append("companyEmail", form.companyMail);
    formData.append("companyName", form.companyName);
    formData.append("companyMobileNumber", form.companyMobile);
    formData.append("OperatingLocation", form.destinationId);
    formData.append("facebookLink", form.facebook);
    formData.append("instagramLink", form.instagram);
    formData.append("BusinessLicense", form.licenseFile);
    formData.append("idProof", form.idFile);
    formData.append("availability", JSON.stringify(form.availability));
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/completeCompanyDetails`,formData,  { headers: { "Content-Type": "multipart/form-data" } });
      const providerCompanyData = res?.data?.data;
      console.log(providerCompanyData);
      dispatch(addProviderCompany(providerCompanyData))
      
      setSubmitted(true);
      setStatus('submitted');
      
      // Simulate process
      setTimeout(() => setStatus('pending'), 2000);
        setTimeout(() => setStatus('approved'), 6000);
        setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      const backendMessage = error.response?.data?.message || error.response?.data?.error ||'Unable to Complete Profile. Please try again.';
      setErrors(backendMessage);
      console.error('Axios error:', error);
    }
  }

  // File upload handler with style
  const FileUpload = ({ onChange, accept, label, error, required }) => {
    const [fileName, setFileName] = useState('');
    
    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        onChange(file);
      }
    };
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-500" />
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
        
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors p-4 text-center">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileText className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">{accept}</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept={accept}
          />
        </label>
        
        {fileName && (
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            {fileName}
          </p>
        )}
        
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-6 px-4">
     <div className="max-w-6xl mx-auto">
  {/* Main Card - Conditionally remove white background when submitted */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`rounded-3xl shadow-xl overflow-hidden border border-gray-100 ${
      !submitted ? 'bg-white' : 'bg-transparent border-transparent shadow-none'
    }`}
  >
    <AnimatePresence mode="wait">
      {activeTab === 'form' && (
        <motion.div
          key="form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-8"
        >
          {!submitted ? (
            <>
              {/* Header - Only shown when form is not submitted */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <div className="flex justify-center mb-4">
                  <div className="relative w-60 h-28 rounded-3xl bg-white">
                    <Image
                      src="/images/logo.svg"
                      alt="BagspackGo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  Join Our Provider Network
                </h1>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                  Become part of BagspackGo and offer amazing experiences to travelers worldwide
                </p>
              </motion.div>

              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Details */}
                <FormField label="Company Name" required error={errors.companyName} icon={Building}>
                  <input
                    value={form.companyName}
                    onChange={e => update('companyName', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    placeholder="Enter your company name"
                  />
                </FormField>

                <FormField label="Company Email" required error={errors.companyMail} icon={Mail}>
                  <input
                    type="email"
                    value={form.companyMail}
                    onChange={e => update('companyMail', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    placeholder="company@email.com"
                  />
                </FormField>

                <FormField label="Company Mobile" required error={errors.companyMobile} icon={Phone}>
                  <input
                    inputMode="numeric"
                    value={form.companyMobile}
                    onChange={e => update('companyMobile', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    placeholder="+91 9876543210"
                  />
                </FormField>

                <FormField 
                  label="Operating Location" 
                  required 
                  error={errors.destinationId}
                  hint="Primary destination for your operations"
                  icon={MapPin}
                >
                  <div className="relative">
                    <select
                      value={form.destinationId}
                      onChange={e => update('destinationId', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select your primary destination</option>
                      {destinations.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Full Address" required error={errors.address} icon={Map}>
                    <textarea
                      value={form.address}
                      onChange={e => update('address', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all min-h-[100px]"
                      placeholder="Enter your complete business address"
                    />
                  </FormField>
                </div>

                {/* Social Media */}
                <FormField label="Instagram" icon={Instagram}>
                  <div className="flex items-center">
                    <span className="px-3 py-3 bg-gray-100 rounded-l-xl border border-r-0 border-gray-200 text-gray-500">@</span>
                    <input
                      value={form.instagram}
                      onChange={e => update('instagram', e.target.value)}
                      className="w-full rounded-r-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                      placeholder="yourusername"
                    />
                  </div>
                </FormField>

                <FormField label="Facebook" icon={Facebook}>
                  <input
                    value={form.facebook}
                    onChange={e => update('facebook', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    placeholder="https://facebook.com/yourpage"
                  />
                </FormField>

                {/* File Uploads */}
                <FileUpload
                  onChange={file => update('licenseFile', file)}
                  accept=".pdf,.jpg,.png"
                  label="Business License"
                  error={errors.licenseFile}
                  required
                />

                <FileUpload
                  onChange={file => update('idFile', file)}
                  accept=".pdf,.jpg,.png"
                  label="Owner ID Proof"
                  error={errors.idFile}
                  required
                />

                {/* Availability */}
                <div className="md:col-span-2">
                  <FormField label="Services Offered" required>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { key: 'trips', label: 'Trips', icon: '🚗' },
                        { key: 'treks', label: 'Treks', icon: '🏔️' },
                        { key: 'mergers', label: 'Mergers', icon: '👥' },
                      ].map((service) => (
                        <label
                          key={service.key}
                          className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            form.availability[service.key]
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl mb-2">{service.icon}</span>
                          <input
                            type="checkbox"
                            checked={form.availability[service.key]}
                            onChange={() => updateAvail(service.key)}
                            className="hidden"
                          />
                          <span className="text-sm font-medium">{service.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>

                {/* Terms */}
                <div className="md:col-span-2">
                  <label className={`flex items-start gap-3 rounded-xl p-4 border-2 transition-all ${
                    form.agree ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  } ${errors.agree ? 'border-rose-500' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={e => update('agree', e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm">
                      I agree to the{' '}
                      <Link href="/terms" className="text-emerald-600 hover:underline font-medium">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agree && <p className="text-xs text-rose-600 mt-1">{errors.agree}</p>}
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 flex justify-center mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-emerald-200 transition-all"
                  >
                    Submit Application
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </form>
            </>
          ) : (
            // Success message after submission - Centered with compact design
            <div className="flex justify-center items-center min-h-[80vh] py-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-lg"
              >
                <div className="flex justify-center mb-5">
                  <div className="relative w-60 h-20">
                    <Image
                      src="/images/logo.svg"
                      alt="BagspackGo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Application Submitted!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your application. We've received your information and will begin processing it shortly.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveTab('status');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  Track Application Status
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'status' && (
        <motion.div
          key="status"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-8"
        >
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Application Status
            </h2>
            <p className="text-gray-600 ">
              Track the progress of your provider application
            </p>
          </div>

          <ProgressStatus step={status} />

          <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium text-gray-800">Having trouble?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions or need assistance with your application, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/help"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Link>
              <a
                href="mailto:providers@bagspackgo.com"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
</div>
    </div>
  );
}