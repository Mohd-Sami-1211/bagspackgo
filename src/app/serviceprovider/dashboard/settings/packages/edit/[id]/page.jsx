'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewPackage from '@/components/serviceprovider/dashboard/Settings/NewPackage';
import NewTrekPackage from '@/components/serviceprovider/dashboard/Settings/NewTrekPackage';

export default function EditPackagePage() {
    const { id } = useParams();
    const router = useRouter();
    const [pkg, setPkg] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const res = await fetch(`/api/provider/packages?id=${id}`);
                const data = await res.json();
                if (data.success) {
                    setPkg(data.package);
                } else {
                    router.push('/serviceprovider/dashboard/settings/packages');
                }
            } catch (error) {
                console.error(error);
                router.push('/serviceprovider/dashboard/settings/packages');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackage();
    }, [id, router]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
               <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
               <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
            </div>
        );
    }

    if (!pkg) return null;

    if (pkg.category === 'trek') {
        return <NewTrekPackage initialData={pkg} isEdit={true} />;
    }

    return <NewPackage initialData={pkg} isEdit={true} />;
}
