import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MedicalDisclaimer from './MedicalDisclaimer';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Menu } from 'lucide-react';

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/symptom-check': 'AI Symptom Checker',
    '/report-analyzer': 'Medical Report Analyzer',
    '/chat': 'AI Health Assistant',
    '/profile': 'My Profile',
    '/my-reports': 'My Reports',
    '/settings': 'Settings'
};

export default function DashboardLayout() {
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const currentTitle = pageTitles[location.pathname] || 'DocMate';

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <div className="no-print">
                <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            </div>
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Background Noise/Gradient */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-teal-900/10 rounded-full blur-[120px]" />
                </div>

                {/* Dynamic Header */}
                <header className="h-20 border-b border-white/5 flex items-center px-4 md:px-8 z-10 bg-background/50 backdrop-blur-sm no-print gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-serif text-slate-100 truncate">{currentTitle}</h1>
                </header>

                <main className="flex-1 overflow-y-auto relative z-10 p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <Outlet />
                </main>

                <MedicalDisclaimer />
            </div>
        </div>
    );
}
