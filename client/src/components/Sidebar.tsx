import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    FileText,
    MessageSquare,
    User,
    Files,
    LogOut,
    ChevronRight,
    HeartPulse,
    Menu,
    X
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const menuItems = [
    { icon: Stethoscope, label: 'Symptom Check', path: '/symptom-check' },
    { icon: FileText, label: 'Report Analyzer', path: '/report-analyzer' },
    { icon: MessageSquare, label: 'AI Chatbot', path: '/chat' },
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Files, label: 'My Reports', path: '/my-reports' },
];

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    // Mobile Sidebar Overlay
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <div className="bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                        <HeartPulse className="w-6 h-6 text-teal-400" />
                    </div>
                    {(!isCollapsed || mobileOpen) && (
                        <span className="text-xl font-serif font-bold text-slate-100 tracking-tight">
                            DocMate
                        </span>
                    )}
                </div>

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="hidden md:block p-1 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                >
                    {!isCollapsed && <Menu className="w-5 h-5" />}
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="md:hidden p-1 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="hidden md:block mx-auto mb-6 p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} onClick={onClose}>
                            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${isActive ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}
              `}>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-teal-500/10 border-l-2 border-teal-400"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-teal-400' : 'group-hover:text-teal-400 transition-colors'}`} />
                                {(!isCollapsed || mobileOpen) && (
                                    <span className="font-medium text-sm relative z-10">{item.label}</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className={`
            flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full
            ${isCollapsed && !mobileOpen ? 'justify-center' : ''}
          `}
                >
                    <LogOut className="w-5 h-5" />
                    {(!isCollapsed || mobileOpen) && <span className="font-medium text-sm">Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.div
                className={`
                    fixed md:relative inset-y-0 left-0 z-50 
                    bg-surface-highlight/95 md:bg-surface-highlight/30 backdrop-blur-xl border-r border-white/5 
                    transition-all duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isCollapsed ? 'md:w-20' : 'md:w-72'}
                    w-72
                `}
            >
                {sidebarContent}
            </motion.div>
        </>
    );
}
