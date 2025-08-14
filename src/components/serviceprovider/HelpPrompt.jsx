'use client';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function HelpPrompt() {
  return (
    <div className="flex items-center gap-2 text-sm mt-3">
      <MessageCircle className="h-4 w-4" />
      <span>Need help? </span>
      <Link href="/help" className="text-emerald-600 hover:underline">Contact support</Link>
    </div>
  );
}