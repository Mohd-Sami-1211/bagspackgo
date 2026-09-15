'use client';
import { useState } from 'react';
import { calculateTripBudget } from '@/lib/tripBudget';
const fields = [
  ['travelers', 'Travelers', 1, 100], ['nights', 'Nights', 0, 365], ['days', 'Meal days', 0, 366],
  ['rooms', 'Rooms per night', 0, 100], ['roomRate', 'Room rate per night (₹)', 0],
  ['transport', 'Local transport for the group (₹)', 0], ['returnTravel', 'Return travel per person (₹)', 0],
  ['meals', 'Meals per person per day (₹)', 0], ['activities', 'Activities per person (₹)', 0],
  ['extras', 'Other costs for the group (₹)', 0], ['contingency', 'Your contingency allowance (%)', 0, 100],
];
const initial = { travelers: 2, nights: 5, days: 6, rooms: 1, roomRate: 0, transport: 0, returnTravel: 0, meals: 0, activities: 0, extras: 0, contingency: 0 };
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export default function TripBudgetCalculator() {
  const [values, setValues] = useState(initial);
  const result = calculateTripBudget(values);
  return <section aria-labelledby="budget-calculator" className="my-10 rounded-3xl border border-[#17372f]/15 bg-[#f8f6f0] p-5 sm:p-8">
    <h2 id="budget-calculator" className="font-serif text-3xl">Your Kashmir trip budget</h2>
    <p className="mt-3 text-sm leading-7 text-slate-600">Enter your own quotes in rupees. Zero means you have not added a cost; these are not live prices.</p>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">{fields.map(([key,label,min,max]) => <label key={key} className="text-sm font-semibold">
      {label}<input type="number" min={min} max={max} step={['travelers','nights','days','rooms'].includes(key) ? 1 : 'any'} value={values[key]}
        onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))}
        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base" />
    </label>)}</div>
    <div aria-live="polite" aria-atomic="true" className="mt-7 rounded-2xl bg-[#17372f] p-6 text-white">
      <p className="text-sm text-white/75">Total from the amounts you entered</p><p className="mt-2 text-4xl font-bold">{money(result.total)}</p>
      <p className="mt-3 text-lg">{money(result.perPerson)} per traveler</p>
      <p className="mt-4 text-sm leading-6 text-white/75">Shared costs {money(result.shared)} · Individual costs {money(result.individual)} · Contingency {money(result.reserve)}</p>
    </div>
    <p className="mt-4 text-xs leading-6 text-slate-600">Total = rooms × nights × room rate + group transport + group extras + travelers × (return travel + meal days × daily meals + activities), plus your contingency allowance.</p>
    <button type="button" onClick={() => setValues(initial)} className="mt-4 text-sm font-semibold underline underline-offset-4">Reset calculator</button>
  </section>;
}

