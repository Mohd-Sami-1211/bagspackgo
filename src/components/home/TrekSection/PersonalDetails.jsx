'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, ChevronDown, Plus, Minus, Upload, ArrowLeft, ArrowRight, Mountain,PersonStanding, BriefcaseMedical , Backpack } from 'lucide-react';

const PersonalDetails = ({ 
  count = 1,     
  onNext,
  onSave 
}) => {
  // Contact details state
  const [contactDetails, setContactDetails] = useState({
    email: '',
    mobile: '',
    emergencyContact: ''
  });

  // Trekker details state
  const [trekkerDetails, setTrekkerDetails] = useState([]);
  const [errors, setErrors] = useState({});

  // ID proof options
  const idProofOptions = [
    { value: 'aadhar', label: 'Aadhar Card', maxLength: 12 },
    { value: 'pan', label: 'PAN Card', maxLength: 10 },
    { value: 'passport', label: 'Passport', maxLength: 12 }
  ];

  // Initialize trekker details
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
        trekkingExperience: '',
        bloodGroup: ''
      }));
    };

    setTrekkerDetails(initializeDetails());
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
      } else if (isNaN(detail.age) || detail.age < 12 || detail.age > 70) {
        newErrors[`trekker_${index}_age`] = 'Age must be between 12-70 for trekking';
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

      if (detail.idType && !detail.idNumber) {
        newErrors[`trekker_${index}_idNumber`] = 'ID number is required';
        isValid = false;
      } else if (detail.idType && detail.idNumber) {
        const selectedId = idProofOptions.find(opt => opt.value === detail.idType);
        if (selectedId && detail.idNumber.length !== selectedId.maxLength) {
          newErrors[`trekker_${index}_idNumber`] = `ID number must be ${selectedId.maxLength} characters`;
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
        trekkerDetails
      };
      onSave(formData);
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <PersonStanding className="h-6 w-6 text-green-600 mr-2" />
        Trekker Details
      </h3>
      
      {/* Contact Details Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-7 h-7 flex items-center justify-center bg-white text-green-800 rounded-full mr-3">
            1
          </span>
          Contact & Emergency Information
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

          {/* Emergency Contact */}
          <div className="md:col-span-2">
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BriefcaseMedical className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="emergencyContact"
                value={contactDetails.emergencyContact}
                onChange={(e) => handleContactChange('emergencyContact', e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                placeholder="Emergency contact number"
                maxLength="10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Someone we can contact in case of emergency</p>
            {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
          </div>
        </div>
      </div>

      {/* Trekker Details Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-7 h-7 flex items-center justify-center bg-white text-green-800 rounded-full mr-3">
            2
          </span>
          Trekker Information ({count} {count === 1 ? 'Person' : 'People'})
        </h4>

        {trekkerDetails.map((trekker, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-5 mb-6 bg-white">
            <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
              <User className="h-5 w-5 text-green-600 mr-2" />
              Trekker {index + 1}
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trekker.name}
                  onChange={(e) => handleTrekkerChange(index, 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                  placeholder="Enter full name"
                />
                {errors[`trekker_${index}_name`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`trekker_${index}_name`]}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={trekker.gender}
                  onChange={(e) => handleTrekkerChange(index, 'gender', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors[`trekker_${index}_gender`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`trekker_${index}_gender`]}</p>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                  placeholder="Enter age"
                  min="12"
                  max="70"
                />
                {errors[`trekker_${index}_age`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`trekker_${index}_age`]}</p>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                  placeholder="Enter nationality"
                />
                {errors[`trekker_${index}_nationality`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`trekker_${index}_nationality`]}</p>
                )}
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={trekker.bloodGroup}
                  onChange={(e) => handleTrekkerChange(index, 'bloodGroup', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                {errors[`trekker_${index}_bloodGroup`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`trekker_${index}_bloodGroup`]}</p>
                )}
              </div>

              {/* Trekking Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trekking Experience
                </label>
                <select
                  value={trekker.trekkingExperience}
                  onChange={(e) => handleTrekkerChange(index, 'trekkingExperience', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner (First time trekker)</option>
                  <option value="intermediate">Intermediate (1-5 treks)</option>
                  <option value="experienced">Experienced (5+ treks)</option>
                  <option value="expert">Expert (High altitude experience)</option>
                </select>
              </div>

              {/* Medical Conditions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Conditions/Allergies
                </label>
                <textarea
                  value={trekker.medicalConditions}
                  onChange={(e) => handleTrekkerChange(index, 'medicalConditions', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                  placeholder="Any medical conditions, allergies, or medications we should know about"
                  rows="2"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">This information helps us ensure your safety during the trek</p>
              </div>

              {/* ID Proof Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof of Identification
                </label>
                <div className="relative">
                  <select
                    value={trekker.idType}
                    onChange={(e) => handleTrekkerChange(index, 'idType', e.target.value)}
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
              {trekker.idType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number {trekker.idType && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={trekker.idNumber}
                    onChange={(e) => handleTrekkerChange(index, 'idNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                    placeholder={`Enter ${trekker.idType} number`}
                    maxLength={idProofOptions.find(opt => opt.value === trekker.idType)?.maxLength}
                  />
                  {errors[`trekker_${index}_idNumber`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`trekker_${index}_idNumber`]}</p>
                  )}
                </div>
              )}

              {/* ID Image Upload */}
              {trekker.idType && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload {trekker.idType} image
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
                    {trekker.idImagePreview && (
                      <div className="ml-4 w-24 h-24 border border-gray-200 rounded overflow-hidden">
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
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex justify-between mt-8">
        
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          Save & Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;