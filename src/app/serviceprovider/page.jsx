'use client';
import { Suspense, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProviderRegistrationForm from 'src/components/serviceprovider/ProviderRegistrationForm';
import ApplicationPendingPage from 'src/components/serviceprovider/ApplicationPendingPage';

export default function ServiceProviderPage() {
  const { user } = useAuth();
  const status = user?.applicationStatus || 'none';
  const [resubmitting, setResubmitting] = useState(false);

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      {/* Show the registration form natively if they haven't applied */}
      {status === 'none' && (
        <ProviderRegistrationForm />
      )}
      
      {/* If rejected, they initially see the PendingPage (which now shows rejection), 
          but if they click "Resubmit Application", resubmitting becomes true. */}
      {status === 'rejected' && resubmitting && (
        <ProviderRegistrationForm rejected={true} />
      )}

      {/* Show pending/under-review status page normally, OR if rejected and not yet resubmitting */}
      {(status === 'pending' || (status === 'rejected' && !resubmitting)) && (
        <ApplicationPendingPage onResubmit={() => setResubmitting(true)} />
      )}

      {/* "approved" status is handled by layout — they get redirected to dashboard */}
    </Suspense>
  );
}