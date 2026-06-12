/** @type {import('next').NextConfig} */
const nextConfig = {
    // Prevent sharp (native Node addon) from being bundled for the browser
    serverExternalPackages: ['sharp'],
    experimental: {
        serverActions: {
            bodySizeLimit: '15mb',
        },
    },
    // Increase body size limit for API route handlers (App Router)
    api: {
        bodyParser: {
            sizeLimit: '15mb',
        },
    },
    async headers() {
        return [
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
