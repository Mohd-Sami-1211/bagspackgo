'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Select from 'react-select';
import {
  User, Mail, Phone, ChevronDown, ChevronUp, Upload, ArrowLeft, ArrowRight,
  X, Heart, Users, Check, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { compressImage } from '@/lib/imageCompression';

/* ── Custom dropdown styling ─────────────────────────── */
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    fontSize: '0.85rem',
    borderColor: state.isFocused ? '#1e293b' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #1e293b' : null,
    '&:hover': { borderColor: state.isFocused ? '#1e293b' : '#d1d5db' },
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  }),
  menu: (p) => ({ ...p, zIndex: 50, borderRadius: '10px', overflow: 'hidden' }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  option: (p, state) => ({
    ...p,
    borderRadius: '6px',
    backgroundColor: state.isSelected ? '#f1f5f9' : state.isFocused ? '#f8fafc' : 'white',
    color: state.isSelected ? '#0f172a' : '#475569',
    padding: '8px 12px', margin: '4px 0',
    '&:active': { backgroundColor: '#6ee7b7' },
  }),
  menuList: (p) => ({ ...p, padding: '4px' }),
};

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

/* ── Component ───────────────────────────────────────── */
const PersonalDetails = ({
  category = "individual",
  onNext,
  onSave,
  onBack,
  onSubmit,
}) => {
  const searchParams = useSearchParams();
  const countRaw = searchParams.get("count") || "1";

  // Now count is always an exact number (from the counter)
  const numPeople = Math.max(1, parseInt(countRaw) || 1);

  const { user } = useAuth();
  // Contact details state
  const [contactDetails, setContactDetails] = useState({
    email: user?.email || "",
    mobile: user?.phone || "",
  });

  useEffect(() => {
    if (user && (!contactDetails.email || !contactDetails.mobile)) {
        setContactDetails(prev => ({
            email: prev.email || user.email || "",
            mobile: prev.mobile || user.phone || ""
        }));
    }
  }, [user]);

  // Personal details state - fixed number based on count
  const [personalDetails, setPersonalDetails] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [errors, setErrors] = useState({});

  // ID proof options
  const idProofOptions = [
    { value: "aadhar", label: "Aadhar Card", maxLength: 12 },
    { value: "pan", label: "PAN Card", maxLength: 10 },
    { value: "voter", label: "Voter ID", maxLength: 10 },
    { value: "passport", label: "Passport", maxLength: 12 },
    { value: "dl", label: "Driving License", maxLength: 15 },
  ];

  // Compute total travellers
  const totalTravellers = category === 'couple' ? numPeople * 2 : numPeople;

  // Initialize personal details based on count
  useEffect(() => {
    const createNewTraveler = (index) => {
      if (category === "couple") {
        return [
          { type: "male", coupleId: Math.floor(index / 2), name: "", gender: "male", age: "", nationality: "", idType: null, idNumber: "", idImage: null, idImagePreview: "" },
          { type: "female", coupleId: Math.floor(index / 2), name: "", gender: "female", age: "", nationality: "", idType: null, idNumber: "", idImage: null, idImagePreview: "" },
        ];
      }
      return { type: "individual", name: "", gender: null, age: "", nationality: "", idType: null, idNumber: "", idImage: null, idImagePreview: "" };
    };

    let loadedFromSession = false;
    try {
      const saved = localStorage.getItem("temp_personal_details");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.category === category && parsed.totalTravellers === totalTravellers) {
          if (parsed.contactDetails) setContactDetails(parsed.contactDetails);
          if (parsed.personalDetails && parsed.personalDetails.length === totalTravellers) {
            setPersonalDetails(parsed.personalDetails);
            loadedFromSession = true;
          }
        }
      }
    } catch(e) {
      console.error("Failed to parse temporary booking data", e);
    }

    if (!loadedFromSession) {
      let details;
      if (category === 'couple') {
        details = Array.from({ length: numPeople }, (_, i) => createNewTraveler(i * 2)).flat();
      } else {
        details = Array.from({ length: numPeople }, (_, i) => createNewTraveler(i));
      }
      setPersonalDetails(details);
    }

    // Expand first section by default
    setExpandedSections({ 0: true });
  }, [category, numPeople, totalTravellers]);

  // Persist form data temporarily on change
  useEffect(() => {
    const hasAnyData = contactDetails.email || contactDetails.mobile || personalDetails.some(p => p.name || p.age || p.nationality || p.idNumber);
    if (hasAnyData) {
      const safePersonalDetails = personalDetails.map(p => {
        const { idImage, idImagePreview, ...rest } = p;
        return rest;
      });
      localStorage.setItem("temp_personal_details", JSON.stringify({
        category, totalTravellers, contactDetails, personalDetails: safePersonalDetails
      }));
    }
  }, [contactDetails, personalDetails, category, totalTravellers]);

  const handleContactChange = (field, value) => {
    setContactDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handlePersonalChange = (index, field, value) => {
    const newDetails = [...personalDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    if (field === "idType") newDetails[index].idNumber = "";
    setPersonalDetails(newDetails);
    if (errors[`personal_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`personal_${index}_${field}`]: "" }));
    }
  };

  const handleIdImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image size should be less than 2MB"); return; }
    try {
      const compressed = await compressImage(file, { maxWidth: 1200, quality: 0.75 });
      const newDetails = [...personalDetails];
      newDetails[index].idImage = file;
      newDetails[index].idImagePreview = compressed;
      setPersonalDetails(newDetails);
    } catch (err) {
      console.error('Compression error:', err);
      // Fallback to raw
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDetails = [...personalDetails];
        newDetails[index].idImage = file;
        newDetails[index].idImagePreview = reader.result;
        setPersonalDetails(newDetails);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Check if a traveller has data filled
  const isTravellerFilled = (detail) => {
    return detail.name && detail.age;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!contactDetails.email) {
      newErrors.email = "Email is required"; isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(contactDetails.email)) {
      newErrors.email = "Invalid email format"; isValid = false;
    }
    if (!contactDetails.mobile) {
      newErrors.mobile = "Mobile number is required"; isValid = false;
    } else if (!/^[0-9]{10}$/.test(contactDetails.mobile)) {
      newErrors.mobile = "Invalid mobile number (10 digits required)"; isValid = false;
    }

    personalDetails.forEach((detail, index) => {
      if (!detail.name) { newErrors[`personal_${index}_name`] = "Name is required"; isValid = false; }
      if (!detail.gender && category !== "couple") { newErrors[`personal_${index}_gender`] = "Gender is required"; isValid = false; }
      if (!detail.age) { newErrors[`personal_${index}_age`] = "Age is required"; isValid = false; }
      if (!detail.nationality) { newErrors[`personal_${index}_nationality`] = "Nationality is required"; isValid = false; }
      if (!detail.idType) { newErrors[`personal_${index}_idType`] = "ID type is required"; isValid = false; }
      else if (!detail.idNumber) { newErrors[`personal_${index}_idNumber`] = "ID number is required"; isValid = false; }
      else {
        const selectedId = idProofOptions.find(opt => opt.value === (detail.idType?.value || detail.idType));
        if (selectedId && detail.idNumber.length !== selectedId.maxLength) {
          newErrors[`personal_${index}_idNumber`] = `Must be ${selectedId.maxLength} characters`; isValid = false;
        }
      }
      if (!detail.idImage) { newErrors[`personal_${index}_idImage`] = "ID proof photo is required"; isValid = false; }
    });

    setErrors(newErrors);
    if (!isValid) {
      // Auto-expand sections with errors and scroll to first
      const errorIndices = new Set();
      Object.keys(newErrors).forEach(key => {
        const match = key.match(/^personal_(\d+)_/);
        if (match) errorIndices.add(parseInt(match[1]));
      });
      setExpandedSections(prev => {
        const next = { ...prev };
        errorIndices.forEach(i => { next[i] = true; });
        return next;
      });
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementById(firstError);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formData = { contactDetails, personalDetails, children: [] };
      if (onSubmit) {
        onSubmit(formData);
      } else if (onNext) {
        onSave && onSave(formData);
        onNext();
      }
    }
  };

  // Render each traveller section
  const renderTravellerSection = (detail, index) => {
    const isExpanded = expandedSections[index] || false;
    const filled = isTravellerFilled(detail);
    const hasErrors = Object.keys(errors).some(k => k.startsWith(`personal_${index}_`));

    // Label for couple category
    let sectionLabel;
    if (category === 'couple') {
      const coupleNum = Math.floor(index / 2) + 1;
      const partnerLabel = detail.type === 'male' ? 'Partner 1' : 'Partner 2';
      sectionLabel = `Couple ${coupleNum} — ${partnerLabel}`;
    } else {
      sectionLabel = `Traveller ${index + 1}`;
    }

    return (
      <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mb-3 transition-all">
        {/* Header - always visible */}
        <button
          type="button"
          onClick={() => toggleSection(index)}
          className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
            isExpanded 
              ? 'bg-gray-50 border-b border-gray-100' 
              : hasErrors 
                ? 'bg-red-50 hover:bg-red-100/60' 
                : filled 
                  ? 'bg-emerald-50 hover:bg-emerald-100/60' 
                  : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                hasErrors ? 'bg-red-50 text-red-600 border border-red-100' : filled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
              {hasErrors ? (
                <AlertCircle className="w-4 h-4" />
              ) : filled ? (
                <Check className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-gray-800">{sectionLabel}</p>
              {/* Summary when collapsed and data is filled */}
              {!isExpanded && filled && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {detail.name} · Age {detail.age}
                </p>
              )}
              {!isExpanded && hasErrors && !filled && (
                <p className="text-xs text-red-500 mt-0.5">
                  Missing required fields
                </p>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-emerald-600' : 'text-gray-400'}`} />
          </motion.div>
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div id={`personal_${index}_name`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={detail.name}
                      onChange={(e) => handlePersonalChange(index, 'name', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`personal_${index}_name`] ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter full name"
                    />
                    {errors[`personal_${index}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`personal_${index}_name`]}</p>}
                  </div>

                  {/* Gender */}
                  {category !== 'couple' && (
                    <div id={`personal_${index}_gender`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                      <Select
                        options={genderOptions}
                        value={detail.gender ? genderOptions.find(g => g.value === (detail.gender?.value || detail.gender)) : null}
                        onChange={(opt) => handlePersonalChange(index, 'gender', opt)}
                        styles={customSelectStyles}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        placeholder="Select gender"
                      />
                      {errors[`personal_${index}_gender`] && <p className="text-red-500 text-xs mt-1">{errors[`personal_${index}_gender`]}</p>}
                    </div>
                  )}

                  {/* Age */}
                  <div id={`personal_${index}_age`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={detail.age}
                      onChange={(e) => handlePersonalChange(index, 'age', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`personal_${index}_age`] ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter age"
                      min="1" max="100"
                    />
                    {errors[`personal_${index}_age`] && <p className="text-red-500 text-xs mt-1">{errors[`personal_${index}_age`]}</p>}
                  </div>

                  {/* Nationality */}
                  <div id={`personal_${index}_nationality`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={detail.nationality}
                      onChange={(e) => handlePersonalChange(index, 'nationality', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`personal_${index}_nationality`] ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter nationality"
                    />
                    {errors[`personal_${index}_nationality`] && <p className="text-red-500 text-xs mt-1">{errors[`personal_${index}_nationality`]}</p>}
                  </div>

                  {/* ID Type */}
                  <div id={`personal_${index}_idType`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Identification <span className="text-red-500">*</span></label>
                    <Select
                      options={idProofOptions}
                      value={detail.idType ? (typeof detail.idType === 'object' ? detail.idType : idProofOptions.find(o => o.value === detail.idType)) : null}
                      onChange={(opt) => handlePersonalChange(index, 'idType', opt)}
                      styles={customSelectStyles}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      placeholder="Select ID proof"
                    />
                    {errors[`personal_${index}_idType`] && <p className="text-red-500 text-xs mt-1">{errors[`personal_${index}_idType`]}</p>}
                  </div>

                  {/* ID Number */}
                  {detail.idType && (
                    <div id={`personal_${index}_idNumber`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={detail.idNumber}
                        onChange={(e) => handlePersonalChange(index, 'idNumber', e.target.value)}
                        className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`personal_${index}_idNumber`] ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder={`Enter ${(detail.idType?.label || detail.idType)} number`}
                        maxLength={idProofOptions.find(opt => opt.value === (detail.idType?.value || detail.idType))?.maxLength}
                      />
                      {errors[`personal_${index}_idNumber`] && <p className="text-red-500 text-xs mt-1">{errors[`personal_${index}_idNumber`]}</p>}
                    </div>
                  )}

                  {/* ID Image Upload */}
                  {detail.idType && (
                    <div className="md:col-span-2" id={`personal_${index}_idImage`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload {detail.idType?.label || detail.idType} image <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors border-gray-300">
                          <div className="flex flex-col items-center justify-center pt-4 pb-3">
                            <Upload className="w-7 h-7 text-gray-400 mb-1" />
                            <p className="text-sm text-gray-500">Click to upload</p>
                            <p className="text-xs text-gray-400">PNG, JPG (MAX. 2MB)</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleIdImageUpload(index, e)} />
                        </label>
                        {detail.idImagePreview && (
                          <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={detail.idImagePreview} alt="ID preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      {errors[`personal_${index}_idImage`] && <p className="text-red-500 text-xs mt-1">{errors[`personal_${index}_idImage`]}</p>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render couple groups or individual travellers
  const renderAllTravellers = () => {
    if (category === 'couple') {
      const coupleGroups = [];
      for (let i = 0; i < personalDetails.length; i += 2) {
        coupleGroups.push({ couple: [personalDetails[i], personalDetails[i + 1]], startIndex: i });
      }
      return coupleGroups.map((group, coupleIdx) => (
        <div key={`couple-group-${coupleIdx}`} className="mb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Couple {coupleIdx + 1}</span>
          </div>
          {group.couple.map((detail, partnerIdx) => (
            detail && renderTravellerSection(detail, group.startIndex + partnerIdx)
          ))}
        </div>
      ));
    }
    return personalDetails.map((detail, index) => renderTravellerSection(detail, index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50/80 border-b border-gray-100 p-4 sm:px-6 sm:py-5 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 rounded-t-xl">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Users className="h-5 w-5 text-gray-500 mr-2.5" />
          Personal Details
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">Please provide accurate information for all travellers.</p>
      </div>

      {/* Contact Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full mr-2.5 text-xs font-bold shadow-sm">1</span>
          Contact Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email" id="email"
                value={contactDetails.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className={`pl-10 w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          {/* Mobile */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel" id="mobile"
                value={contactDetails.mobile}
                onChange={(e) => handleContactChange('mobile', e.target.value)}
                className={`pl-10 w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors.mobile ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="9876543210"
                maxLength="10"
              />
            </div>
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>
        </div>
      </div>

      {/* Traveller Details Section - Accordion based */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
        <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full mr-2.5 text-xs font-bold shadow-sm">2</span>
            {category === 'couple'
              ? `Traveller Details (${numPeople} ${numPeople === 1 ? 'Couple' : 'Couples'} — ${totalTravellers} People)`
              : `Traveller Details (${numPeople} ${numPeople === 1 ? 'Person' : 'People'})`
            }
          </div>
        </h4>
        <p className="text-xs text-gray-500 mb-4 ml-0.5">
          Click on each traveller section to expand and fill in their details. Children above 8 years need their own booking.
        </p>

        <div className="space-y-0">
          {renderAllTravellers()}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm hover:shadow-md group text-sm font-medium"
        >
          Review Journey
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
};

export default PersonalDetails;
