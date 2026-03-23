'use client'
import { Suspense } from 'react'
import SearchResults from 'src/components/home/TripSection/TripSearchResults'

export default function GuideListPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="w-12 h-12 border-[4px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}