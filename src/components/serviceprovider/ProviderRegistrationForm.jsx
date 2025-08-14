'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import FormField from './FormField';
import ProgressStatus from './ProgressStatus';
import LogoHeader from './LogoHeader';
import HelpPrompt from './HelpPrompt';
import destinationsData from '@/data/data.json';

export default function ProviderRegistrationForm() {
  const [form, setForm] = useState({
    companyName: '',
    companyMail: '',
    companyMobile: '',
    destinationId: '',
    address: '',
    instagram: '',
    facebook: '',
    licenseFile: null,
    idFile: null,
    availability: { trips: true, treks: true, mergers: true },
    agree: false,
  });
  const [status, setStatus] = useState('submitted');
  const [submitted, setSubmitted] = useState(false);

  const destinations = useMemo(() => destinationsData.destinations || [], []);

  function update(path, value) {
    setForm(prev => ({ ...prev, [path]: value }));
  }

  function updateAvail(key) {
    setForm(prev => ({ ...prev, availability: { ...prev.availability, [key]: !prev.availability[key] } }));
  }

  function onSubmit(e) {
    e.preventDefault();
    // You can post to your API route here
    setSubmitted(true);
    setStatus('submitted');
    setTimeout(() => setStatus('pending'), 1500);
  }

  useEffect(() => {
    if (submitted) {
      // simulate approval later
      const t = setTimeout(() => setStatus('approved'), 4000);
      return () => clearTimeout(t);
    }
  }, [submitted]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <div className="rounded-3xl border bg-white p-6 shadow-sm mt-6">
        <LogoHeader />
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <FormField label="Company Name" required>
            <input value={form.companyName} onChange={e=>update('companyName', e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="e.g., Wander North Co."/>
          </FormField>
          <FormField label="Company Email" required>
            <input type="email" value={form.companyMail} onChange={e=>update('companyMail', e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="hello@company.com"/>
          </FormField>
          <FormField label="Company Mobile" required>
            <input inputMode="numeric" value={form.companyMobile} onChange={e=>update('companyMobile', e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="+91 98XXXXXX"/>
          </FormField>
          <FormField label="Operating Location" required hint="Pick a primary destination; you can add more later in Settings.">
            <select value={form.destinationId} onChange={e=>update('destinationId', e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Select destination</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Address" required>
            <input value={form.address} onChange={e=>update('address', e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Street, City, PIN"/>
          </FormField>
          <FormField label="Instagram ID" hint="Your @handle (optional)">
            <input value={form.instagram} onChange={e=>update('instagram', e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="@yourcompany"/>
          </FormField>
          <FormField label="Facebook Profile" hint="Link (optional)">
            <input value={form.facebook} onChange={e=>update('facebook', e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="https://facebook.com/yourpage"/>
          </FormField>
          <FormField label="Upload Licence" required>
            <input type="file" onChange={e=>update('licenseFile', e.target.files?.[0] ?? null)} className="w-full"/>
          </FormField>
          <FormField label="Owner ID Proof" required>
            <input type="file" onChange={e=>update('idFile', e.target.files?.[0] ?? null)} className="w-full"/>
          </FormField>

          <div className="md:col-span-2 grid grid-cols-3 gap-3">
            <label className="flex gap-2 items-center rounded-xl border p-3">
              <input type="checkbox" checked={form.availability.trips} onChange={()=>updateAvail('trips')} />
              <span>Available for Trips</span>
            </label>
            <label className="flex gap-2 items-center rounded-xl border p-3">
              <input type="checkbox" checked={form.availability.treks} onChange={()=>updateAvail('treks')} />
              <span>Available for Treks</span>
            </label>
            <label className="flex gap-2 items-center rounded-xl border p-3">
              <input type="checkbox" checked={form.availability.mergers} onChange={()=>updateAvail('mergers')} />
              <span>Available for Mergers</span>
            </label>
          </div>

          <div className="md:col-span-2 text-sm text-neutral-600">
            Want to learn more about <a className="text-emerald-600 underline" href="#">Trips</a>, <a className="text-emerald-600 underline" href="#">Treks</a> and <a className="text-emerald-600 underline" href="#">Mergers</a>?
          </div>

          <label className="md:col-span-2 flex items-start gap-3 rounded-xl bg-neutral-50 p-3 border">
            <input type="checkbox" checked={form.agree} onChange={e=>update('agree', e.target.checked)} />
            <span className="text-sm">I agree to the <a href="#" className="text-emerald-600 underline">Terms & Conditions</a> and <a href="#" className="text-emerald-600 underline">Privacy Policy</a>.</span>
          </label>

          <div className="md:col-span-2 flex items-center justify-between">
            <button disabled={!form.agree} className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:bg-neutral-300">Submit Application</button>
            <ProgressStatus step={status} />
          </div>
        </form>

        {submitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border bg-emerald-50 p-4 text-emerald-800">
            Your application has been submitted. It will be reviewed shortly. On approval you’ll be ready to work!
            <HelpPrompt />
          </motion.div>
        )}
      </div>
    </div>
  );
}
