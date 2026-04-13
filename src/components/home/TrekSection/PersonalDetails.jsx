'use client';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { User, Mail, Phone, ChevronDown, Upload, ArrowLeft, ArrowRight, PersonStanding, BriefcaseMedical, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

/* ── Emerald-themed select styling ── */
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    fontSize: '0.875rem',
    borderColor: state.isFocused ? '#22c55e' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 1px #22c55e' : null,
    '&:hover': { borderColor: state.isFocused ? '#22c55e' : '#cbd5e1' },
    borderRadius: '0.375rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
    padding: '2px'
  }),
  menu: (p) => ({ ...p, zIndex: 50, borderRadius: '0.5rem', overflow: 'hidden', fontSize: '0.875rem' }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  option: (p, state) => ({
    ...p,
    backgroundColor: state.isSelected ? '#a7f3d0' : state.isFocused ? '#d1fae5' : 'white',
    color: state.isSelected ? '#065f46' : '#1f2937',
    padding: '10px 12px',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#6ee7b7' },
  }),
  menuList: (p) => ({ ...p, padding: '4px' }),
};

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const bloodGroupOptions = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
];

const experienceOptions = [
  { value: 'beginner', label: 'Beginner (First time trekker)' },
  { value: 'intermediate', label: 'Intermediate (1-5 treks)' },
  { value: 'experienced', label: 'Experienced (5+ treks)' },
  { value: 'expert', label: 'Expert (High altitude experience)' }
];

const PersonalDetails = ({
  minPeople = 1,
  maxPeople = 1,
  onNext,
  onSave,
  onBack
}) => {
  // The peopleCount is now the exact number, not a range
  // minPeople and maxPeople should be the same (both equal to the selected count)
  const numPeople = Math.max(1, minPeople);

  const { user } = useAuth();
  // Contact details state
  const [contactDetails, setContactDetails] = useState({
    email: user?.email || '',
    mobile: user?.phone || '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (user && (!contactDetails.email || !contactDetails.mobile)) {
        setContactDetails(prev => ({
            ...prev,
            email: prev.email || user.email || "",
            mobile: prev.mobile || user.phone || ""
        }));
    }
  }, [user]);

  // Trekker details state
  const [trekkerDetails, setTrekkerDetails] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [errors, setErrors] = useState({});

  // ID proof options
  const idProofOptions = [
    { value: 'aadhar', label: 'Aadhar Card', maxLength: 12 },
    { value: 'pan', label: 'PAN Card', maxLength: 10 },
    { value: 'voter', label: 'Voter ID', maxLength: 10 },
    { value: 'passport', label: 'Passport', maxLength: 12 },
    { value: 'dl', label: 'Driving License', maxLength: 15 }
  ];

  // Initialize trekker details based on exact count
  useEffect(() => {
    const initializeDetails = () => {
      let loadedFromSession = false;
      let initialData = [];

      try {
        const saved = localStorage.getItem("temp_trek_personal_details");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.numPeople === numPeople) {
            if (parsed.contactDetails) setContactDetails(parsed.contactDetails);
            if (parsed.trekkerDetails && parsed.trekkerDetails.length === numPeople) {
              initialData = parsed.trekkerDetails;
              loadedFromSession = true;
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse temporary trek booking data", e);
      }

      if (!loadedFromSession) {
        initialData = Array.from({ length: numPeople }, (_, i) => ({
          name: '',
          gender: '',
          age: '',
          nationality: '',
          idType: '',
          idNumber: '',
          idImage: null,
          idImagePreview: '',
          medicalConditions: '',
          trekkingExperience: '',
          bloodGroup: ''
        }));
      }
      return initialData;
    };

    setTrekkerDetails(initializeDetails());
    // Expand first section by default
    setExpandedSections({ 0: true });
  }, [numPeople]);

  // Persist form data temporarily on change
  useEffect(() => {
    const hasAnyData = contactDetails.email || contactDetails.mobile || contactDetails.emergencyContact || trekkerDetails.some(t => t.name || t.age || t.idNumber);
    if (hasAnyData) {
      const safeTrekkerDetails = trekkerDetails.map(t => ({
        ...t,
        idImage: null,
        idImagePreview: ''
      }));
      localStorage.setItem("temp_trek_personal_details", JSON.stringify({
        numPeople, contactDetails, trekkerDetails: safeTrekkerDetails
      }));
    }
  }, [contactDetails, trekkerDetails, numPeople]);

  const handleContactChange = (field, value) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTrekkerChange = (index, field, value) => {
    const newDetails = [...trekkerDetails];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value
    };

    if (field === 'idType') {
      newDetails[index].idNumber = '';
    }

    setTrekkerDetails(newDetails);
    if (errors[`trekker_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`trekker_${index}_${field}`]: '' }));
    }
  };

  const handleIdImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newDetails = [...trekkerDetails];
      newDetails[index].idImage = file;
      newDetails[index].idImagePreview = reader.result;
      setTrekkerDetails(newDetails);
    };
    reader.readAsDataURL(file);
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const isTrekkerFilled = (trekker) => {
    return trekker.name && trekker.age;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate contact details
    if (!contactDetails.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(contactDetails.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!contactDetails.mobile) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(contactDetails.mobile)) {
      newErrors.mobile = 'Invalid mobile number (10 digits required)';
      isValid = false;
    }

    if (!contactDetails.emergencyContact) {
      newErrors.emergencyContact = 'Emergency contact is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(contactDetails.emergencyContact)) {
      newErrors.emergencyContact = 'Invalid contact number (10 digits required)';
      isValid = false;
    }

    // Validate trekker details
    trekkerDetails.forEach((detail, index) => {
      if (!detail.name) {
        newErrors[`trekker_${index}_name`] = 'Name is required';
        isValid = false;
      }

      if (!detail.gender) {
        newErrors[`trekker_${index}_gender`] = 'Gender is required';
        isValid = false;
      }

      if (!detail.age) {
        newErrors[`trekker_${index}_age`] = 'Age is required';
        isValid = false;
      } else if (isNaN(detail.age) || detail.age < 12) {
        newErrors[`trekker_${index}_age`] = 'Age must be at least 12 for trekking';
        isValid = false;
      }

      if (!detail.nationality) {
        newErrors[`trekker_${index}_nationality`] = 'Nationality is required';
        isValid = false;
      }

      if (!detail.bloodGroup) {
        newErrors[`trekker_${index}_bloodGroup`] = 'Blood group is required';
        isValid = false;
      }

      if (!detail.idType) {
        newErrors[`trekker_${index}_idType`] = 'ID Proof is required';
        isValid = false;
      } else if (!detail.idNumber) {
        newErrors[`trekker_${index}_idNumber`] = 'ID number is required';
        isValid = false;
      } else {
        const selectedIdTypeVal = detail.idType?.value || detail.idType;
        const selectedId = idProofOptions.find(opt => opt.value === selectedIdTypeVal);
        if (selectedId && detail.idNumber.length !== selectedId.maxLength) {
          newErrors[`trekker_${index}_idNumber`] = `ID number must be ${selectedId.maxLength} characters`;
          isValid = false;
        }
      }
      
      if (!detail.idImage) {
        newErrors[`trekker_${index}_idImage`] = 'ID proof photo is required';
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      // Auto-expand sections with errors
      const errorIndices = new Set();
      Object.keys(newErrors).forEach(key => {
        const match = key.match(/^trekker_(\d+)_/);
        if (match) errorIndices.add(parseInt(match[1]));
      });
      setExpandedSections(prev => {
        const next = { ...prev };
        errorIndices.forEach(i => { next[i] = true; });
        return next;
      });
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formData = {
        contactDetails,
        personalDetails: trekkerDetails
      };
      onSave(formData);
      onNext();
    }
  };

  // Render individual trekker accordion section
  const renderTrekkerSection = (trekker, index) => {
    const isExpanded = expandedSections[index] || false;
    const filled = isTrekkerFilled(trekker);
    const hasErrors = Object.keys(errors).some(k => k.startsWith(`trekker_${index}_`));

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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              hasErrors ? 'bg-red-100 text-red-600' : filled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
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
              <p className="text-sm font-semibold text-gray-800">Trekker {index + 1}</p>
              {/* Summary when collapsed and data is filled */}
              {!isExpanded && filled && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {trekker.name} · Age {trekker.age}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trekker.name}
                      onChange={(e) => handleTrekkerChange(index, 'name', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`trekker_${index}_name`] ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter full name"
                    />
                    {errors[`trekker_${index}_name`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`trekker_${index}_name`]}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={genderOptions}
                      value={trekker.gender ? genderOptions.find(g => g.value === (trekker.gender?.value || trekker.gender)) : null}
                      onChange={(opt) => handleTrekkerChange(index, 'gender', opt?.value)}
                      styles={customSelectStyles}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      placeholder="Select gender"
                    />
                    {errors[`trekker_${index}_gender`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`trekker_${index}_gender`]}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={trekker.age}
                      onChange={(e) => handleTrekkerChange(index, 'age', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`trekker_${index}_age`] ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter age"
                      min="12"
                    />
                    {errors[`trekker_${index}_age`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`trekker_${index}_age`]}</p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trekker.nationality}
                      onChange={(e) => handleTrekkerChange(index, 'nationality', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`trekker_${index}_nationality`] ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter nationality"
                    />
                    {errors[`trekker_${index}_nationality`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`trekker_${index}_nationality`]}</p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={bloodGroupOptions}
                      value={trekker.bloodGroup ? bloodGroupOptions.find(bg => bg.value === (trekker.bloodGroup?.value || trekker.bloodGroup)) : null}
                      onChange={(opt) => handleTrekkerChange(index, 'bloodGroup', opt?.value)}
                      styles={customSelectStyles}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      placeholder="Select blood group"
                    />
                    {errors[`trekker_${index}_bloodGroup`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`trekker_${index}_bloodGroup`]}</p>
                    )}
                  </div>

                  {/* Trekking Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trekking Experience
                    </label>
                    <Select
                      options={experienceOptions}
                      value={trekker.trekkingExperience ? experienceOptions.find(e => e.value === (trekker.trekkingExperience?.value || trekker.trekkingExperience)) : null}
                      onChange={(opt) => handleTrekkerChange(index, 'trekkingExperience', opt?.value)}
                      styles={customSelectStyles}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      placeholder="Select experience level"
                    />
                  </div>

                  {/* Medical Conditions */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Conditions/Allergies
                    </label>
                    <textarea
                      value={trekker.medicalConditions}
                      onChange={(e) => handleTrekkerChange(index, 'medicalConditions', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm"
                      placeholder="Any medical conditions, allergies, or medications we should know about"
                      rows="2"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">This information helps us ensure your safety during the trek</p>
                  </div>

                  {/* ID Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proof of Identification <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={idProofOptions}
                      value={trekker.idType ? (typeof trekker.idType === 'object' ? trekker.idType : idProofOptions.find(o => o.value === trekker.idType)) : null}
                      onChange={(opt) => handleTrekkerChange(index, 'idType', opt?.value)}
                      styles={customSelectStyles}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      placeholder="Select ID proof"
                    />
                    {errors[`trekker_${index}_idType`] && <p className="text-red-500 text-xs mt-1">{errors[`trekker_${index}_idType`]}</p>}
                  </div>

                  {/* ID Number */}
                  {trekker.idType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={trekker.idNumber}
                        onChange={(e) => handleTrekkerChange(index, 'idNumber', e.target.value)}
                        className={`w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors[`trekker_${index}_idNumber`] ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder={`Enter ${(trekker.idType?.label || idProofOptions.find(o => o.value === trekker.idType)?.label || 'ID')} number`}
                        maxLength={idProofOptions.find(opt => opt.value === (trekker.idType?.value || trekker.idType))?.maxLength}
                      />
                      {errors[`trekker_${index}_idNumber`] && <p className="text-red-500 text-xs mt-1">{errors[`trekker_${index}_idNumber`]}</p>}
                    </div>
                  )}

                  {/* ID Image Upload */}
                  {trekker.idType && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Image <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-4 pb-3">
                            <Upload className="w-7 h-7 text-gray-400 mb-1" />
                            <p className="text-sm text-gray-500">Click to upload</p>
                            <p className="text-xs text-gray-400">PNG, JPG (MAX. 2MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleIdImageUpload(index, e)}
                          />
                        </label>
                        {trekker.idImagePreview && (
                          <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={trekker.idImagePreview}
                              alt="ID preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50/80 border-b border-gray-100 p-4 sm:px-6 sm:py-5 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 rounded-t-xl">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <PersonStanding className="h-5 w-5 text-gray-500 mr-2.5" />
          Trekker Information
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">Please provide accurate information for all trekkers.</p>
      </div>

      {/* Contact Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full mr-2.5 text-xs font-bold shadow-sm">
            1
          </span>
          Contact & Emergency Information
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
                type="email"
                id="email"
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
                type="tel"
                id="mobile"
                value={contactDetails.mobile}
                onChange={(e) => handleContactChange('mobile', e.target.value)}
                className={`pl-10 w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors.mobile ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="9876543210"
                maxLength="10"
              />
            </div>
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>

          {/* Emergency Contact */}
          <div className="md:col-span-2">
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BriefcaseMedical className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                id="emergencyContact"
                value={contactDetails.emergencyContact}
                onChange={(e) => handleContactChange('emergencyContact', e.target.value)}
                className={`pl-10 w-full p-2.5 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 text-sm ${errors.emergencyContact ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Emergency contact number"
                maxLength="10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Someone we can contact in case of emergency</p>
            {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
          </div>
        </div>
      </div>

      {/* Trekker Details Section - Accordion based */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
        <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full mr-2.5 text-xs font-bold shadow-sm">
            2
          </span>
          Trekker Information ({numPeople} {numPeople === 1 ? 'Person' : 'People'})
        </h4>
        <p className="text-xs text-gray-500 mb-4 ml-0.5">
          Click on each trekker section to expand and fill in their details.
        </p>

        <div className="space-y-0">
          {trekkerDetails.map((trekker, index) => renderTrekkerSection(trekker, index))}
        </div>
      </div>

      <div className="flex justify-between pt-4 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all flex items-center text-sm font-medium shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all flex items-center shadow-sm hover:shadow-md group text-sm font-semibold active:scale-[0.98]"
        >
          Review Trek
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
};

export default PersonalDetails;