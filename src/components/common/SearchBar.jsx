'use client';
// src/components/home/EventSection/SearchBar.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DEBOUNCE_MS = 400;

const SearchBar = ({ onSearch, initialValue = '', placeholder, className = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (initialValue === '') {
      setInputValue('');
    }
  }, [initialValue]);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, DEBOUNCE_MS);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    clearTimeout(debounceRef.current);
    setInputValue('');
    onSearch('');
  }, [onSearch]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Input
        type="text"
        placeholder={placeholder ?? 'Search events, organizers, destinations...'}
        className="w-full rounded-full pl-4 pr-10"
        value={inputValue}
        onChange={handleChange}
      />

      {inputValue && (
        <X
          className="absolute right-8 top-1/2 -translate-y-1/2 text-neutral-400 cursor-pointer hover:text-neutral-600"
          size={18}
          onClick={handleClear}
        />
      )}

      <Search
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        size={18}
      />
    </div>
  );
};

export default SearchBar;