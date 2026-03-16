'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({ notifications: 0, applications: 0, requests: 0, support: 0 });
    const router = useRouter();

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/auth/me');
            const data = await res.json();
            if (data.authenticated) {
                setAdmin(data.admin);
            } else if (data.needsSetup) {
                router.replace('/admin/setup');
            } else {
                router.replace('/admin/login');
            }
        } catch {
            router.replace('/admin/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    const fetchUnreadCounts = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/notifications/counts');
            if (res.ok) {
                const data = await res.json();
                setUnreadCounts(data.counts || {});
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (admin) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 30000); // poll every 30s
            return () => clearInterval(interval);
        }
    }, [admin, fetchUnreadCounts]);

    const logout = async () => {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        setAdmin(null);
        router.replace('/admin/login');
    };

    return (
        <AdminContext.Provider value={{ admin, loading, sidebarOpen, setSidebarOpen, unreadCounts, fetchUnreadCounts, logout, checkAuth }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
    return ctx;
}
