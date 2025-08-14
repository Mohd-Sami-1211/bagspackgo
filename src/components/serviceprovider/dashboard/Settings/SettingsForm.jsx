'use client';

export default function SettingsForm(){
  return (
    <div className="grid gap-6 max-w-3xl">
      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm font-medium">Company Profile</div>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <input className="rounded-xl border px-3 py-2" placeholder="Company Name" defaultValue="Wander North Co."/>
          <input className="rounded-xl border px-3 py-2" placeholder="Email" defaultValue="hello@wander.co"/>
          <input className="rounded-xl border px-3 py-2" placeholder="Phone" defaultValue="+91 98XXXXXX"/>
          <input className="rounded-xl border px-3 py-2" placeholder="Instagram" defaultValue="@wandernorth"/>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-xl bg-emerald-600 text-white px-4 py-2">Save Changes</button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm font-medium">Preferences</div>
        <div className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Email Alerts</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Push Notifications</label>
          <label className="flex items-center gap-2"><input type="checkbox"/> Dark Mode</label>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm font-medium">Security</div>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <input type="password" className="rounded-xl border px-3 py-2" placeholder="Current Password"/>
          <input type="password" className="rounded-xl border px-3 py-2" placeholder="New Password"/>
          <input type="password" className="rounded-xl border px-3 py-2" placeholder="Confirm New Password"/>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-xl border px-4 py-2">Update Password</button>
        </div>
      </div>
    </div>
  );
}