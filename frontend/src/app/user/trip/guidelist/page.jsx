'use client'
import { Suspense } from 'react'
import SearchResults from 'frontend/src/components/home/TripSection/TripSearchResults'

export default function GuideListPage() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <SearchResults />
    </Suspense>
  )
}