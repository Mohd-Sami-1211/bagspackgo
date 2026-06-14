'use client';
import ErrorPage from '@/components/ui/ErrorPage';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <ErrorPage
          message={error?.message || 'Something went wrong.'}
          onRetry={reset}
        />
      </body>
    </html>
  );
}