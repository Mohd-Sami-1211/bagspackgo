import React from 'react';

const GuideListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[400px]">
          {/* Image skeleton */}
          <div className="h-48 bg-slate-200 w-full shrink-0" />
          
          <div className="p-4 flex flex-col flex-1">
            {/* Title skeleton */}
            <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-3" />
            
            {/* Info skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-slate-200 rounded-md w-1/2" />
              <div className="h-4 bg-slate-200 rounded-md w-2/3" />
            </div>
            
            {/* Price and button skeleton */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <div className="h-3 bg-slate-200 rounded-md w-16" />
                <div className="h-5 bg-slate-200 rounded-md w-24" />
              </div>
              <div className="h-9 bg-slate-200 rounded-lg w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuideListSkeleton;
