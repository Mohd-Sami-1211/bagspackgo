'use client';
import { Suspense, useEffect } from 'react';
import ProviderRegistrationForm from 'src/components/serviceprovider/ProviderRegistrationForm';
import { useFetchProvider } from 'src/customHook/fetchDetails';
export default function ServiceProviderPage() {
  useFetchProvider();
  return (
    <Suspense fallback={<div className="p-6">Loading form…</div>}>
      <ProviderRegistrationForm />
    </Suspense>
  );
}