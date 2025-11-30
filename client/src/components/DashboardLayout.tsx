import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Menu, AlertCircle } from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';

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

    const { isProfileComplete, loading: profileLoading } = useUserProfile();

    useEffect(() => {
        // Safety timeout for Auth check
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("Auth check timed out in DashboardLayout");
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate, loading]);

    // Profile Gatekeeping - REMOVED to allow navigation
    /*
    useEffect(() => {
        if (!loading && !profileLoading && !isProfileComplete && location.pathname !== '/profile') {
            navigate('/profile');
        }
    }, [loading, profileLoading, isProfileComplete, location.pathname, navigate]);
    */

    if (loading || profileLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const currentTitle = pageTitles[location.pathname] || 'DocMate';

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <div className="no-print h-full">
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

                <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {!loading && !profileLoading && !isProfileComplete && location.pathname !== '/profile' && (
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-3 text-amber-400">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">Profile Incomplete</p>
                                    <p className="text-xs text-amber-400/80">Complete your profile to enable personalized AI health insights.</p>
                                </div>
                            </div>
                            <Link
                                to="/profile"
                                className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 border border-amber-500/30 px-4 py-2 rounded-lg hover:bg-amber-500/10 transition-colors whitespace-nowrap"
                            >
                                Complete Profile
                            </Link>
                        </div>
                    )}
                    <Outlet />
                </main>

                {/* Medical Disclaimer Removed */}
            </div>
        </div>
    );
}
