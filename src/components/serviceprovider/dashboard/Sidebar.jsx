"use client";
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

export default function Sidebar({ isCollapsed }) {
  const pathname = usePathname();

  const completion = 65;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion / 100) * circumference;

  const items = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/serviceprovider/dashboard" },
    { name: "Trips", icon: BarChart3, href: "/serviceprovider/dashboard/trips" },
    { name: "Treks", icon: Mountain, href: "/serviceprovider/dashboard/treks" },
    { name: "Mergers", icon: UsersRound, href: "/serviceprovider/dashboard/mergers" },
    { name: "Events", icon: CalendarDays, href: "/serviceprovider/dashboard/events" },
    { name: "Settings", icon: Settings, href: "/serviceprovider/dashboard/settings" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? "80px" : "288px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 h-full border-r bg-white shadow-xl flex flex-col z-40 overflow-hidden"
    >
      <div className="flex-1 flex flex-col pt-16">
        {/* Profile Section */}
        <div className="px-4 py-6 border-b">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                {/* Circle with progress ring and initials */}
                <div className="relative">
                  <div className="relative w-14 h-14">
                    <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="url(#progressGradient)"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                      {/* Gradient for progress ring */}
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex items-center justify-center w-full h-full text-sm font-bold text-emerald-700 bg-emerald-100 rounded-full">
                      UA
                    </div>
                  </div>

                  {/* Percentage pill badge */}
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-md">
                    {completion}%
                  </div>
                </div>

                {/* Name + small message */}
                <div className="flex flex-col">
                  <h2 className="font-semibold text-gray-900">Upland Adventures</h2>
                  <Link
                    href="#"
                    className="text-xs text-emerald-600 hover:underline mt-1"
                  >
                    Complete your profile
                  </Link>
                </div>
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
                <div className="relative">
                  <div className="relative w-12 h-12">
                    <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="url(#progressGradientCollapsed)"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                      {/* Gradient for collapsed progress ring */}
                      <defs>
                        <linearGradient id="progressGradientCollapsed" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex items-center justify-center w-full h-full text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full">
                      UA
                    </div>
                  </div>

                  {/* Percentage pill badge */}
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-md">
                    {completion}%
                  </div>
                </div>
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
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-emerald-50 transition-colors ${
                    active ? "bg-emerald-50 text-emerald-800 font-medium" : "text-gray-700"
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
      <Link
        href="/serviceprovider/dashboard/logout"
        className={`flex items-center gap-4 w-full text-gray-700 hover:text-red-500 transition px-4 py-3 rounded-xl hover:bg-red-50 ${
          isCollapsed ? 'justify-center' : ''
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
      </Link>
    </div>
    </motion.aside>
  );
}