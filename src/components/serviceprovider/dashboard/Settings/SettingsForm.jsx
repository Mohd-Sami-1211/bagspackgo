'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Package,
  CreditCard,
  Calendar,
  Bell,
  Shield,
  HelpCircle,
  ArrowLeft,
  Camera,
  Upload,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Award,
  Map,
  Building,
  Save,
  CheckCircle2,
  Edit2,
  X,
  Lock,
  FileCheck,
  LifeBuoy,
  MessageSquare,
  Smartphone,
  Trash2,
  KeyRound,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const menuItems = [
  { id: 'profile', label: 'Business Profile', icon: Building2, desc: 'Manage your public details, logo, and bank accounts' },
  { id: 'packages', label: 'Package Management', icon: Package, desc: 'Create and edit your travel packages' },
  { id: 'kyc', label: 'KYC & Verification', icon: FileCheck, desc: 'Upload identity and business documents' },
  { id: 'account', label: 'Account Settings', icon: User, desc: 'Manage email, phone, and account deletion' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Customize your email and SMS alerts' },
  { id: 'security', label: 'Security & Login', icon: Lock, desc: 'Update passwords and secure your account' },
  { id: 'help', label: 'Help & Support', icon: LifeBuoy, desc: 'Get in touch with the support team' },
];

export default function SettingsForm() {
  const [active, setActive] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  // Check if we're on the packages page or have edit param
  useEffect(() => {
    if (pathname.includes('/settings/packages')) {
      setActive('packages');
    } else if (searchParams.get('edit') === 'true') {
      setActive('profile');
    }
  }, [pathname, searchParams]);

  const handleMenuItemClick = (id) => {
    setActive(id);
    if (id === 'packages') {
      router.push('/serviceprovider/dashboard/settings/packages');
    }
  };

  const handleBack = () => {
    setActive(null);
    router.push('/serviceprovider/dashboard/settings');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 -mt-6">
      {/* MENU LIST */}
      {!active && !pathname.includes('/settings/packages') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-6xl pb-12"
        >
          <div className="mb-10 px-2 space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 font-medium text-lg">Manage your business profile, packages, and account preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-2">
            {menuItems.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                className="group relative flex flex-col items-start p-6 md:p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] hover:border-emerald-100 transition-all duration-300 text-left overflow-hidden hover:-translate-y-1"
                onClick={() => handleMenuItemClick(id)}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out opacity-0 group-hover:opacity-100 -z-0"></div>

                <div className="relative z-10 p-3.5 bg-gray-50 text-gray-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 mb-5 border border-gray-100 group-hover:border-emerald-400">
                  <Icon size={26} className="stroke-[2.5]" />
                </div>

                <h3 className="relative z-10 text-xl font-black text-gray-900 mb-2 group-hover:text-emerald-950 transition-colors tracking-tight">{label}</h3>
                <p className="relative z-10 text-sm text-gray-500 font-medium leading-relaxed group-hover:text-emerald-900/70 transition-colors">{desc}</p>

                <div className="relative z-10 flex items-center gap-1.5 mt-6 text-sm font-bold text-emerald-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Manage Settings <ArrowLeft size={16} className="rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* CONTENT VIEW - Only show for non-packages items */}
      {active && active !== 'packages' && !pathname.includes('/settings/packages') && (
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen bg-white mt-4 rounded-2xl"
        >
          <div className="flex items-center gap-3 border-b px-4 py-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setActive(null)}
            >
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-lg font-semibold">
              {menuItems.find((m) => m.id === active)?.label}
            </h2>
          </div>

          <div className="px-5 py-6">
            {active === 'profile' && <ProfileContent initialEditMode={searchParams.get('edit') === 'true'} />}
            {active === 'account' && <AccountContent />}
            {active === 'kyc' && <KYCContent />}
            {active === 'notifications' && <NotificationsContent />}
            {active === 'security' && <SecurityContent />}
            {active === 'help' && <HelpContent />}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Get initials from name: "Dev Himalayan" → "DH"
function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0][0].toUpperCase();
}

function ProfileContent({ initialEditMode = false }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const fileInputRef = useRef(null);

  // Crop modal state
  const [cropModal, setCropModal] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropCanvasRef = useRef(null);
  const cropImgRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    companyname: '',
    companyemail: '',
    companymobile: '',
    address: '',
    bio: '',
    speciality: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    totalTreks: 0,
    totalTrips: 0,
    totalEvents: 0,
    bankName: '',
    accountHolderName: '',
    accountType: 'savings',
    accountNumber: '',
    ifscCode: '',
    logo: '',
    createdAt: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/provider/profile');
        if (res.ok) {
          const { profile } = await res.json();
          setFormData({
            name: profile.name || '',
            companyname: profile.companyname || '',
            companyemail: profile.companyemail || '',
            companymobile: profile.companymobile || '',
            address: profile.address || '',
            bio: profile.bio || '',
            speciality: profile.speciality || '',
            website: profile.website || '',
            instagram: profile.instagram || '',
            facebook: profile.facebook || '',
            twitter: profile.twitter || '',
            totalTreks: profile.totalTreks || 0,
            totalTrips: profile.totalTrips || 0,
            totalEvents: profile.totalEvents || 0,
            bankName: profile.bankName || '',
            accountHolderName: profile.accountHolderName || '',
            accountType: profile.accountType || 'savings',
            accountNumber: profile.accountNumber || '',
            ifscCode: profile.ifscCode || '',
            logo: profile.logo || '',
            createdAt: profile.createdAt || null,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSave = async () => {
    try {
      const res = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsSaved(true);
        // Force sidebar and other listeners to update
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => {
          setIsSaved(false);
          setIsEditing(false);
        }, 2000);
      } else {
        console.error("Failed to save profile");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Logo image must be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(ev.target.result);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
      setCropModal(true);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  // Draw the crop preview onto canvas
  const drawCrop = () => {
    const canvas = cropCanvasRef.current;
    const img = cropImgRef.current;
    if (!canvas || !img) return;
    const SIZE = 280;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(SIZE / iw, SIZE / ih) * cropZoom;
    const sw = iw * scale;
    const sh = ih * scale;
    const dx = (SIZE - sw) / 2 + cropOffset.x;
    const dy = (SIZE - sh) / 2 + cropOffset.y;
    ctx.drawImage(img, dx, dy, sw, sh);
    ctx.restore();
  };

  const handleCropConfirm = () => {
    const canvas = cropCanvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setFormData(prev => ({ ...prev, logo: dataUrl }));
    setCropModal(false);
    setCropSrc(null);
  };

  const handleCropMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };
  const handleCropMouseMove = (e) => {
    if (!isDragging) return;
    setCropOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleCropMouseUp = () => setIsDragging(false);

  // Touch support
  const handleCropTouchStart = (e) => {
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - cropOffset.x, y: t.clientY - cropOffset.y });
  };
  const handleCropTouchMove = (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    setCropOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  // Redraw whenever crop params change
  useEffect(() => {
    if (cropModal && cropSrc && cropImgRef.current?.complete) {
      drawCrop();
    }
  }, [cropZoom, cropOffset, cropModal]);

  // Dynamic Styles based on isEditing state
  const baseInputStyles = "w-full py-3 rounded-xl transition-all text-sm outline-none";
  const editableStyles = "border border-emerald-200 bg-white shadow-inner focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-emerald-300 text-gray-900 placeholder:text-gray-400";
  const readonlyStyles = "border border-transparent bg-transparent text-gray-800 font-semibold cursor-default placeholder:text-transparent";

  const currentTheme = isEditing ? editableStyles : readonlyStyles;

  const inputClasses = `${baseInputStyles} pl-11 pr-4 ${currentTheme}`;
  const textareaClasses = `${baseInputStyles} pr-4 resize-none ${currentTheme}`;
  const selectClasses = `${baseInputStyles} px-4 ${currentTheme} ${!isEditing && "appearance-none"}`;
  const labelClasses = "block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider pl-1";
  const cardClasses = `bg-white rounded-3xl border ${isEditing ? 'border-emerald-100 shadow-[0_8px_30px_rgba(16,185,129,0.08)]' : 'border-gray-100 shadow-sm'} p-6 md:p-8 relative overflow-hidden transition-all duration-300`;
  const iconWrapperClasses = `absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${isEditing ? 'text-emerald-500' : 'text-gray-400'}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

      {/* ── Crop Modal ── */}
      {cropModal && cropSrc && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center gap-5">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Adjust your logo</h3>
            <p className="text-xs text-gray-500 -mt-3 text-center">Drag to reposition · Use slider to zoom</p>

            {/* Hidden img used for drawing */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={cropImgRef} src={cropSrc} alt="" className="hidden" onLoad={drawCrop} />

            {/* Circular crop preview */}
            <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden ring-4 ring-emerald-400 ring-offset-2 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onTouchEnd={handleCropMouseUp}
            >
              <canvas ref={cropCanvasRef} width={280} height={280} className="w-full h-full" />
            </div>

            {/* Zoom slider */}
            <div className="w-full flex items-center gap-3">
              <span className="text-xs text-gray-400 font-bold">−</span>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.02}
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <span className="text-xs text-gray-400 font-bold">+</span>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setCropModal(false); setCropSrc(null); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand New Clean Header Concept */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 transition-all relative overflow-hidden">

        {/* Logo Avatar Section */}
        <div className="flex flex-col items-center gap-2 shrink-0 z-10">
          <div className={`relative ${isEditing ? 'cursor-pointer group/logo' : ''}`}
            onMouseEnter={() => isEditing && setIsHovering(true)}
            onMouseLeave={() => isEditing && setIsHovering(false)}
            onClick={() => isEditing && fileInputRef.current?.click()}
          >
            <div className={`w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${isEditing ? 'border-2 border-emerald-400 border-dashed bg-emerald-100/60' : 'border-4 border-emerald-100 bg-emerald-50 shadow-md'}`}>
              {formData.logo ? (
                <img src={formData.logo} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl md:text-5xl font-black tracking-tighter text-emerald-600">{formData.companyname ? getInitials(formData.companyname) : 'CO'}</div>
              )}
              {/* Hover Overlay Only active when editing */}
              {isEditing && (
                <div className={`absolute inset-0 rounded-full bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 z-20 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                  <Camera size={26} className="text-white mb-1" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider text-center px-4 leading-tight mt-1">Change<br />Image</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" disabled={!isEditing} onChange={handleLogoUpload} />
          </div>

          {/* Subtle text under logo during edit mode */}
          {isEditing && (
            <span className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
              <Upload size={12} /> Upload Logo
            </span>
          )}
        </div>

        {/* Profile Info & Helper Text */}
        <div className="flex-1 text-center md:text-left flex flex-col justify-center min-h-[8rem] md:min-h-[10rem] z-10 w-full">
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">{formData.name || 'Mohd Sami'}</h3>
          <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 text-lg mb-5">
            <Building2 size={20} className="text-emerald-600" /> {formData.companyname || 'Bagspackgo Travels'}
          </p>

          {!isEditing ? (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Shield size={14} className="text-emerald-500" /> Verified Partner</span>
              <span className="text-gray-400 text-sm font-medium">Member since {formData.createdAt ? new Date(formData.createdAt).getFullYear() : '2024'}</span>
            </div>
          ) : (
            <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100 w-full max-w-lg mx-auto md:mx-0">
              <p className="text-emerald-700 text-sm font-medium flex items-center gap-3">
                <Edit2 size={16} className="text-emerald-600" />
                Update your company information below. Changes will be instantly visible to your customers.
              </p>
            </div>
          )}
        </div>

        {/* Toggle Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end mt-4 md:mt-0 z-10 pt-2 lg:pt-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2.5 rounded-xl bg-gray-900 text-white px-7 py-3.5 font-bold hover:bg-gray-800 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-600 px-6 py-3 font-bold hover:bg-gray-50 transition-all flex-1 sm:flex-none"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-8 py-3 font-bold hover:bg-emerald-700 transition-all shadow-lg flex-1 sm:flex-none hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSaved ? <CheckCircle2 size={18} className="text-white" /> : <Save size={18} />}
                {isSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left/Main Column - Forms */}
        <div className="xl:col-span-2 space-y-8">

          {/* General Information Section */}
          <div className={cardClasses}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-10 transition-opacity duration-300 ${isEditing ? 'opacity-100' : 'opacity-40'}`}></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-100/50 rounded-2xl text-emerald-600">
                <User size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">General Details</h4>
                <p className="text-xs text-emerald-600/70 font-medium mt-0.5">
                  {isEditing ? 'Edit your public business information below.' : 'Your public business information.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-1 group">
                <label className={labelClasses}>Full Name</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><User size={18} /></div>
                  <input type="text" className={inputClasses} placeholder="e.g. Mohd Sami" name="name" value={formData.name} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className={labelClasses}>Company Name</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Building2 size={18} /></div>
                  <input type="text" className={inputClasses} placeholder="e.g. Bagspackgo Travels" name="companyname" value={formData.companyname} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className={labelClasses}>Email Address</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Mail size={18} /></div>
                  <input type="email" className={inputClasses} placeholder="sami@example.com" name="companyemail" value={formData.companyemail} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className={labelClasses}>Mobile Number</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Phone size={18} /></div>
                  <input type="tel" className={inputClasses} placeholder="+91 XXXXXXXXXX" name="companymobile" value={formData.companymobile} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1 group">
                <label className={labelClasses}>Company Address</label>
                <div className="relative">
                  <div className={`absolute top-3.5 left-3.5 pointer-events-none transition-colors ${isEditing ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <MapPin size={18} />
                  </div>
                  <textarea rows={2} className={`${textareaClasses} pl-11`} placeholder="Enter full address" name="address" value={formData.address} onChange={handleChange} readOnly={!isEditing}></textarea>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1 group">
                <label className={labelClasses}>Bio / About Company</label>
                <textarea rows={3} className={`${textareaClasses} px-4 py-3`} placeholder="Tell your customers about your services and passion for travel..." name="bio" value={formData.bio} onChange={handleChange} readOnly={!isEditing}></textarea>
              </div>

              <div className="md:col-span-2 space-y-1 group">
                <label className={labelClasses}>Speciality</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Award size={18} /></div>
                  <input type="text" className={inputClasses} placeholder="e.g. High Altitude Treks..." name="speciality" value={formData.speciality} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className={`${cardClasses} ${isEditing ? 'border-blue-100 shadow-[0_8px_30px_rgba(59,130,246,0.08)]' : ''}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 transition-opacity duration-300 ${isEditing ? 'opacity-100' : 'opacity-40'}`}></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-100/50 rounded-2xl text-blue-600">
                <Building size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Payout Settings
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Secure</span>
                </h4>
                <p className="text-xs text-blue-600/70 font-medium mt-0.5">Where we will send your earnings.</p>
              </div>
            </div>

            <div className={`p-6 rounded-[1.5rem] border grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden transition-colors duration-300 ${isEditing ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
              {/* Decorative background element for bank card feel */}
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                <CreditCard size={150} />
              </div>

              <div className="md:col-span-2 space-y-1 group relative z-10">
                <label className={labelClasses}>Account Holder Name</label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${isEditing ? 'text-blue-500' : 'text-gray-400'}`}><User size={18} /></div>
                  <input type="text" className={`${inputClasses.replace('focus:ring-emerald-500/20', 'focus:ring-blue-500/20').replace('focus:border-emerald-500', 'focus:border-blue-500')} ${isEditing && 'border-blue-200 hover:border-blue-300'}`} placeholder="Name exactly as per bank records" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1 group relative z-10">
                <label className={labelClasses}>Bank Name</label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${isEditing ? 'text-blue-500' : 'text-gray-400'}`}><Building size={18} /></div>
                  <input type="text" className={`${inputClasses.replace('focus:ring-emerald-500/20', 'focus:ring-blue-500/20').replace('focus:border-emerald-500', 'focus:border-blue-500')} ${isEditing && 'border-blue-200 hover:border-blue-300'}`} placeholder="e.g. HDFC Bank" name="bankName" value={formData.bankName} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1 group relative z-10">
                <label className={labelClasses}>Account Type</label>
                <select name="accountType" value={formData.accountType} onChange={handleChange} className={`${selectClasses.replace('focus:ring-emerald-500/20', 'focus:ring-blue-500/20').replace('focus:border-emerald-500', 'focus:border-blue-500')} ${isEditing && 'border-blue-200 hover:border-blue-300'}`} disabled={!isEditing}>
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                </select>
              </div>

              <div className="space-y-1 group relative z-10">
                <label className={labelClasses}>Account Number</label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${isEditing ? 'text-blue-500' : 'text-gray-400'}`}><CreditCard size={18} /></div>
                  <input type="text" className={`${inputClasses.replace('focus:ring-emerald-500/20', 'focus:ring-blue-500/20').replace('focus:border-emerald-500', 'focus:border-blue-500')} font-mono tracking-widest ${isEditing && 'border-blue-200 hover:border-blue-300'}`} placeholder="XXXXXXXXXX" name="accountNumber" value={!isEditing && formData.accountNumber && formData.accountNumber.length > 4 ? '••••' + formData.accountNumber.slice(-4) : formData.accountNumber} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1 group relative z-10">
                <label className={labelClasses}>IFSC Code</label>
                <input type="text" className={`${baseInputStyles} px-4 font-mono uppercase tracking-widest ${isEditing ? 'border border-blue-200 bg-white shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 text-gray-900 placeholder:text-gray-400' : readonlyStyles}`} placeholder="e.g. HDFC0001234" name="ifscCode" value={formData.ifscCode} onChange={handleChange} readOnly={!isEditing} />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Sidecards */}
        <div className="xl:col-span-1 space-y-8">

          {/* Platform Experience */}
          <div className={cardClasses}>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
                <Award size={20} className="stroke-[2.5]" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Experience</h4>
            </div>

            <div className="space-y-4">
              {/* Treks */}
              <div className={`group flex justify-between items-center p-4 rounded-2xl border transition-all ${isEditing ? 'border-emerald-200 bg-emerald-50/50 shadow-inner focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500' : 'border-gray-100 bg-white shadow-sm'}`}>
                <label className="text-sm text-gray-600 flex items-center gap-3 font-semibold pointer-events-none transition-colors">
                  <div className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Map size={18} />
                  </div>
                  Treks Hosted
                </label>
                <div className="relative flex items-center">
                  <input type="number" className={`text-right bg-transparent border-none font-black text-lg outline-none focus:ring-0 transition-all ${isEditing ? 'w-24 text-emerald-800 bg-white pl-3 pr-8 py-2 rounded-xl shadow-inner border border-emerald-300 pointer-events-auto cursor-text focus:border-emerald-500' : 'w-16 p-0 text-gray-800 pointer-events-none'}`} name="totalTreks" value={formData.totalTreks} onChange={handleChange} readOnly={!isEditing} />
                  {isEditing && <Edit2 size={14} className="absolute right-3 text-emerald-400 pointer-events-none" />}
                </div>
              </div>

              {/* Trips */}
              <div className={`group flex justify-between items-center p-4 rounded-2xl border transition-all ${isEditing ? 'border-teal-200 bg-teal-50/50 shadow-inner focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500' : 'border-gray-100 bg-white shadow-sm'}`}>
                <label className="text-sm text-gray-600 flex items-center gap-3 font-semibold pointer-events-none transition-colors">
                  <div className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-teal-100 text-teal-700' : 'bg-teal-50 text-teal-600'}`}>
                    <Globe size={18} />
                  </div>
                  Trips Hosted
                </label>
                <div className="relative flex items-center">
                  <input type="number" className={`text-right bg-transparent border-none font-black text-lg outline-none focus:ring-0 transition-all ${isEditing ? 'w-24 text-teal-800 bg-white pl-3 pr-8 py-2 rounded-xl shadow-inner border border-teal-300 pointer-events-auto cursor-text focus:border-teal-500' : 'w-16 p-0 text-gray-800 pointer-events-none'}`} name="totalTrips" value={formData.totalTrips} onChange={handleChange} readOnly={!isEditing} />
                  {isEditing && <Edit2 size={14} className="absolute right-3 text-teal-400 pointer-events-none" />}
                </div>
              </div>

              {/* Events */}
              <div className={`group flex justify-between items-center p-4 rounded-2xl border transition-all ${isEditing ? 'border-blue-200 bg-blue-50/50 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500' : 'border-gray-100 bg-white shadow-sm'}`}>
                <label className="text-sm text-gray-600 flex items-center gap-3 font-semibold pointer-events-none transition-colors">
                  <div className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                    <Calendar size={18} />
                  </div>
                  Events
                </label>
                <div className="relative flex items-center">
                  <input type="number" className={`text-right bg-transparent border-none font-black text-lg outline-none focus:ring-0 transition-all ${isEditing ? 'w-24 text-blue-800 bg-white pl-3 pr-8 py-2 rounded-xl shadow-inner border border-blue-300 pointer-events-auto cursor-text focus:border-blue-500' : 'w-16 p-0 text-gray-800 pointer-events-none'}`} name="totalEvents" value={formData.totalEvents} onChange={handleChange} readOnly={!isEditing} />
                  {isEditing && <Edit2 size={14} className="absolute right-3 text-blue-400 pointer-events-none" />}
                </div>
              </div>
            </div>
            {isEditing && <p className="text-[11px] text-emerald-600/70 mt-5 text-center px-4 font-bold uppercase tracking-wider">Update stats to build trust.</p>}
          </div>

          {/* Social Links Form */}
          <div className={cardClasses}>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                <Globe size={20} className="stroke-[2.5]" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Web & Social</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 group">
                <label className={labelClasses}>Website</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Globe size={16} /></div>
                  <input type="url" className={`${inputClasses} py-2.5`} placeholder="https://" name="website" value={formData.website} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className={labelClasses}>Instagram</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Instagram size={16} /></div>
                  <input type="text" className={`${inputClasses} py-2.5`} placeholder="@username" name="instagram" value={formData.instagram} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className={labelClasses}>Facebook</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Facebook size={16} /></div>
                  <input type="text" className={`${inputClasses} py-2.5`} placeholder="Page URL" name="facebook" value={formData.facebook} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className={labelClasses}>Twitter / X</label>
                <div className="relative">
                  <div className={iconWrapperClasses}><Twitter size={16} /></div>
                  <input type="text" className={`${inputClasses} py-2.5`} placeholder="@username" name="twitter" value={formData.twitter} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


function AccountContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
            <User size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">Personal Data</h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage the email and phone linked to your account.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5 group">
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider pl-1">Email Address</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500"><Mail size={18} /></div>
                <input type="email" className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-emerald-200 bg-white shadow-inner focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" defaultValue="sami@example.com" />
              </div>
              <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">Update</button>
            </div>
          </div>

          <div className="space-y-1.5 group">
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider pl-1">Phone Number</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500"><Phone size={18} /></div>
                <input type="tel" className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-emerald-200 bg-white shadow-inner focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" defaultValue="+91 9876543210" />
              </div>
              <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">Update</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50/50 rounded-3xl border border-red-100 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600 mt-1">
            <Trash2 size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 tracking-tight">Danger Zone</h4>
            <p className="text-sm text-gray-600 font-medium mt-1 mb-4">Deleting your account is permanent. All associated data will be removed and cannot be recovered.</p>
            <button className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition shadow-sm">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KYCContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-amber-50 rounded-[2rem] border border-amber-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <AlertCircle size={32} className="text-amber-500 shrink-0" />
        <div>
          <h4 className="font-bold text-amber-900 text-lg">Action Required</h4>
          <p className="text-sm text-amber-800/80 font-medium mt-0.5">Please upload your business registration and identity documents to remove the limit on your account and receive the "Verified Partner" badge.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Identity Proof (Aadhaar / PAN)', status: 'pending', id: 'id' },
          { title: 'Business Registration (GST / Trade License)', status: 'missing', id: 'business' },
          { title: 'Canceled Cheque', status: 'missing', id: 'bank' },
        ].map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 group hover:border-emerald-100 hover:shadow-md transition">
            <div className={`p-3 rounded-2xl w-max mb-5 ${item.status === 'missing' ? 'bg-gray-100 text-gray-500' : item.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <FileText size={24} className="stroke-[2.5]" />
            </div>
            <h5 className="font-bold text-gray-900 text-lg">{item.title}</h5>

            {item.status === 'missing' && (
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2.5 py-1 rounded border border-red-100 inline-block mb-4">Action Needed</span>
                <button className="w-full flex justify-center items-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-semibold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer">
                  <Upload size={18} /> Upload File
                </button>
              </div>
            )}
            {item.status === 'pending' && (
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block mb-2">Under Review</span>
                <p className="text-xs text-gray-500 font-medium">Uploaded on Mar 5, 2026. Usually takes 24 hours.</p>
              </div>
            )}
            {item.status === 'verified' && (
              <div className="mt-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">Verified Successfully</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
            <Bell size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">Communication Preferences</h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Control how Bagspackgo alerts you about new bookings.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-2xl bg-gray-50/50">
            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-0.5" size={20} />
              <div>
                <span className="block font-bold text-gray-900">Email Notifications</span>
                <span className="text-[13px] text-gray-500 font-medium">Receive an email for every new booking and cancellation.</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-2xl bg-gray-50/50">
            <div className="flex items-start gap-3">
              <Smartphone className="text-gray-400 mt-0.5" size={20} />
              <div>
                <span className="block font-bold text-gray-900">SMS Alerts</span>
                <span className="text-[13px] text-gray-500 font-medium">Urgent notifications sent directly to your phone.</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <button className="mt-4 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-sm">Save Preferences</button>
        </div>
      </div>
    </div>
  );
}

function SecurityContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
            <KeyRound size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">Change Password</h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Ensure your account uses a long, random password.</p>
          </div>
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider pl-1">Current Password</label>
            <input type="password" className="w-full py-3.5 px-4 rounded-xl border border-indigo-200 bg-white shadow-inner focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="••••••••" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider pl-1">New Password</label>
            <input type="password" className="w-full py-3.5 px-4 rounded-xl border border-indigo-200 bg-white shadow-inner focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="New Password" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider pl-1">Confirm New Password</label>
            <input type="password" className="w-full py-3.5 px-4 rounded-xl border border-indigo-200 bg-white shadow-inner focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="Confirm Password" />
          </div>

          <div className="pt-2">
            <button className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg w-full sm:w-auto">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <LifeBuoy size={120} className="absolute -right-10 -bottom-10 text-white/10" />

        <h2 className="text-3xl font-black mb-3">How can we help you today?</h2>
        <p className="text-emerald-100 max-w-lg text-lg mb-8">Whether you have questions about a booking, payments, or the platform, our specialized partner support team is here to assist.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 bg-white text-emerald-900 px-6 py-4 rounded-2xl font-bold hover:shadow-lg transition hover:-translate-y-1">
            <MessageSquare size={20} className="text-emerald-500" />
            Live Chat
          </button>
          <button className="flex items-center gap-3 bg-emerald-700/50 text-white border border-emerald-500/30 px-6 py-4 rounded-2xl font-bold hover:bg-emerald-700 hover:shadow-lg transition hover:-translate-y-1 backdrop-blur-sm">
            <Phone size={20} className="text-emerald-300" />
            Request Callback
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border p-6 hover:shadow-md transition">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><FileText size={18} className="text-emerald-600" /> Read the Documentation</h4>
          <p className="text-sm text-gray-500 mb-4">Learn how to create compelling travel packages and get the most out of Bagspackgo.</p>
          <a href="#" className="text-sm font-bold text-emerald-600 hover:underline">View Guides &rarr;</a>
        </div>
        <div className="bg-white rounded-3xl border p-6 hover:shadow-md transition">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><Mail size={18} className="text-emerald-600" /> Email Support</h4>
          <p className="text-sm text-gray-500 mb-4">Send us an email directly at partners@bagspackgo.com with your queries.</p>
          <a href="mailto:partners@bagspackgo.com" className="text-sm font-bold text-emerald-600 hover:underline">Send Email &rarr;</a>
        </div>
      </div>
    </div>
  );
}