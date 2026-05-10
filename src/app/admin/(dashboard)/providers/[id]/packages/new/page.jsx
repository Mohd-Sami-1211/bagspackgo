'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import NewPackage from '@/components/serviceprovider/dashboard/Settings/NewPackage';
import NewTrekPackage from '@/components/serviceprovider/dashboard/Settings/NewTrekPackage';

export default function AdminNewPackagePage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'trip';
    const duplicateId = searchParams.get('duplicate');

    const [prefillData, setPrefillData] = useState(null);
    const [loading, setLoading] = useState(!!duplicateId);

    useEffect(() => {
        if (duplicateId) {
            const fetchPackage = async () => {
                try {
                    const res = await fetch(`/api/admin/packages?id=${duplicateId}`);
                    const data = await res.json();
                    if (data.success) {
                        const pkg = { ...data.package };
                        delete pkg._id;
                        delete pkg.createdAt;
                        delete pkg.updatedAt;
                        pkg.name = `Copy of ${pkg.name}`;
                        pkg.status = 'active';
                        setPrefillData(pkg);
                        
                        // Remove 'duplicate' from URL so a page reload uses the local storage draft instead
                        const url = new URL(window.location.href);
                        url.searchParams.delete('duplicate');
                        window.history.replaceState({}, '', url.toString());
                    }
                } catch (err) {
                    console.error('Failed to fetch package for duplication:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPackage();
        }
    }, [duplicateId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-[13px] font-medium text-gray-400">Loading package data...</p>
            </div>
        );
    }

    if (type === 'trek') {
        return (
            <div className="admin-dark-form">
                <NewTrekPackage initialData={prefillData} isEdit={false} adminMode={true} providerId={id} />
            </div>
        );
    }

    return (
        <div className="admin-dark-form">
            <NewPackage initialData={prefillData} isEdit={false} adminMode={true} providerId={id} />
        </div>
    );
}
