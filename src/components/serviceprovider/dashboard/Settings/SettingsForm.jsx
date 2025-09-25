'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Package,
  CreditCard,
  Calendar,
  Bell,
  Shield,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';

const menuItems = [
  { id: 'profile', label: 'Your Profile', icon: User },
  { id: 'account', label: 'Account Settings', icon: Settings },
  { id: 'packages', label: 'Travel Packages', icon: Package },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

export default function SettingsPage() {
  const [active, setActive] = useState(null);

  return (
    <div className="w-full min-h-screen bg-gray-50 -mt-6">
      {/* MENU LIST */}
      {!active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className=" mx-auto w-full"
        >
          <h1 className="text-2xl font-bold px-4 py-6 ">Settings</h1>
          <div className="divide-y  shadow-sm rounded-xl overflow-hidden">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                onClick={() => setActive(id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <Icon size={20} />
                  </div>
                  <span className="text-base font-medium">{label}</span>
                </div>
                <ArrowLeft size={18} className="rotate-180 text-gray-400" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* CONTENT VIEW */}
      {active && (
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen bg-white mt-4 rounded-2xl"
        >
          {/* HEADER */}
          <div className="flex items-center gap-3 border-b px-4 py-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setActive(null)}
            >
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-lg font-semibold">
              {menuItems.find((m) => m.id === active)?.label}
            </h2>
          </div>

          {/* CONTENT */}
          <div className="px-5 py-6">
            {active === 'profile' && <ProfileContent />}
            {active === 'account' && <AccountContent />}
            {active === 'packages' && <PackagesContent />}
            {active === 'transactions' && <TransactionsContent />}
            {active === 'bookings' && <BookingsContent />}
            {active === 'notifications' && <NotificationsContent />}
            {active === 'security' && <SecurityContent />}
            {active === 'help' && <HelpContent />}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* -------------------- CONTENT COMPONENTS -------------------- */

function ProfileContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Update your personal information.</p>
      <div className="grid gap-3">
        <input className="rounded-lg border px-3 py-2" placeholder="Full Name" defaultValue="Mohd Sami" />
        <input className="rounded-lg border px-3 py-2" placeholder="Email" defaultValue="sami@example.com" />
        <input className="rounded-lg border px-3 py-2" placeholder="Phone" defaultValue="+91 98XXXXXX" />
        <input className="rounded-lg border px-3 py-2" placeholder="Location" defaultValue="New Delhi, India" />
      </div>
      <button className="rounded-lg bg-emerald-600 text-white px-5 py-2 hover:bg-emerald-700 transition">
        Save Changes
      </button>
    </div>
  );
}

function AccountContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Manage your account preferences.</p>
      <button className="w-full rounded-lg border px-4 py-2 hover:bg-gray-50 transition">Change Email</button>
      <button className="w-full rounded-lg border px-4 py-2 hover:bg-gray-50 transition">Change Phone Number</button>
      <button className="w-full rounded-lg border px-4 py-2 text-red-500 hover:bg-red-50 transition">Delete Account</button>
    </div>
  );
}

function PackagesContent() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">Your active travel packages.</p>
      <div className="rounded-lg border p-4 flex justify-between items-center">
        <div>
          <p className="font-medium">Premium Travel Pack</p>
          <p className="text-sm text-gray-500">Valid till: Dec 2025</p>
        </div>
        <button className="rounded-lg bg-emerald-600 text-white px-4 py-2">Renew</button>
      </div>
    </div>
  );
}

function TransactionsContent() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">Your recent payments.</p>
      <ul className="divide-y text-sm">
        <li className="flex justify-between py-3">
          <span>Booking #12345</span>
          <span className="text-emerald-600">₹5000</span>
        </li>
        <li className="flex justify-between py-3">
          <span>Package Upgrade</span>
          <span className="text-emerald-600">₹2500</span>
        </li>
      </ul>
    </div>
  );
}

function BookingsContent() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">Your travel reservations.</p>
      <p className="text-gray-600">No active bookings right now.</p>
    </div>
  );
}

function NotificationsContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Choose how you want updates.</p>
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked /> Email Alerts
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked /> Push Notifications
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" /> SMS Alerts
      </label>
    </div>
  );
}

function SecurityContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Update your password.</p>
      <input type="password" className="rounded-lg border px-3 py-2 w-full" placeholder="Current Password" />
      <input type="password" className="rounded-lg border px-3 py-2 w-full" placeholder="New Password" />
      <input type="password" className="rounded-lg border px-3 py-2 w-full" placeholder="Confirm New Password" />
      <button className="rounded-lg border px-5 py-2 hover:bg-gray-50 transition">
        Update Password
      </button>
    </div>
  );
}

function HelpContent() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">Need assistance? We're here to help.</p>
      <button className="rounded-lg bg-emerald-600 text-white px-5 py-2">Contact Support</button>
    </div>
  );
}
