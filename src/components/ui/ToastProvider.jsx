'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster 
            position="bottom-right" 
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                },
                success: {
                    style: {
                        background: '#10b981',
                        color: '#ffffff',
                    },
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#10b981',
                    },
                },
                error: {
                    style: {
                        background: '#ef4444',
                        color: '#ffffff',
                    },
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#ef4444',
                    },
                },
            }} 
        />
    );
}