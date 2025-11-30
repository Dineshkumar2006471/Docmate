import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, MessageSquare, ChevronRight, HeartPulse, ArrowRight, CheckCircle, Globe, Users, Zap, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TypewriterText } from '../components/TypewriterText';

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="min-h-screen bg-background text-slate-200 selection:bg-primary-300/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed w-full z-50 glass-panel border-b-0 border-b-slate-700/50 rounded-none top-0 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 p-2.5 rounded-xl border border-white/10 shadow-lg shadow-primary-500/10">
                                <HeartPulse className="w-6 h-6 text-primary-300" />
                            </div>
                            <span className="text-2xl font-serif font-bold text-slate-100 tracking-tight">
                                DocMate
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <a href="#features" className="text-sm font-medium text-slate-300 hover:text-primary-300 transition-colors">Features</a>
                                <a href="#technology" className="text-sm font-medium text-slate-300 hover:text-primary-300 transition-colors">Technology</a>
                                <a href="#about" className="text-sm font-medium text-slate-300 hover:text-primary-300 transition-colors">About</a>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link to="/login">
                                <button className="btn-primary group relative overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Login / Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </Link>
                        </div>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-slate-300 hover:text-white p-2"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-surface-highlight/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <a
                                href="#features"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#technology"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Technology
                            </a>
                            <a
                                href="#about"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                About
                            </a>
                            <div className="pt-4">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <button className="w-full btn-primary group relative overflow-hidden justify-center">
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Login / Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
                <div className="hero-gradient absolute inset-0 -z-10 opacity-50 pointer-events-none"></div>

                {/* Animated Background Blobs */}
                <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-400/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-primary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="text-center py-20 lg:py-32 relative">
                    {/* Floating Elements */}
                    <div className="absolute top-0 right-10 animate-float opacity-20 hidden lg:block">
                        <Activity className="w-24 h-24 text-primary-300" />
                    </div>
                    <div className="absolute bottom-0 left-10 animate-float opacity-20 hidden lg:block" style={{ animationDelay: '2s' }}>
                        <Shield className="w-20 h-20 text-primary-300" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="animate-in-fade-up stagger-1"
                    >
                        <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-widest text-primary-400 uppercase bg-primary-900/30 border border-primary-500/30 rounded-sm shadow-[0_0_15px_-3px_rgba(204,255,0,0.3)]"
                        >
                            <Zap className="w-3 h-3" /> Next Generation AI Healthcare
                        </motion.span>

                        <h1 className="text-5xl md:text-7xl font-[Poppins] font-normal tracking-tight mb-8 text-slate-100 leading-tight text-glow min-h-[1.2em] break-words">
                            <TypewriterText text="Your Health," delay={0.5} speed={0.03} /> <br className="md:hidden" />
                            <span className="text-gradient-premium italic block md:inline">
                                <TypewriterText text="Intelligently Managed." delay={1} speed={0.03} />
                            </span>
                        </h1>

                        <p className="mt-6 text-lg md:text-xl text-slate-400 w-full md:max-w-2xl mx-auto mb-12 font-sans font-light leading-relaxed animate-in-fade-up stagger-2 px-2">
                            Experience the future of personal medicine with advanced AI symptom analysis, real-time biometric monitoring, and blockchain-secured health records.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in-fade-up stagger-3 w-full px-4">
                            <Link to="/login" className="w-full sm:w-auto">
                                <button className="btn-primary text-sm px-10 py-4 flex items-center justify-center gap-3 text-base shadow-[0_0_30px_-5px_rgba(204,255,0,0.2)] hover:shadow-[0_0_40px_-5px_rgba(204,255,0,0.4)] w-full sm:w-auto">
                                    Start Free Assessment <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <button className="text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest border-b border-transparent hover:border-primary-400 pb-1 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> View Global Impact
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Stats / Trust Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm rounded-sm mb-20 animate-in-fade-up stagger-4">
                    <StatItem number="99.9%" label="System Uptime" />
                    <StatItem number="50k+" label="Patient Reports" />
                    <StatItem number="24/7" label="AI Availability" />
                    <StatItem number="AES-256" label="Bank-Grade Security" />
                </div>

                {/* Features Grid */}
                <div id="features" className="relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif text-slate-100 mb-4">Comprehensive Care Suite</h2>
                        <p className="text-slate-400 max-w-xl mx-auto font-mono text-sm">Everything you need to manage your health in one secure, intelligent platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Activity className="w-8 h-8 text-primary-400" />}
                            title="AI Symptom Checker"
                            description="Instant, medical-grade analysis of your symptoms with triage recommendations powered by Gemini 2.0."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-8 h-8 text-primary-300" />}
                            title="Viraj AI Assistant"
                            description="Your personal health companion. Ask questions, get remedies, and track your wellness journey 24/7."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-primary-200" />}
                            title="Blockchain Passport"
                            description="Your medical records, secured by blockchain technology. Immutable, private, and accessible only by you."
                            delay={0.6}
                        />
                    </div>
                </div>
            </main >

            {/* Footer */}
            < footer className="border-t border-white/10 bg-surface-highlight/20 mt-20" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <HeartPulse className="w-6 h-6 text-primary-300" />
                                <span className="text-xl font-serif font-bold text-slate-100">DocMate</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                Empowering patients with AI-driven insights and secure health data management.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-slate-100 font-bold uppercase tracking-wider text-xs mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-primary-300 transition-colors">Symptom Checker</a></li>
                                <li><a href="#" className="hover:text-primary-300 transition-colors">Report Analyzer</a></li>
                                <li><a href="#" className="hover:text-primary-300 transition-colors">AI Chatbot</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-100 font-bold uppercase tracking-wider text-xs mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-primary-300 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-300 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-primary-300 transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 mt-12 pt-8 text-center text-slate-600 text-xs">
                        &copy; 2024 DocMate Health AI. All rights reserved.
                    </div>
                </div>
            </footer >
        </div >
    );
}

function StatItem({ number, label }: { number: string, label: string }) {
    return (
        <div className="text-center">
            <div className="text-3xl md:text-4xl font-serif font-bold text-slate-100 mb-1">{number}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</div>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="glass-card p-8 group cursor-pointer relative overflow-hidden rounded-sm hover:bg-surface-highlight/50 hover:box-glow"
        >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-6 h-6 text-primary-300 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div className="mb-6 p-4 bg-surface-highlight rounded-sm border border-white/5 w-fit group-hover:border-primary-500/30 transition-colors duration-300 shadow-lg">
                {icon}
            </div>
            <h3 className="text-2xl font-serif text-slate-100 mb-3 group-hover:text-primary-200 transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-sans font-light text-sm group-hover:text-slate-300 transition-colors">
                {description}
            </p>
        </motion.div>
    );
}
