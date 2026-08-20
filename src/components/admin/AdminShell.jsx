'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, UserCheck, FileText, Package,
    CalendarCheck, CreditCard, Headphones, Bell, Settings,
    LogOut, Shield, ChevronRight, Menu, X, ClipboardList, Heart, BarChart3, Activity, Map, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

const navItems = [
    { label: 'Dashboard',     icon: LayoutDashboard, href: '/admin/dashboard',      badge: null },
    { label: 'Analytics',     icon: BarChart3,       href: '/admin/analytics',      badge: null },
    { label: 'Activity',      icon: Activity,        href: '/admin/activity',        badge: null },
    { label: 'Users',         icon: Users,           href: '/admin/users',           badge: null },
    { label: 'Providers',     icon: UserCheck,       href: '/admin/providers',       badge: null },
    { label: 'Applications',  icon: FileText,        href: '/admin/applications',    badge: 'applications' },
    { label: 'Bookings',      icon: CalendarCheck,   href: '/admin/bookings',        badge: null },
    { label: 'Packages',      icon: Package,         href: '/admin/packages',        badge: null },
    { label: 'OffBeats',      icon: Map,             href: '/admin/offbeats',        badge: null },
    { label: 'Requests',      icon: ClipboardList,   href: '/admin/requests',        badge: 'requests' },
    { label: 'Event Wishes',  icon: Heart,           href: '/admin/wishes',          badge: null },
    { label: 'Companion',     icon: MessageSquare,   href: '/admin/companion',       badge: null },
    { label: 'Payments',      icon: CreditCard,      href: '/admin/payments',        badge: null },
    { label: 'Support',       icon: Headphones,      href: '/admin/support',         badge: 'support' },
    { label: 'Notifications', icon: Bell,            href: '/admin/notifications',   badge: 'notifications' },
];

function NavItem({ item, collapsed }) {
    const pathname = usePathname();
    const { unreadCounts } = useAdmin();
    const isActive = pathname.startsWith(item.href);
    const badgeCount = item.badge ? unreadCounts[item.badge] || 0 : 0;

    return (
        <Link href={item.href}>
            <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group relative ${
                    isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
            >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {!collapsed && (
                    <span className="text-sm font-medium flex-1 whitespace-nowrap">{item.label}</span>
                )}
                {badgeCount > 0 && (
                    <span className={`${collapsed ? 'absolute -top-1 -right-1' : ''} min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center`}>
                        {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                )}
            </motion.div>
        </Link>
    );
}

function Sidebar({ collapsed, onClose }) {
    const { admin, logout } = useAdmin();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    return (
        <div className={`flex flex-col h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">bagspackgo</p>
                        <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Admin Panel</p>
                    </div>
                )}
                {onClose && (
                    <button onClick={onClose} className="ml-auto text-gray-500 hover:text-white transition-colors lg:hidden">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
                {navItems.map(item => (
                    <NavItem key={item.href} item={item} collapsed={collapsed} />
                ))}
            </nav>

            {/* Bottom */}
            <div className="border-t border-gray-800 px-3 py-4 space-y-1 flex-shrink-0">
                <Link href="/admin/settings">
                    <motion.div whileHover={{ x: 2 }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 cursor-pointer group">
                        <Settings className="w-[18px] h-[18px] flex-shrink-0 text-gray-500 group-hover:text-gray-300" />
                        {!collapsed && <span className="text-sm font-medium">Settings</span>}
                    </motion.div>
                </Link>
                <motion.div whileHover={{ x: 2 }} onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer group">
                    <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-gray-500 group-hover:text-red-400" />
                    {!collapsed && <span className="text-sm font-medium">Logout</span>}
                </motion.div>

                {!collapsed && admin && (
                    <div className="mt-3 px-3 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                        <p className="text-xs font-semibold text-white truncate">{admin.name}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{admin.email}</p>
                    </div>
                )}
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
                        <p className="text-gray-400 text-sm mb-6">Are you sure you want to log out of the admin panel?</p>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    logout();
                                }}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminShell({ children }) {
    const { loading } = useAdmin();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // We need useState. import it.
    const [mounted, setMounted] = useState(false);
    
    if (typeof collapsed === 'undefined') return null; // TS safety

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-gray-500 text-sm">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-shrink-0">
                <Sidebar collapsed={collapsed} />
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 h-full z-50 lg:hidden"
                        >
                            <Sidebar collapsed={false} onClose={() => setMobileOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center gap-4 px-4 sm:px-6 flex-shrink-0 sticky top-0 z-30">
                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                    {/* Desktop collapse */}
                    <button onClick={() => setCollapsed(v => !v)} className="hidden lg:flex text-gray-500 hover:text-gray-300 transition-colors">
                        <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                    </button>

                    <div className="flex-1" />

                    {/* Notification bell shortcut */}
                    <Link href="/admin/notifications" className="text-gray-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                    </Link>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}


