'use client';
import SearchInput from '@/components/home/TripSection/TripSearchInput';

export default function TripPage() {
  return (
    <div id="trip-page" className="flex flex-col items-center justify-center min-h-[80vh] mt-14">
      <SearchInput />
    </div>
  );
}