'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while checking session
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalOptions, setAuthModalOptions] = useState({ closable: true });
    const router = useRouter();

    const openAuthModal = useCallback((options = { closable: true }) => {
        setAuthModalOptions(options);
        setIsAuthModalOpen(true);
    }, []);
    const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

    // Check if user is authenticated (called on app load)
    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();

            if (data.success && data.authenticated) {
                setUser(data.user);
                localStorage.setItem('has_session', 'true');
            } else {
                setUser(null);
                localStorage.removeItem('has_session');
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check auth on mount
    useEffect(() => {
        if (!localStorage.getItem('has_session')) {
            setLoading(false); // First time visitors shouldn't wait for auth response
        }
        checkAuth();
    }, [checkAuth]);

    // Logout function
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            // Clear any localStorage data
            localStorage.removeItem('role');
            localStorage.removeItem('user');
            localStorage.removeItem('has_session');
            window.location.href = '/';
        }
    };

    // Update user after login (called from sign-in page)
    const onLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('has_session', 'true');
    };

    return (
        <AuthContext.Provider
            value={{
                user,         // Current user object or null (includes applicationStatus for providers)
                loading,      // True while checking session
                isAuthenticated: !!user,
                applicationStatus: user?.applicationStatus || null,
                logout,       // Call this to log out
                onLogin,      // Call this after successful login
                checkAuth,    // Re-check auth (useful after token refresh or status change)
                isAuthModalOpen,
                authModalOptions,
                openAuthModal,
                closeAuthModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth state anywhere in the app
 * Usage: const { user, isAuthenticated, logout } = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
