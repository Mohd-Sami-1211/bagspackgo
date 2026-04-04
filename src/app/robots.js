// src/app/robots.js — Controls search engine crawling
export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/serviceprovider/',
                    '/signin',
                    '/signup',
                    '/user/bookings/',
                    '/user/saved/',
                    '/user/notifications/',
                    '/user/help/',
                    '/user/provider/',
                ],
            },
        ],
        sitemap: 'https://bagspackgo.com/sitemap.xml',
    };
}
