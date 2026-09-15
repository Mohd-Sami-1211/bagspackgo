import { notFound } from 'next/navigation';
import { getPublicEventDetails } from '@/lib/publicEvent';
export const revalidate = 30;
export default async function EventDetailsLayout({ children, params }) {
  const { id } = await params;
  // Check before the child's loading boundary commits a streamed 200 response.
  if (!await getPublicEventDetails(id)) notFound();
  return <div className="bg-white min-h-screen pt-[80px] w-full">{children}</div>;
}
