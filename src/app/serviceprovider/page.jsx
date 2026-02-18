'use client';
import { Suspense } from 'react';
import ProviderRegistrationForm from 'src/components/serviceprovider/ProviderRegistrationForm';

export default function ServiceProviderPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading form…</div>}>
      <ProviderRegistrationForm />
    </Suspense>
  );
}