'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ViewPackage from '@/components/serviceprovider/dashboard/Settings/ViewPackage';

export default function AdminViewPackagePage() {
    const { id, packageId } = useParams();
    const router = useRouter();
    const [pkg, setPkg] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const res = await fetch(`/api/admin/packages?id=${packageId}`);
                const data = await res.json();
                if (data.success) {
                    setPkg(data.package);
                } else {
                    router.push(`/admin/providers/${id}`);
                }
            } catch (error) {
                console.error(error);
                router.push(`/admin/providers/${id}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackage();
    }, [packageId, id, router]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
               <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
               <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
            </div>
        );
    }

    if (!pkg) return null;

    return (
        <div className="admin-dark-form">
            <ViewPackage pkg={pkg} adminMode={true} providerId={id} />
        </div>
    );
}
