'use client';
import ErrorPage from '@/components/ui/ErrorPage';

export default function Error({ error, reset }) {
  return (
    <ErrorPage
      message={error?.message || 'Something went wrong.'}
      onRetry={reset}
    />
  );
}