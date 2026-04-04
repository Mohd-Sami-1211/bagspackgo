import { AdminProvider } from '@/context/AdminContext';
import '../globals.css';

export const metadata = {
    title: 'Admin Panel — bagspackgo',
    description: 'bagspackgo internal administration panel',
    robots: 'noindex, nofollow',
};

export default function AdminRootLayout({ children }) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-white">
            <AdminProvider>
                {children}
            </AdminProvider>
        </div>
    );
}
