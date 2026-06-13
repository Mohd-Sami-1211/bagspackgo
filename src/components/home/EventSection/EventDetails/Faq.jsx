import { HelpCircle } from 'lucide-react';
import Accordion from '@/components/ui/Accordian';

export default function Faq({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  const items = faqs.map(faq => ({
    title: faq.question,
    content: faq.answer,
  }));

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle size={20} className="text-amber-500" /> Frequently Asked Questions
      </h3>
      <Accordion
        items={items}
        defaultOpen={[]}
        activeClassName="bg-amber-50 border-b border-amber-100"
        contentClassName="bg-amber-50/30"
        chevronActiveClassName="text-amber-600"
      />
    </div>
  );
}