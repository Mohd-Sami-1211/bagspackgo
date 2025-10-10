'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, ChevronDown, Upload,ArrowRight, CheckCircle2 } from 'lucide-react';

const TravelerDetails = ({ 
  count = 1,     
  onNext,
  onSave 
}) => {
  const [contactDetails, setContactDetails] = useState({
    email: '',
    mobile: '',
    emergencyContact: ''
  });

  const [travelerDetails, setTravelerDetails] = useState([]);
  const [errors, setErrors] = useState({});

  const idProofOptions = [
    { value: 'aadhar', label: 'Aadhar Card', maxLength: 12 },
    { value: 'pan', label: 'PAN Card', maxLength: 10 },
    { value: 'passport', label: 'Passport', maxLength: 12 }
  ];

  useEffect(() => {
    const initializeDetails = () => {
      return Array.from({ length: count }, (_, i) => ({
        name: '',
        gender: '',
        age: '',
        nationality: '',
        idType: '',
        idNumber: '',
        idImage: null,
        idImagePreview: '',
        medicalConditions: '',
        bloodGroup: ''
      }));
    };

    setTravelerDetails(initializeDetails());
  }, [count]);

  const handleContactChange = (field, value) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTravelerChange = (index, field, value) => {
    const newDetails = [...travelerDetails];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value
    };
    
    if (field === 'idType') {
      newDetails[index].idNumber = '';
    }
    
    setTravelerDetails(newDetails);
    if (errors[`traveler_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`traveler_${index}_${field}`]: '' }));
    }
  };

  const handleIdImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newDetails = [...travelerDetails];
      newDetails[index].idImage = file;
      newDetails[index].idImagePreview = reader.result;
      setTravelerDetails(newDetails);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

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

    travelerDetails.forEach((detail, index) => {
      if (!detail.name) {
        newErrors[`traveler_${index}_name`] = 'Name is required';
        isValid = false;
      }

      if (!detail.gender) {
        newErrors[`traveler_${index}_gender`] = 'Gender is required';
        isValid = false;
      }

      if (!detail.age) {
        newErrors[`traveler_${index}_age`] = 'Age is required';
        isValid = false;
      } else if (isNaN(detail.age) || detail.age < 1 || detail.age > 100) {
        newErrors[`traveler_${index}_age`] = 'Age must be between 1-100';
        isValid = false;
      }

      if (!detail.nationality) {
        newErrors[`traveler_${index}_nationality`] = 'Nationality is required';
        isValid = false;
      }

      if (!detail.bloodGroup) {
        newErrors[`traveler_${index}_bloodGroup`] = 'Blood group is required';
        isValid = false;
      }

      if (detail.idType && !detail.idNumber) {
        newErrors[`traveler_${index}_idNumber`] = 'ID number is required';
        isValid = false;
      } else if (detail.idType && detail.idNumber) {
        const selectedId = idProofOptions.find(opt => opt.value === detail.idType);
        if (selectedId && detail.idNumber.length !== selectedId.maxLength) {
          newErrors[`traveler_${index}_idNumber`] = `ID number must be ${selectedId.maxLength} characters`;
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
        travelerDetails
      };
      onSave(formData);
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <User className="h-6 w-6 text-emerald-600 mr-2" />
        Traveler Details
      </h3>
      
      <div className="bg-white/70 rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-7 h-7 flex items-center justify-center bg-white text-emerald-800 rounded-full mr-3">
            1
          </span>
          Contact & Emergency Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

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
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                placeholder="9876543210"
                maxLength="10"
              />
            </div>
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="emergencyContact"
                value={contactDetails.emergencyContact}
                onChange={(e) => handleContactChange('emergencyContact', e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                placeholder="Emergency contact number"
                maxLength="10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Someone we can contact in case of emergency</p>
            {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white/70 rounded-xl shadow-sm border border-gray-200 p-6 ">
        <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-7 h-7 flex items-center justify-center bg-white text-emerald-800 rounded-full mr-3">
            2
          </span>
          Traveler Information
        </h4>

        {travelerDetails.map((traveler, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-5 mb-6 bg-gradient-to-br from-green-50 to-blue-50">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={traveler.name}
                  onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                  placeholder="Enter full name"
                />
                {errors[`traveler_${index}_name`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`traveler_${index}_name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={traveler.gender}
                  onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 appearance-none pr-10"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors[`traveler_${index}_gender`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`traveler_${index}_gender`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={traveler.age}
                  onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                  placeholder="Enter age"
                  min="1"
                  max="100"
                />
                {errors[`traveler_${index}_age`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`traveler_${index}_age`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={traveler.nationality}
                  onChange={(e) => handleTravelerChange(index, 'nationality', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                  placeholder="Enter nationality"
                />
                {errors[`traveler_${index}_nationality`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`traveler_${index}_nationality`]}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof of Identification
                </label>
                <div className="relative">
                  <select
                    value={traveler.idType}
                    onChange={(e) => handleTravelerChange(index, 'idType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 appearance-none pr-10"
                  >
                    <option value="">Select ID proof</option>
                    {idProofOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {traveler.idType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number {traveler.idType && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={traveler.idNumber}
                    onChange={(e) => handleTravelerChange(index, 'idNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                    placeholder={`Enter ${traveler.idType} number`}
                    maxLength={idProofOptions.find(opt => opt.value === traveler.idType)?.maxLength}
                  />
                  {errors[`traveler_${index}_idNumber`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`traveler_${index}_idNumber`]}</p>
                  )}
                </div>
              )}

              {traveler.idType && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload {traveler.idType} image
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
                        onChange={(e) => handleIdImageUpload(index, e)}
                      />
                    </label>
                    {traveler.idImagePreview && (
                      <div className="ml-4 w-24 h-24 border border-gray-200 rounded overflow-hidden">
                        <img 
                          src={traveler.idImagePreview} 
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

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center shadow-lg"
        >
          Save & Continue
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default TravelerDetails;