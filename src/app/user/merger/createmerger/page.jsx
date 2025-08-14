'use client';

import { Suspense } from 'react';
import NewMerger from '@/components/home/MergerSection/NewMerger';
import data from '@/data/data.json';

export default function CreateMergerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading merger form...</div>}>
      <NewMerger data={data} />
    </Suspense>
  );
}