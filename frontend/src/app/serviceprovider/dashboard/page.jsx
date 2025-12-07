'use client';
import DashboardMainContent from 'src/components/serviceprovider/dashboard/DashboardMainContent';
import { useFetchCompany } from 'src/customHook/fetchDetails';
export default function DashboardPage() {
  useFetchCompany();
  return <DashboardMainContent />;
}