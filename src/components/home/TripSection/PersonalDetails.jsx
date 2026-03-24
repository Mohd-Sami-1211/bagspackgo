"use client";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Plus,
  ArrowLeft,
  ArrowRight,
  Upload,
  Info,
  AlertCircle,
  X,
} from "lucide-react";
import Select from "react-select";
import { useSearchParams } from "next/navigation";

// ── Shared react-select styles matching the site theme ──────
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '45px',
    fontSize: '0.875rem',
    fontWeight: 500,
    borderColor: state.isFocused ? '#10b981' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : null,
    '&:hover': { borderColor: state.isFocused ? '#10b981' : '#e5e7eb' },
    borderRadius: '10px',
    backgroundColor: 'white',
    cursor: 'pointer',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    marginTop: '4px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -3px rgba(0,0,0,0.07)',
    border: '1px solid #f0fdf4',
    overflow: 'hidden',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menuList: (provided) => ({ ...provided, padding: '4px', fontSize: '0.875rem' }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '8px',
    backgroundColor: state.isSelected ? '#d1fae5' : state.isFocused ? '#f0fdf4' : 'white',
    color: state.isSelected ? '#065f46' : '#1e293b',
    fontWeight: state.isSelected ? 600 : 400,
    margin: '2px 0',
    padding: '10px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-out',
    '&:active': { backgroundColor: '#a7f3d0', color: '#064e3b' },
  }),
  singleValue: (provided) => ({ ...provided, color: '#1e293b', fontWeight: 500 }),
  placeholder: (provided) => ({ ...provided, color: '#9ca3af', fontSize: '0.875rem' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#10b981' : '#9ca3af',
    '&:hover': { color: '#10b981' },
    padding: '0 8px',
  }),
};

const PersonalDetails = ({
  category = "individual",
  onNext,
  onSave,
  onBack,
  onSubmit,
}) => {
  const searchParams = useSearchParams();
  const countRaw = searchParams.get("count") || "1";
  
  // Parse range from countRaw (e.g. "3-5" or "15+")
  const parseRange = (val) => {
    if (val.includes("-")) {
      const [min, max] = val.split("-").map(v => parseInt(v) || 1);
      return { min, max: max || min };
    }
    if (val.includes("+")) {
      const min = parseInt(val) || 1;
      return { min, max: 50 }; // Hard cap of 50 for "15+" to prevent infinite
    }
    const fixed = parseInt(val) || 1;
    return { min: fixed, max: fixed };
  };

  const { min: minUnits, max: maxUnits } = parseRange(countRaw);

  // Contact details state
  const [contactDetails, setContactDetails] = useState({
    email: "",
    mobile: "",
  });

  // Personal details state
  const [personalDetails, setPersonalDetails] = useState([]);
  const [limitError, setLimitError] = useState("");
  const [errors, setErrors] = useState({});

  // ID proof options
  const idProofOptions = [
    { value: "aadhar", label: "Aadhar Card", maxLength: 12 },
    { value: "pan", label: "PAN Card", maxLength: 10 },
    { value: "voter", label: "Voter ID", maxLength: 10 },
    { value: "passport", label: "Passport", maxLength: 12 },
    { value: "dl", label: "Driving License", maxLength: 15 },
  ];

  // Initialize personal details based on minUnits or sessionStorage
  useEffect(() => {
    const createNewTraveler = (index) => {
      if (category === "couple") {
        return [
          {
            type: "male",
            coupleId: index,
            name: "",
            gender: "male",
            age: "",
            nationality: "",
            idType: null,
            idNumber: "",
            idImage: null,
            idImagePreview: "",
          },
          {
            type: "female",
            coupleId: index,
            name: "",
            gender: "female",
            age: "",
            nationality: "",
            idType: null,
            idNumber: "",
            idImage: null,
            idImagePreview: "",
          },
        ];
      } else {
        return {
          type: "individual",
          name: "",
          gender: null,
          age: "",
          nationality: "",
          idType: null,
          idNumber: "",
          idImage: null,
          idImagePreview: "",
        };
      }
    };

    let loadedFromSession = false;
    try {
      const saved = sessionStorage.getItem("temp_personal_details");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.category === category && parsed.minUnits === minUnits) {
          if (parsed.contactDetails) setContactDetails(parsed.contactDetails);
          if (parsed.personalDetails && parsed.personalDetails.length > 0) {
             setPersonalDetails(parsed.personalDetails);
             loadedFromSession = true;
          }
        }
      }
    } catch(e) {
      console.error("Failed to parse temporary booking data", e);
    }

    if (!loadedFromSession) {
      const initialDetails = Array.from({ length: minUnits }, (_, i) => createNewTraveler(i)).flat();
      setPersonalDetails(initialDetails);
    }
  }, [category, minUnits]);

  // Persist form data temporarily on change
  useEffect(() => {
    const hasAnyData = contactDetails.email || contactDetails.mobile || personalDetails.some(p => p.name || p.age || p.nationality || p.idNumber);
    
    if (hasAnyData) {
      // Exclude File objects and large Data URLs to stay within quota restrictions
      const safePersonalDetails = personalDetails.map(p => {
         const { idImage, idImagePreview, ...rest } = p;
         return rest;
      });
      sessionStorage.setItem("temp_personal_details", JSON.stringify({
         category, minUnits, contactDetails, personalDetails: safePersonalDetails
      }));
      
      const pendingData = localStorage.getItem('pending_booking');
      let parsedPending = pendingData ? JSON.parse(pendingData) : { ignored: false };
      
      if (!parsedPending.ignored) {
         parsedPending = {
            ...parsedPending,
            ignored: false,
            url: window.location.pathname + window.location.search,
            timestamp: Date.now()
         };
         localStorage.setItem('pending_booking', JSON.stringify(parsedPending));
      }
    }
  }, [contactDetails, personalDetails, category, minUnits]);

  const handleContactChange = (field, value) => {
    setContactDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePersonalChange = (index, field, value) => {
    const newDetails = [...personalDetails];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };

    if (field === "idType") {
      newDetails[index].idNumber = "";
    }

    setPersonalDetails(newDetails);
    if (errors[`personal_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`personal_${index}_${field}`]: "" }));
    }
  };

  const handleIdImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newDetails = [...personalDetails];
      newDetails[index].idImage = file;
      newDetails[index].idImagePreview = reader.result;
      setPersonalDetails(newDetails);
    };
    reader.readAsDataURL(file);
  };

  const addTraveler = () => {
    // Current units count
    const currentUnits = category === "couple" ? personalDetails.length / 2 : personalDetails.length;
    
    if (currentUnits < maxUnits) {
      setLimitError("");
      const newIndex = currentUnits;
      let newSection;
      if (category === "couple") {
        newSection = [
          { type: "male", coupleId: newIndex, name: "", gender: "male", age: "", nationality: "", idType: null, idNumber: "", idImage: null, idImagePreview: "" },
          { type: "female", coupleId: newIndex, name: "", gender: "female", age: "", nationality: "", idType: null, idNumber: "", idImage: null, idImagePreview: "" }
        ];
      } else {
        newSection = { type: "individual", name: "", gender: null, age: "", nationality: "", idType: null, idNumber: "", idImage: null, idImagePreview: "" };
      }
      
      setPersonalDetails(prev => Array.isArray(newSection) ? [...prev, ...newSection] : [...prev, newSection]);
    } else {
      setLimitError(`You can add up to ${maxUnits} ${category === "couple" ? "couples" : "travellers"}. To add more, please click 'Modify Search' or adjust your selection.`);
    }
  };

  const removeTravelerSection = (index) => {
    // For couples, we remove the pair
    if (category === "couple") {
      const coupleIndex = personalDetails[index].coupleId;
      const newDetails = personalDetails.filter(p => p.coupleId !== coupleIndex);
      // Re-index remaining couples
      const reindexed = [];
      let nextCoupleId = 0;
      for (let i = 0; i < newDetails.length; i += 2) {
        reindexed.push({ ...newDetails[i], coupleId: nextCoupleId });
        reindexed.push({ ...newDetails[i+1], coupleId: nextCoupleId });
        nextCoupleId++;
      }
      setPersonalDetails(reindexed);
    } else {
      const newDetails = [...personalDetails];
      newDetails.splice(index, 1);
      setPersonalDetails(newDetails);
    }
    setLimitError("");
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!contactDetails.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(contactDetails.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!contactDetails.mobile) {
      newErrors.mobile = "Mobile number is required";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(contactDetails.mobile)) {
      newErrors.mobile = "Invalid mobile number (10 digits required)";
      isValid = false;
    }

    personalDetails.forEach((detail, index) => {
      if (!detail.name) {
        newErrors[`personal_${index}_name`] = "Name is required";
        isValid = false;
      }
      if (!detail.gender && category !== "couple") {
        newErrors[`personal_${index}_gender`] = "Gender is required";
        isValid = false;
      }
      if (!detail.age) {
        newErrors[`personal_${index}_age`] = "Age is required";
        isValid = false;
      }
      if (!detail.nationality) {
        newErrors[`personal_${index}_nationality`] = "Nationality is required";
        isValid = false;
      }
      if (!detail.idType) {
        newErrors[`personal_${index}_idType`] = "ID type is required";
        isValid = false;
      } else if (!detail.idNumber) {
        newErrors[`personal_${index}_idNumber`] = "ID number is required";
        isValid = false;
      } else {
        const selectedId = idProofOptions.find(opt => opt.value === detail.idType.value);
        if (selectedId && detail.idNumber.length !== selectedId.maxLength) {
          newErrors[`personal_${index}_idNumber`] = `Must be ${selectedId.maxLength} characters`;
          isValid = false;
        }
      }
      if (!detail.idImage) {
        newErrors[`personal_${index}_idImage`] = "ID proof photo is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid) {
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementById(firstError);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formData = {
        contactDetails,
        personalDetails,
        children: [], // Children section removed
      };
      if (onSubmit) {
        onSubmit(formData);
      } else if (onNext) {
        onSave && onSave(formData);
        onNext();
      }
    }
  };

  const renderPersonalDetails = () => {
    if (category === "couple") {
      const coupleGroups = [];
      for (let i = 0; i < personalDetails.length; i += 2) {
        coupleGroups.push(personalDetails.slice(i, i + 2));
      }

      return coupleGroups.map((couple, coupleIndex) => (
        <div key={`couple-${coupleIndex}`} className="relative bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 mb-8 shadow-sm hover:shadow-md transition-shadow">
          {coupleIndex >= minUnits && (
            <button
               type="button"
               onClick={() => removeTravelerSection(coupleIndex * 2)}
               className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors z-10"
            >
               <X className="w-4 h-4" />
            </button>
          )}
          <h5 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">{coupleIndex + 1}</span>
            Couple Details
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {couple.map((person, personIndex) => {
              const globalIndex = coupleIndex * 2 + personIndex;
              return (
                <div key={`person-${globalIndex}`} className="space-y-5">
                  <h6 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-500" />
                    {person.type === "male" ? "Male" : "Female"} Traveler
                  </h6>

                  {/* Name */}
                  <div id={`personal_${globalIndex}_name`}>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name*</label>
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => handlePersonalChange(globalIndex, "name", e.target.value)}
                      className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300"
                      placeholder="e.g. John Doe"
                    />
                    {errors[`personal_${globalIndex}_name`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${globalIndex}_name`]}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Age */}
                    <div id={`personal_${globalIndex}_age`}>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Age*</label>
                      <input
                        type="number"
                        value={person.age}
                        onChange={(e) => handlePersonalChange(globalIndex, "age", e.target.value)}
                        className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300"
                        placeholder="e.g. 25"
                      />
                      {errors[`personal_${globalIndex}_age`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${globalIndex}_age`]}</p>}
                    </div>

                    {/* Nationality */}
                    <div id={`personal_${globalIndex}_nationality`}>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nationality*</label>
                      <input
                        type="text"
                        value={person.nationality}
                        onChange={(e) => handlePersonalChange(globalIndex, "nationality", e.target.value)}
                        className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300"
                        placeholder="e.g. Indian"
                      />
                      {errors[`personal_${globalIndex}_nationality`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${globalIndex}_nationality`]}</p>}
                    </div>
                  </div>

                  {/* ID Proof Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">ID Proof (Optional)</label>
                    <Select
                      options={idProofOptions}
                      value={person.idType}
                      onChange={(val) => handlePersonalChange(globalIndex, "idType", val)}
                      placeholder="Select ID type..."
                      styles={selectStyles}
                      isSearchable={false}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>

                  {/* ID Number */}
                  {person.idType && (
                    <div id={`personal_${globalIndex}_idNumber`}>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{person.idType.label} Number*</label>
                      <input
                        type="text"
                        value={person.idNumber}
                        onChange={(e) => handlePersonalChange(globalIndex, "idNumber", e.target.value)}
                        className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300"
                        placeholder={`e.g. ${Array(person.idType.maxLength).fill('0').join('')}`}
                        maxLength={person.idType.maxLength}
                      />
                      {errors[`personal_${globalIndex}_idNumber`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${globalIndex}_idNumber`]}</p>}
                    </div>
                  )}

                  {/* Upload */}
                  {person.idType && (
                    <div className="pt-2">
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Upload {person.idType.label}*</label>
                       <div className="flex items-center gap-4">
                          <label className="flex-1 flex items-center justify-center gap-3 h-14 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-gray-400 hover:text-emerald-600 group">
                             <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                             <span className="text-[12px] font-semibold">Choose File</span>
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleIdImageUpload(globalIndex, e)} />
                          </label>
                          {person.idImagePreview && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-100 shadow-sm shrink-0">
                               <img src={person.idImagePreview} className="w-full h-full object-cover" alt="ID preview" />
                            </div>
                          )}
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ));
    } else {
      return personalDetails.map((detail, index) => (
        <div key={`individual-${index}`} className="relative bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 mb-8 shadow-sm hover:shadow-md transition-shadow">
          {index >= minUnits && (
            <button
               type="button"
               onClick={() => removeTravelerSection(index)}
               className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors z-10"
            >
               <X className="w-4 h-4" />
            </button>
          )}
          <h5 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">{index + 1}</span>
            Traveler Details
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div id={`personal_${index}_name`}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name*</label>
              <input
                type="text"
                value={detail.name}
                onChange={(e) => handlePersonalChange(index, "name", e.target.value)}
                className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300"
                placeholder="e.g. John Doe"
              />
              {errors[`personal_${index}_name`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${index}_name`]}</p>}
            </div>

            <div id={`personal_${index}_gender`}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender*</label>
              <Select
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
                value={detail.gender}
                onChange={(val) => handlePersonalChange(index, "gender", val)}
                placeholder="Select gender..."
                styles={selectStyles}
                isSearchable={false}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
              />
              {errors[`personal_${index}_gender`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${index}_gender`]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div id={`personal_${index}_age`}>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Age*</label>
                <input
                  type="number"
                  value={detail.age}
                  onChange={(e) => handlePersonalChange(index, "age", e.target.value)}
                  className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300"
                  placeholder="e.g. 25"
                />
                {errors[`personal_${index}_age`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${index}_age`]}</p>}
              </div>

              <div id={`personal_${index}_nationality`}>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nationality*</label>
                <input
                  type="text"
                  value={detail.nationality}
                  onChange={(e) => handlePersonalChange(index, "nationality", e.target.value)}
                  className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300"
                  placeholder="e.g. Indian"
                />
                {errors[`personal_${index}_nationality`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${index}_nationality`]}</p>}
              </div>
            </div>

            <div id={`personal_${index}_idType`}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">ID Proof Type*</label>
              <Select
                options={idProofOptions}
                value={detail.idType}
                onChange={(val) => handlePersonalChange(index, "idType", val)}
                placeholder="Select ID type..."
                styles={selectStyles}
                isSearchable={false}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
              />
              {errors[`personal_${index}_idType`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${index}_idType`]}</p>}
            </div>

            <div id={`personal_${index}_idNumber`}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {detail.idType ? `${detail.idType.label} Number*` : 'ID Number*'}
              </label>
              <input
                type="text"
                value={detail.idNumber}
                onChange={(e) => handlePersonalChange(index, "idNumber", e.target.value)}
                disabled={!detail.idType}
                className="w-full h-[45px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-gray-50/50 placeholder:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={detail.idType ? `e.g. ${Array(detail.idType.maxLength).fill('0').join('')}` : 'Select ID type first'}
                maxLength={detail.idType?.maxLength || 20}
              />
              {errors[`personal_${index}_idNumber`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${index}_idNumber`]}</p>}
            </div>

            <div id={`personal_${index}_idImage`} className="pt-1">
               <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                 Upload {detail.idType ? detail.idType.label : 'ID Proof'} Photo*
               </label>
               <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-3 h-14 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-gray-400 hover:text-emerald-600 group">
                     <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                     <span className="text-[12px] font-semibold">{detail.idImagePreview ? 'Change Photo' : 'Choose Photo'}</span>
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleIdImageUpload(index, e)} />
                  </label>
                  {detail.idImagePreview && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-100 shadow-sm shrink-0">
                       <img src={detail.idImagePreview} className="w-full h-full object-cover" alt="ID preview" />
                    </div>
                  )}
               </div>
               {errors[`personal_${index}_idImage`] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[`personal_${index}_idImage`]}</p>}
            </div>
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Policy Message */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Info className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider">Booking Policy</h4>
          <p className="text-[13px] text-amber-700 mt-0.5 leading-relaxed font-medium">
             Compulsory to book package for children above 8 years of age.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 pb-12">
        {/* Step 1: Contact Information */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-200">1</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
              <p className="text-xs text-gray-400 font-medium">Where should we send your booking details?</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div id="email">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Mail className="w-3.5 h-3.5 text-emerald-500" />
                   Email Address*
                </label>
                <input
                  type="email"
                  value={contactDetails.email}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  className="w-full h-[48px] px-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-gray-800 bg-gray-50/30 placeholder:text-gray-300"
                  placeholder="e.g. your@email.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              <div id="mobile">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Phone className="w-3.5 h-3.5 text-emerald-500" />
                   Mobile Number*
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 border-r pr-3">+91</span>
                  <input
                    type="tel"
                    value={contactDetails.mobile}
                    onChange={(e) => handleContactChange("mobile", e.target.value)}
                    className="w-full h-[48px] pl-16 pr-4 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-gray-800 bg-gray-50/30 placeholder:text-gray-300"
                    placeholder="e.g. 9876543210"
                    maxLength="10"
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.mobile}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Traveler Details */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-200">2</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {category === "couple" ? "Couple Travelers" : "Traveler Details"}
                </h3>
                <p className="text-xs text-gray-400 font-medium tracking-tight">
                   Fill in details for {category === "couple" ? "each couple" : "each traveler"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={addTraveler}
                className="group w-full sm:w-auto px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold ring-1 ring-emerald-100 hover:ring-emerald-600 shadow-sm"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                Add {category === "couple" ? "Couple" : "Traveler"}
              </button>
              {limitError && (
                <div className="bg-red-50 p-3 sm:px-4 sm:py-3 rounded-xl border border-red-200 animate-in fade-in slide-in-from-right-2 shadow-sm flex flex-col gap-2.5 max-w-[280px] sm:max-w-sm mt-2 sm:mt-0 relative right-0">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-semibold text-red-800 leading-relaxed text-left">{limitError}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                        window.location.href = '/user/trip/guidelist';
                    }} 
                    className="text-[11px] font-bold bg-white text-red-600 py-1.5 px-4 rounded-lg border border-red-200 hover:bg-red-600 hover:text-white transition-all self-start shadow-sm flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Modify Search
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-0">
            {renderPersonalDetails()}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl text-gray-500 font-bold text-sm hover:bg-gray-100 hover:text-gray-800 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-3.5 bg-green-600 text-white rounded-2xl font-bold text-base hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-200"
          >
            Review Journey
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
