'use client';
import { CheckCircle2, Hourglass, Send } from 'lucide-react';

const STEPS = [
  { id: 'submitted', label: 'Submitted', icon: Send },
  { id: 'pending', label: 'Pending', icon: Hourglass },
  { id: 'approved', label: 'Approved', icon: CheckCircle2 },
];

export default function ProgressStatus({ step = 'submitted' }) {
  const activeIndex = STEPS.findIndex(s => s.id === step);
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, idx) => {
        const Icon = s.icon;
        const active = idx <= activeIndex;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`h-8 w-8 grid place-items-center rounded-full border ${active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-neutral-500'} transition-all`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className={`text-sm ${active ? 'text-emerald-600' : 'text-neutral-500'}`}>{s.label}</span>
            {idx < STEPS.length - 1 && (
              <div className={`mx-2 h-[2px] w-10 rounded ${idx < activeIndex ? 'bg-emerald-400' : 'bg-neutral-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}