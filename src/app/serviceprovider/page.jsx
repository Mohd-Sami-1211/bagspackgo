'use client';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProviderRegistrationForm from 'src/components/serviceprovider/ProviderRegistrationForm';
import ApplicationPendingPage from 'src/components/serviceprovider/ApplicationPendingPage';

export default function ServiceProviderPage() {
  const { user } = useAuth();
  const status = user?.applicationStatus || 'none';

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      {/* Show the registration form if they haven't applied or were rejected */}
      {(status === 'none' || status === 'rejected') && (
        <ProviderRegistrationForm rejected={status === 'rejected'} />
      )}

      {/* Show pending/under-review status page */}
      {status === 'pending' && (
        <ApplicationPendingPage />
      )}

      {/* "approved" status is handled by layout — they get redirected to dashboard */}
    </Suspense>
  );
}