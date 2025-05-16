'use client'
import { Suspense } from 'react'
import SearchResults from '@/components/home/TripSection/SearchResults'

export default function GuideListPage() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <SearchResults />
    </Suspense>
  )
}