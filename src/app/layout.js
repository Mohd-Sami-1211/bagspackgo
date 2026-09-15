import './globals.css';
import ClientLayout from '@/components/common/ClientLayout';
import { Suspense } from 'react';
import PostHogProvider, { PostHogPageView } from '@/components/analytics/PostHogProvider';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_IMAGE } from '@/lib/seo';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Bagspackgo | Kashmir Trips, Offbeats, Events & Companion', template: '%s | Bagspackgo' },
  description: SITE_DESCRIPTION,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: { type: 'website', locale: 'en_IN', siteName: SITE_NAME, images: [{ url: DEFAULT_IMAGE, alt: 'Kashmir mountains and lake' }] },
  twitter: { card: 'summary_large_image', images: [DEFAULT_IMAGE] },
};
export default function RootLayout({ children }) {
  return <html lang="en-IN" className="w-full overflow-x-hidden">
    <body className="bg-white/90 text-gray-800 min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden antialiased font-sans">
      <PostHogProvider>
        <Suspense fallback={null}><PostHogPageView /></Suspense>
        <ClientLayout>{children}</ClientLayout>
      </PostHogProvider>
    </body>
  </html>;
}
