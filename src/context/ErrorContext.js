'use client';
import { createContext, useContext, useState , useEffect } from 'react';
import ErrorPage from "@/components/ui/ErrorPage";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  const [onRetryFn, setOnRetryFn] = useState(null);

  useEffect(() => {
    const handleOffline = () => setError('You are offline.');
    const handleOnline  = () => setError(null);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online',  handleOnline);
    };
  }, []);

  if (error) return (
    <ErrorPage
      message={error}
      onRetry={() => {
        setError(null);
        onRetryFn?.();
      }}
    />
  );

  return (
    <ErrorContext.Provider value={{ setError, setOnRetry: setOnRetryFn }}>
      {children}
    </ErrorContext.Provider>
  );
}

export const useError = () => useContext(ErrorContext);