'use client';
import { Suspense } from 'react';
import ScanPassContent from './ScanPassContent';

export default function ProviderScanPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-8 bg-[#F0FDF4]">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        }>
            <ScanPassContent />
        </Suspense>
    );
}
