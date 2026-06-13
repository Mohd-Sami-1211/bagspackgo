'use client';

import { useController } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, X } from 'lucide-react';

export default function CustomFormSelect({ control, name, rules, options, placeholder, label }) {
  const {
    field: { onChange, value },
    fieldState: { error }
  } = useController({ name, control, rules });

  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (e) => {
    e.stopPropagation(); // prevent dropdown from opening
    onChange('');
  };

  return (
    <div className="relative z-50 w-full" ref={selectRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 h-10 border rounded-xl text-left flex items-center justify-between transition-all bg-gray-50 text-sm outline-none font-medium
          ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
          ${isOpen && !error ? 'border-emerald-500 ring-2 ring-emerald-500 bg-white' : ''} 
          ${!isOpen && !error ? 'border-gray-200 hover:border-emerald-500' : ''} 
          ${value ? 'text-gray-900 bg-white' : 'text-gray-400'}`}
      >
        <span className="truncate">
          {value ? options.find(o => o.value === value)?.label : placeholder}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Clear button — only shown when a value is selected */}
          {value && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-500' : ''}`}
          />
        </div>
      </button>

      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-wide">
          ⚠ {error.message}
        </p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-[100] w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-1 max-h-48 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition-all flex items-center justify-between rounded-lg my-0.5 
                  ${value === opt.value
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'hover:bg-gray-50 text-gray-700 font-medium'
                  }`}
              >
                {opt.label}
                {value === opt.value && <CheckCircle size={14} className="text-emerald-600" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}