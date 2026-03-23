'use client';
import { Suspense, useState, useEffect } from 'react';
import TrekGuideDetails from 'src/components/home/TrekSection/GuideDetails';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import data from 'src/data/data.json'; //changed the routing for data.json here

function TrekDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get parameters from URL
  const trekId = searchParams.get('trekId') || params.id;
  const category = searchParams.get('category') || 'individual';
  const days = searchParams.get('days') || '1';
  const count = searchParams.get('count') || '1';

  useEffect(() => {
    async function fetchPackage() {
      try {
        // Fetch package by trekId (which is actually the package _id)
        const res = await fetch(`/api/public/treks`); // We can just fetch all or make a new API
        if (res.ok) {
          const json = await res.json();
          const packages = json.data || [];
          const foundPackage = packages.find(p => p._id === trekId);
          setPkg(foundPackage);
        }
      } catch (error) {
        console.error("Failed to fetch package", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [trekId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2FFFC] w-full flex flex-col items-center justify-center gap-4 pb-20">
        <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
      </div>
    );
  }
  if (!pkg) return notFound();

  return (
    <TrekGuideDetails
      guide={pkg}
    />
  );
}

export default function TrekDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2FFFC] w-full flex flex-col items-center justify-center gap-4 pb-20">
        <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
      </div>
    }>
      <TrekDetailsContent /> {/* Fixed: Was rendering GuideDetails directly */}
    </Suspense>
  );
}