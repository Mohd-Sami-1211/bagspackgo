'use client';
import { Suspense } from 'react';
import TrekSearchResults from 'src/components/home/TrekSection/TrekSearchResults';

export default function GuideListPage() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <TrekSearchResults />
    </Suspense>
  );
}
