/** @type {import('next').NextConfig} */
const nextConfig = {
    // Prevent sharp (native Node addon) from being bundled for the browser
    serverExternalPackages: ['sharp'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '15mb',
        },
    },
    async headers() {
        return [
            ...["/admin/:path*","/serviceprovider/:path*","/signin","/signup","/user/bookings/:path*","/user/saved/:path*","/user/notifications/:path*","/user/trip/guidelist","/user/trek/guidelist","/user/offbeats/results","/user/trip/pass/:path*","/user/trek/pass/:path*","/user/event/pass/:path*","/api/public/pass/:path*","/user/trip/guidelist/tripdetails/:id/reviewjourney/:path*","/user/trek/guidelist/trekdetails/:id/reviewjourney/:path*","/user/trip/booking-success","/user/trip/booking-failed","/user/trip/booking-processing","/user/trek/booking-success","/user/trek/booking-failed","/user/trek/booking-processing","/user/event/booking-success","/user/event/booking-failed","/user/event/booking-processing"].map(source => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] })),
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
