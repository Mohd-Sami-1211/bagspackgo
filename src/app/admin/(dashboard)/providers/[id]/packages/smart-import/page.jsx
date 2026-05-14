'use client';
import { useParams } from 'next/navigation';
import SmartImport from '@/components/serviceprovider/dashboard/Settings/SmartImport';

export default function AdminSmartImportPage() {
  const { id } = useParams();
  return (
    <div className="admin-dark-form">
      <SmartImport adminMode={true} providerId={id} />
    </div>
  );
}
