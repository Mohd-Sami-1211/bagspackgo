'use client';

export default function CustomFormInput({ 
  label, 
  id, 
  error, 
  registration, 
  required, 
  placeholder,
  type = "text",
  className = "",
  ...props 
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        {...props}
        className={`w-full p-2.5 h-10 border rounded-xl text-sm font-medium transition-all outline-none ${
          error 
            ? 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-500' 
            : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
        }`}
      />
      
      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-wide">
          {"\u26A0"} {error.message}
        </p>
      )}
    </div>
  );
}