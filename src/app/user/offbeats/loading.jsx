import { Compass } from 'lucide-react';

function FeaturedOffbeatSkeleton() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#111317]">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#29312e] via-[#191d1c] to-[#101214]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/65 to-transparent md:bg-[linear-gradient(90deg,rgba(15,16,20,.88)_0%,rgba(15,16,20,.48)_42%,transparent_72%)]" />
            <div className="relative z-10 mx-auto flex min-h-[610px] max-w-7xl items-end px-4 pb-14 pt-44 sm:px-6 md:items-center lg:min-h-[680px] lg:px-8">
                <div className="w-full max-w-xl animate-pulse">
                    <div className="mb-5 h-3 w-32 rounded-full bg-white/20" />
                    <div className="h-12 w-4/5 rounded-2xl bg-white/20 sm:h-16" />
                    <div className="mt-3 h-12 w-3/5 rounded-2xl bg-white/15 sm:h-16" />
                    <div className="mt-6 h-3 w-48 rounded-full bg-white/15" />
                    <div className="mt-8 h-12 w-40 rounded-full bg-white/20" />
                </div>
            </div>
        </div>
    );
}

function OffbeatGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-[1.75rem] bg-white"><div className="h-64 bg-[#dfe7e1]" /><div className="space-y-3 p-6"><div className="h-7 w-2/3 rounded bg-slate-200" /><div className="h-4 rounded bg-slate-100" /><div className="h-4 w-4/5 rounded bg-slate-100" /></div></div>
            ))}
        </div>
    );
}

export default function OffbeatsLoading() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f6f0]">
            <section className="relative isolate min-h-[610px] overflow-hidden bg-[#0f1014] lg:min-h-[680px]">
                <FeaturedOffbeatSkeleton />
            </section>

            <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 border-b border-[#17372f]/10 pb-7">
                        <div className="h-4 w-48 bg-[#dfe7e1] rounded animate-pulse mb-4"></div>
                        <div className="h-10 w-64 bg-[#dfe7e1] rounded animate-pulse"></div>
                    </div>
                    <OffbeatGridSkeleton />
                </div>
            </section>
        </div>
    );
}
