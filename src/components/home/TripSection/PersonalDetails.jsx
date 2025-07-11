'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, ChevronDown, Plus, Minus, Image, Upload, ArrowLeft, ArrowRight } from 'lucide-react';

const PersonalDetails = ({ 
  category = 'individual',
  count = 1,     
  onNext,
  onSave 
}) => {
  // Contact details state
  const [contactDetails, setContactDetails] = useState({
    email: '',
    mobile: '',
  });

  // Personal details state
  const [personalDetails, setPersonalDetails] = useState([]);
  const [children, setChildren] = useState([]);
  const [childCount, setChildCount] = useState(0);
  const [errors, setErrors] = useState({});

  // ID proof options
  const idProofOptions = [
    { value: 'aadhar', label: 'Aadhar Card', maxLength: 12 },
    { value: 'pan', label: 'PAN Card', maxLength: 10 },
    { value: 'voter', label: 'Voter ID', maxLength: 10 },
    { value: 'passport', label: 'Passport', maxLength: 12 },
    { value: 'dl', label: 'Driving License', maxLength: 15 }
  ];

  // Initialize personal details based on category and count
  useEffect(() => {
    const initializeDetails = () => {
      if (category === 'couple') {
        return Array.from({ length: count }, (_, i) => [
          { 
            type: 'male',
            coupleId: i,
            name: '',
            gender: 'male',
            age: '',
            nationality: '',
            idType: '',
            idNumber: '',
            idImage: null,
            idImagePreview: ''
          },
          { 
            type: 'female',
            coupleId: i,
            name: '',
            gender: 'female',
            age: '',
            nationality: '',
            idType: '',
            idNumber: '',
            idImage: null,
            idImagePreview: ''
          }
        ]).flat();
      } else {
        return Array.from({ length: count }, (_, i) => ({
          type: 'individual',
          name: '',
          gender: '',
          age: '',
          nationality: '',
          idType: '',
          idNumber: '',
          idImage: null,
          idImagePreview: ''
        }));
      }
    };

    setPersonalDetails(initializeDetails());
    setChildren([]);
    setChildCount(0);
  }, [category, count]);

  const handleContactChange = (field, value) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePersonalChange = (index, field, value) => {
    const newDetails = [...personalDetails];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value
    };
    
    if (field === 'idType') {
      newDetails[index].idNumber = '';
    }
    
    setPersonalDetails(newDetails);
    if (errors[`personal_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`personal_${index}_${field}`]: '' }));
    }
  };

  const handleChildChange = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index] = {
      ...newChildren[index],
      [field]: value
    };
    
    if (field === 'idType') {
      newChildren[index].idNumber = '';
    }
    
    setChildren(newChildren);
    if (errors[`child_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`child_${index}_${field}`]: '' }));
    }
  };

  const handleIdImageUpload = (type, index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'personal') {
        const newDetails = [...personalDetails];
        newDetails[index].idImage = file;
        newDetails[index].idImagePreview = reader.result;
        setPersonalDetails(newDetails);
      } else {
        const newChildren = [...children];
        newChildren[index].idImage = file;
        newChildren[index].idImagePreview = reader.result;
        setChildren(newChildren);
      }
    };
    reader.readAsDataURL(file);
  };

  const addChild = () => {
    setChildren([...children, {
      name: '',
      gender: '',
      age: '',
      idType: '',
      idNumber: '',
      idImage: null,
      idImagePreview: ''
    }]);
    setChildCount(childCount + 1);
  };

  const removeChild = (index) => {
    const newChildren = [...children];
    newChildren.splice(index, 1);
    setChildren(newChildren);
    setChildCount(childCount - 1);
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

    // Validate personal details
    personalDetails.forEach((detail, index) => {
      if (!detail.name) {
        newErrors[`personal_${index}_name`] = 'Name is required';
        isValid = false;
      }

      if (!detail.age) {
        newErrors[`personal_${index}_age`] = 'Age is required';
        isValid = false;
      } else if (isNaN(detail.age) || detail.age < 1 || detail.age > 120) {
        newErrors[`personal_${index}_age`] = 'Invalid age';
        isValid = false;
      }

      if (!detail.nationality) {
        newErrors[`personal_${index}_nationality`] = 'Nationality is required';
        isValid = false;
      }

      if (detail.idType && !detail.idNumber) {
        newErrors[`personal_${index}_idNumber`] = 'ID number is required';
        isValid = false;
      } else if (detail.idType && detail.idNumber) {
        const selectedId = idProofOptions.find(opt => opt.value === detail.idType);
        if (selectedId && detail.idNumber.length !== selectedId.maxLength) {
          newErrors[`personal_${index}_idNumber`] = `ID number must be ${selectedId.maxLength} characters`;
          isValid = false;
        }
      }
    });

    // Validate children details
    children.forEach((child, index) => {
      if (!child.name) {
        newErrors[`child_${index}_name`] = 'Name is required';
        isValid = false;
      }

      if (!child.age) {
        newErrors[`child_${index}_age`] = 'Age is required';
        isValid = false;
      } else if (isNaN(child.age) || child.age < 1 || child.age > 18) {
        newErrors[`child_${index}_age`] = 'Invalid age (1-18)';
        isValid = false;
      }

      if (child.idType && !child.idNumber) {
        newErrors[`child_${index}_idNumber`] = 'ID number is required';
        isValid = false;
      } else if (child.idType && child.idNumber) {
        const selectedId = idProofOptions.find(opt => opt.value === child.idType);
        if (selectedId && child.idNumber.length !== selectedId.maxLength) {
          newErrors[`child_${index}_idNumber`] = `ID number must be ${selectedId.maxLength} characters`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formData = {
        contactDetails,
        personalDetails,
        children
      };
      onSave(formData);
      onNext();
    }
  };

  const renderPersonalDetails = () => {
    if (category === 'couple') {
      const coupleGroups = [];
      for (let i = 0; i < personalDetails.length; i += 2) {
        coupleGroups.push(personalDetails.slice(i, i + 2));
      }

      return coupleGroups.map((couple, coupleIndex) => (
        <div key={`couple-${coupleIndex}`} className="border border-gray-200 rounded-lg p-5 mb-6 bg-white ">
          <h5 className="text-md font-medium text-gray-700 mb-4">
            Couple {coupleIndex + 1}
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {couple.map((person, personIndex) => (
              <div key={`person-${coupleIndex}-${personIndex}`} className="space-y-4">
                <h6 className="text-sm font-medium text-gray-600 flex items-center">
                  <User className="h-4 w-4 text-green-600 mr-2" />
                  {person.type === 'male' ? 'Male' : 'Female'} Traveler
                </h6>
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => handlePersonalChange(coupleIndex * 2 + personIndex, 'name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                    placeholder="Enter full name"
                  />
                  {errors[`personal_${coupleIndex * 2 + personIndex}_name`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`personal_${coupleIndex * 2 + personIndex}_name`]}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={person.age}
                    onChange={(e) => handlePersonalChange(coupleIndex * 2 + personIndex, 'age', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                    placeholder="Enter age"
                    min="1"
                    max="120"
                  />
                  {errors[`personal_${coupleIndex * 2 + personIndex}_age`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`personal_${coupleIndex * 2 + personIndex}_age`]}</p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={person.nationality}
                    onChange={(e) => handlePersonalChange(coupleIndex * 2 + personIndex, 'nationality', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                    placeholder="Enter nationality"
                  />
                  {errors[`personal_${coupleIndex * 2 + personIndex}_nationality`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`personal_${coupleIndex * 2 + personIndex}_nationality`]}</p>
                  )}
                </div>

                {/* ID Proof Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof of Identification
                  </label>
                  <div className="relative">
                    <select
                      value={person.idType}
                      onChange={(e) => handlePersonalChange(coupleIndex * 2 + personIndex, 'idType', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                    >
                      <option value="">Select ID proof</option>
                      {idProofOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* ID Number */}
                {person.idType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number {person.idType && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={person.idNumber}
                      onChange={(e) => handlePersonalChange(coupleIndex * 2 + personIndex, 'idNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                      placeholder={`Enter ${person.idType} number`}
                      maxLength={idProofOptions.find(opt => opt.value === person.idType)?.maxLength}
                    />
                    {errors[`personal_${coupleIndex * 2 + personIndex}_idNumber`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`personal_${coupleIndex * 2 + personIndex}_idNumber`]}</p>
                    )}
                  </div>
                )}

                {/* ID Image Upload */}
                {person.idType && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload {person.idType} image
                    </label>
                    <div className="flex items-center">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">Click to upload</p>
                          <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleIdImageUpload('personal', coupleIndex * 2 + personIndex, e)}
                        />
                      </label>
                      {person.idImagePreview && (
                        <div className="ml-4 w-24 h-24 border border-gray-200 rounded overflow-hidden">
                          <img 
                            src={person.idImagePreview} 
                            alt="ID preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ));
    } else {
      return personalDetails.map((detail, index) => (
        <div key={`individual-${index}`} className="border border-gray-200 rounded-lg p-5 mb-6 bg-white">
          <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <User className="h-5 w-5 text-green-600 mr-2" />
            Traveler {index + 1}
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={detail.name}
                onChange={(e) => handlePersonalChange(index, 'name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                placeholder="Enter full name"
              />
              {errors[`personal_${index}_name`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`personal_${index}_name`]}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={detail.gender}
                onChange={(e) => handlePersonalChange(index, 'gender', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors[`personal_${index}_gender`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`personal_${index}_gender`]}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={detail.age}
                onChange={(e) => handlePersonalChange(index, 'age', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                placeholder="Enter age"
                min="1"
                max="120"
              />
              {errors[`personal_${index}_age`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`personal_${index}_age`]}</p>
              )}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={detail.nationality}
                onChange={(e) => handlePersonalChange(index, 'nationality', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                placeholder="Enter nationality"
              />
              {errors[`personal_${index}_nationality`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`personal_${index}_nationality`]}</p>
              )}
            </div>

            {/* ID Proof Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proof of Identification
              </label>
              <div className="relative">
                <select
                  value={detail.idType}
                  onChange={(e) => handlePersonalChange(index, 'idType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                >
                  <option value="">Select ID proof</option>
                  {idProofOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* ID Number */}
            {detail.idType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number {detail.idType && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={detail.idNumber}
                  onChange={(e) => handlePersonalChange(index, 'idNumber', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                  placeholder={`Enter ${detail.idType} number`}
                  maxLength={idProofOptions.find(opt => opt.value === detail.idType)?.maxLength}
                />
                {errors[`personal_${index}_idNumber`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`personal_${index}_idNumber`]}</p>
                )}
              </div>
            )}

            {/* ID Image Upload */}
            {detail.idType && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload {detail.idType} image
                </label>
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleIdImageUpload('personal', index, e)}
                    />
                  </label>
                  {detail.idImagePreview && (
                    <div className="ml-4 w-24 h-24 border border-gray-200 rounded overflow-hidden">
                      <img 
                        src={detail.idImagePreview} 
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
      ));
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Personal Details</h3>
      
      {/* Contact Details Section */}
      <div className="bg-green-100 rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-7 h-7 flex items-center justify-center bg-white text-green-800 rounded-full mr-3">
            1
          </span>
          Contact Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={contactDetails.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="mobile"
                value={contactDetails.mobile}
                onChange={(e) => handleContactChange('mobile', e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                placeholder="9876543210"
                maxLength="10"
              />
            </div>
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="bg-green-100 rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-7 h-7 flex items-center justify-center bg-white text-green-800 rounded-full mr-3">
            2
          </span>
          {category === 'couple' ? `${count} ${count === 1 ? 'Couple' : 'Couples'}` : 'Traveler Details'}
        </h4>

        {renderPersonalDetails()}
      </div>

      {/* Children Section */}
      <div className="bg-green-100 rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="w-7 h-7 flex items-center justify-center bg-white text-green-800 rounded-full mr-3">
              3
            </span>
            Children Details (If Any)
          </h4>
          <button
            type="button"
            onClick={addChild}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Child
          </button>
        </div>

        {children.length > 0 && (
          <div className="space-y-6">
            {children.map((child, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 relative bg-white">
                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="absolute top-3 right-5 p-1 text-sm text-gray-500 hover:text-white hover:bg-red-500  rounded-xl"
                >
                  Remove
                  
                </button>

                <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <User className="h-5 w-5 text-green-600 mr-2" />
                  Child {index + 1}
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                      placeholder="Enter child's name"
                    />
                    {errors[`child_${index}_name`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`child_${index}_name`]}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={child.gender}
                      onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors[`child_${index}_gender`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`child_${index}_gender`]}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={child.age}
                      onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                      placeholder="Enter age"
                      min="1"
                      max="18"
                    />
                    {errors[`child_${index}_age`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`child_${index}_age`]}</p>
                    )}
                  </div>

                  {/* ID Proof Type (Optional for children) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proof of Identification (Optional)
                    </label>
                    <div className="relative">
                      <select
                        value={child.idType}
                        onChange={(e) => handleChildChange(index, 'idType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                      >
                        <option value="">Select ID proof</option>
                        {idProofOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* ID Number (if ID type selected) */}
                  {child.idType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={child.idNumber}
                        onChange={(e) => handleChildChange(index, 'idNumber', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                        placeholder={`Enter ${child.idType} number`}
                        maxLength={idProofOptions.find(opt => opt.value === child.idType)?.maxLength}
                      />
                      {errors[`child_${index}_idNumber`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`child_${index}_idNumber`]}</p>
                      )}
                    </div>
                  )}

                  {/* ID Image Upload (if ID type selected) */}
                  {child.idType && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload {child.idType} image
                      </label>
                      <div className="flex items-center">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">Click to upload</p>
                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleIdImageUpload('child', index, e)}
                          />
                        </label>
                        {child.idImagePreview && (
                          <div className="ml-4 w-24 h-24 border border-gray-200 rounded overflow-hidden">
                            <img 
                              src={child.idImagePreview} 
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
            ))}
          </div>
        )}
      </div>

      
    </div>
  );
};

export default PersonalDetails;