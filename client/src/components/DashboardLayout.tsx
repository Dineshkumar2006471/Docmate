import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Menu } from 'lucide-react';
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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Profile Gatekeeping
    useEffect(() => {
        if (!loading && !profileLoading && !isProfileComplete && location.pathname !== '/profile') {
            navigate('/profile');
        }
    }, [loading, profileLoading, isProfileComplete, location.pathname, navigate]);

    const [showDebug, setShowDebug] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowDebug(true);
        }, 8000); // Show debug info if loading takes more than 8 seconds
        return () => clearTimeout(timer);
    }, []);

    if (loading || profileLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-xl font-serif text-slate-100 mb-2">
                    {loading ? 'Verifying Authentication...' : 'Loading User Profile...'}
                </h2>
                <p className="text-slate-400 text-sm animate-pulse">Please wait while we secure your connection.</p>

                {showDebug && (
                    <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-red-400 font-bold mb-2 flex items-center justify-center gap-2">
                            ⚠️ Taking longer than expected?
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">
                            The connection to the server or database seems slow or blocked.
                        </p>
                        <div className="text-left bg-black/30 p-4 rounded-lg font-mono text-xs text-slate-400 space-y-2 overflow-x-auto">
                            <div>API URL: {import.meta.env.VITE_API_URL || 'Not Set (Using Default)'}</div>
                            <div>Firebase Key: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Present ✅' : 'Missing ❌'}</div>
                            <div>Auth Status: {loading ? 'Checking...' : 'Authenticated ✅'}</div>
                            <div>Profile Status: {profileLoading ? 'Loading...' : 'Loaded ✅'}</div>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                )}
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
                    <Outlet />
                </main>

                {/* Medical Disclaimer Removed */}
            </div>
        </div>
    );
}
