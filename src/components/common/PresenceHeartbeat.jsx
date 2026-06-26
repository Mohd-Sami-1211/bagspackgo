'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PresenceHeartbeat
 *
 * Mounted once globally (in ClientLayout). Pings /api/presence every 20s to keep
 * this session counted in the site-wide "live now" number. Fire-and-forget; pauses
 * while the tab is hidden so backgrounded tabs don't inflate the count.
 */
const HEARTBEAT_MS = 20 * 1000;

export default function PresenceHeartbeat() {
    const pathname = usePathname();
    const pathRef = useRef(pathname);
    pathRef.current = pathname;

    useEffect(() => {
        const ping = () => {
            if (typeof document !== 'undefined' && document.hidden) return;
            fetch('/api/presence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: pathRef.current }),
                keepalive: true,
            }).catch(() => {});
        };

        // Initial ping + refresh when the tab becomes visible again
        ping();
        const interval = setInterval(ping, HEARTBEAT_MS);
        const onVisible = () => { if (!document.hidden) ping(); };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    return null;
}
