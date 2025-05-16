'use client';
import { useEffect } from 'react';
import SearchResults from '@/components/home/TripSection/SearchResults';
import { useRouter } from 'next/navigation';

export default function GuideListPage() {
  const router = useRouter();

  useEffect(() => {
    return () => {
      // This will run when component unmounts (when going back)
      // No need to manually show/hide elements anymore
    };
  }, []);

  return <SearchResults onBack={() => router.back()} />;
}