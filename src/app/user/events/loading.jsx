import { Sparkles, ArrowRight } from 'lucide-react';

function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
          <div className="h-48 bg-neutral-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-100 rounded w-1/2" />
            <div className="flex justify-between pt-3 mt-2 border-t border-neutral-100">
              <div className="h-6 bg-neutral-200 rounded w-1/4" />
              <div className="h-9 bg-neutral-200 rounded-xl w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <section className="relative mb-12 w-full bg-[#0f1014] pt-[4.75rem] md:bg-transparent md:pt-0">
        <div className="w-full h-[450px] md:h-[460px] lg:h-[500px] bg-[#0f1014] animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-800" />
        </div>
      </section>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <SkeletonGrid count={6} />
      </section>
    </div>
  );
}
