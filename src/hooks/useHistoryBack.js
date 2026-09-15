'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function useHistoryBack(fallbackHref = '/') {
  const router = useRouter();

  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }, [fallbackHref, router]);
}
