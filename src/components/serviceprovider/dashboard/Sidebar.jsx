"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Mountain,
  UsersRound,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { X } from 'lucide-react';

// Get initials from name: "Mohd Samiullah" → "MS"
function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0][0].toUpperCase();
}

export default function Sidebar({ isCollapsed, onClose, isMobile }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        setProfileLoading(true);
        const res = await fetch('/api/provider/profile');
        if (res.ok) {
          const { profile } = await res.json();
          setProfileData(profile);
        }
      } catch (e) {
        console.error("Failed to fetch profile in sidebar", e);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  let completion = 0;
  if (profileData) {
    const fieldsToTrack = [
      'companyname', 'companyemail', 'companymobile', 'address', 'bio',
      'speciality', 'logo', 'bankName', 'accountHolderName',
      'accountNumber', 'ifscCode'
    ];
    let filled = 0;
    fieldsToTrack.forEach(field => {
      if (profileData[field] && profileData[field].toString().trim() !== '') {
        filled++;
      }
    });
    // Add stats as bonus or separate fields
    if (profileData.totalTreks > 0 || profileData.totalTrips > 0 || profileData.totalEvents > 0) {
      filled++;
    }
    // Totals fields: 11 fields monitored + 1 for any activity stats = 12 total points
    completion = Math.round((filled / 12) * 100);
  } else {
    completion = 0;
  }

  // Progress ring math — expanded avatar is 56px (w-14), strokeWidth 3px
  // radius = (56/2) - (3/2) = 26.5, so the stroke sits exactly on the edge
  const size = 56;
  const strokeWidth = 3;
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion / 100) * circumference;

  // Collapsed ring: 48px (w-12)
  const sizeCollapsed = 48;
  const radiusCollapsed = (sizeCollapsed / 2) - (strokeWidth / 2);
  const circumferenceCollapsed = 2 * Math.PI * radiusCollapsed;
  const offsetCollapsed = circumferenceCollapsed - (completion / 100) * circumferenceCollapsed;

  const displayName = profileData?.companyname || user?.username || "Service Provider";
  const initials = getInitials(displayName);

  const items = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/serviceprovider/dashboard" },
    { name: "Trips", icon: BarChart3, href: "/serviceprovider/dashboard/trips" },
    { name: "Treks", icon: Mountain, href: "/serviceprovider/dashboard/treks" },
    { name: "Events", icon: CalendarDays, href: "/serviceprovider/dashboard/events" },
    { name: "Settings", icon: Settings, href: "/serviceprovider/dashboard/settings" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isCollapsed && !isMobile ? "80px" : "288px",
        minWidth: isCollapsed && !isMobile ? "80px" : "288px" 
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full border-r bg-white shadow-xl flex flex-col z-40 overflow-hidden relative"
    >
      <div className="flex-1 flex flex-col h-0 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {/* Profile Section */}
        <div className="px-4 py-6 border-b relative">
          {isMobile && onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-md"
            >
              <X size={20} />
            </button>
          )}
          <AnimatePresence mode="wait">
            {(!isCollapsed || isMobile) ? (
              <motion.div
                key="expanded-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 mt-4"
              >
                {profileLoading ? (
                  /* ── Skeleton placeholder while loading ── */
                  <>
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="h-4 w-28 bg-gray-200 rounded-md animate-pulse" />
                      <div className="h-3 w-20 bg-gray-100 rounded-md animate-pulse" />
                    </div>
                  </>
                ) : (
                  /* ── Actual profile content ── */
                  <>
                    {/* Circle with progress ring and initials */}
                    <Link href="/serviceprovider/dashboard/profile" className="relative group cursor-pointer block flex-shrink-0">
                      <div className="relative w-14 h-14 group-hover:scale-105 transition-transform duration-300">
                        {/* SVG ring wraps tightly around the 56px container */}
                        <svg
                          width={size}
                          height={size}
                          className="absolute top-0 left-0 -rotate-90"
                          style={{ transform: 'rotate(-90deg)' }}
                        >
                          <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#e5e7eb"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                          />
                          <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#progressGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </svg>
                        {/* Inner avatar — inset by strokeWidth so ring is visible */}
                        <div
                          className="absolute flex items-center justify-center text-sm font-bold text-emerald-700 bg-emerald-100 rounded-full overflow-hidden"
                          style={{
                            top: strokeWidth + 1,
                            left: strokeWidth + 1,
                            width: size - (strokeWidth + 1) * 2,
                            height: size - (strokeWidth + 1) * 2,
                          }}
                        >
                          {profileData?.logo ? (
                            <img src={profileData.logo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                      </div>

                      {/* Percentage pill badge */}
                      {completion < 100 && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-md z-10 transition-transform group-hover:scale-110">
                          {completion}%
                        </div>
                      )}
                    </Link>

                    {/* Name + small message */}
                    <div className="flex flex-col min-w-0 mb-1 flex-1">
                      <Link href="/serviceprovider/dashboard/profile" className="font-semibold text-gray-900 truncate tracking-tight hover:text-emerald-700 transition-colors">
                        {displayName}
                      </Link>
                      {completion < 100 && (
                        <Link
                          href="/serviceprovider/dashboard/settings?edit=true"
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline mt-0.5 transition-colors inline-block"
                        >
                          Complete your profile
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                {profileLoading ? (
                  /* ── Collapsed skeleton ── */
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                ) : (
                  <Link href="/serviceprovider/dashboard/profile" className="relative group block cursor-pointer">
                    <div className="relative w-12 h-12 group-hover:scale-105 transition-transform duration-300">
                      <svg
                        width={sizeCollapsed}
                        height={sizeCollapsed}
                        className="absolute top-0 left-0"
                        style={{ transform: 'rotate(-90deg)' }}
                      >
                        <circle
                          cx={sizeCollapsed / 2}
                          cy={sizeCollapsed / 2}
                          r={radiusCollapsed}
                          stroke="#e5e7eb"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                        />
                        <circle
                          cx={sizeCollapsed / 2}
                          cy={sizeCollapsed / 2}
                          r={radiusCollapsed}
                          stroke="url(#progressGradientCollapsed)"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                          strokeDasharray={circumferenceCollapsed}
                          strokeDashoffset={offsetCollapsed}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="progressGradientCollapsed" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div
                        className="absolute flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full overflow-hidden"
                        style={{
                          top: strokeWidth + 1,
                          left: strokeWidth + 1,
                          width: sizeCollapsed - (strokeWidth + 1) * 2,
                          height: sizeCollapsed - (strokeWidth + 1) * 2,
                        }}
                      >
                        {profileData?.logo ? (
                          <img src={profileData.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                    </div>

                    {/* Percentage pill badge */}
                    {completion < 100 && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-md z-10">
                        {completion}%
                      </div>
                    )}
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Items */}
        <nav className="mt-6 space-y-2 px-2 flex-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-emerald-50 transition-colors ${active ? "bg-emerald-50 text-emerald-800 font-medium" : "text-gray-700"
                    } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <item.icon size={22} />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key={`text-${item.name}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={() => setShowLogoutOverlay(true)}
          className={`flex items-center gap-4 w-full text-gray-700 hover:text-red-500 transition px-4 py-3 rounded-xl hover:bg-red-50 ${isCollapsed ? 'justify-center' : ''
            }`}
        >
          <LogOut size={22} />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                key="logout-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {showLogoutOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sign Out</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Are you sure you want to log out of your provider dashboard?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition">
                Yes, Log Out
              </button>
              <button onClick={() => setShowLogoutOverlay(false)} className="w-full py-3 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.aside>
  );
}