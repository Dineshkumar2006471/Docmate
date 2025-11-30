import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, MessageSquare, ChevronRight, HeartPulse, ArrowRight, CheckCircle, Globe, Users, Zap, Menu, X, Star, Stethoscope, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-primary-200 selection:text-primary-900 overflow-x-hidden transition-colors duration-500">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-slate-800/5 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-50 p-2 rounded-lg">
                                <HeartPulse className="w-6 h-6 text-primary-600" />
                            </div>
                            <span className="text-2xl font-serif font-bold text-slate-100 tracking-tight">
                                DocMate
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <a href="#features" className="text-sm font-medium text-slate-400 hover:text-primary-600 transition-colors">Features</a>
                                <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-primary-600 transition-colors">How It Works</a>
                                <a href="#testimonials" className="text-sm font-medium text-slate-400 hover:text-primary-600 transition-colors">Stories</a>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 text-slate-400 hover:text-primary-600 transition-colors rounded-full hover:bg-slate-100"
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                                <Link to="/login">
                                    <button className="bg-primary-600 text-white px-6 py-2.5 rounded-sm font-medium text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 transform hover:-translate-y-0.5">
                                        Login / Sign In
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="md:hidden flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-slate-400 hover:text-primary-600 p-2"
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
                        className="md:hidden bg-background border-b border-slate-800/5 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">Features</a>
                            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">How It Works</a>
                            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">Stories</a>
                            <div className="pt-4">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <button className="w-full bg-primary-600 text-white px-6 py-3 rounded-sm font-medium text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/10">
                                        Login / Sign In
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-widest text-primary-700 uppercase bg-primary-50 rounded-full">
                            <Zap className="w-3 h-3" /> Intelligent Healthcare
                        </span>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight mb-6 text-slate-100 leading-[1.1]">
                            Your Health, <br />
                            <span className="text-primary-600 italic">Intelligently Managed.</span>
                        </h1>
                        <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed font-light">
                            Experience the future of personal medicine with advanced AI symptom analysis, real-time biometric monitoring, and secure health records.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/login">
                                <button className="btn-primary bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-sm text-base shadow-xl shadow-primary-900/20 hover:shadow-primary-900/30 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                                    Start Free Assessment <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <button className="px-8 py-4 rounded-sm text-base font-medium text-slate-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
                                <Globe className="w-5 h-5" /> How it works
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-slate-400">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                        <Users className="w-5 h-5" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <span className="font-bold text-slate-100 block">50,000+</span>
                                Patients Trusted
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Abstract Decorative Elements */}
                        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                        {/* Stylized Interface Mockup */}
                        <div className="relative bg-white rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                                </div>
                                <div className="ml-4 h-2 w-32 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-1/3 space-y-3">
                                        <div className="h-24 bg-primary-50 rounded-lg w-full"></div>
                                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                    </div>
                                    <div className="w-2/3 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="h-8 w-8 rounded-full bg-primary-100"></div>
                                            <div className="h-8 w-24 rounded-full bg-slate-100"></div>
                                        </div>
                                        <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 p-4">
                                            <div className="h-2 bg-slate-200 rounded w-full mb-2"></div>
                                            <div className="h-2 bg-slate-200 rounded w-full mb-2"></div>
                                            <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-10 flex-1 bg-primary-600 rounded-md"></div>
                                            <div className="h-10 w-10 bg-slate-100 rounded-md"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center gap-3 animate-float">
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">Analysis Complete</div>
                                <div className="text-slate-800 font-serif font-bold">No Critical Risks</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 bg-surface-highlight/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif text-slate-100 mb-4">Comprehensive Care Suite</h2>
                        <p className="text-slate-400 max-w-xl mx-auto font-light">
                            Everything you need to manage your health in one secure, intelligent platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 text-primary-600" />}
                            title="AI Symptom Checker"
                            description="Instant, medical-grade analysis of your symptoms with triage recommendations powered by Gemini 2.0."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-6 h-6 text-primary-600" />}
                            title="Viraj AI Assistant"
                            description="Your personal health companion. Ask questions, get remedies, and track your wellness journey 24/7."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Lock className="w-6 h-6 text-primary-600" />}
                            title="Blockchain Passport"
                            description="Your medical records, secured by blockchain technology. Immutable, private, and accessible only by you."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="absolute inset-0 bg-primary-100 rounded-2xl transform rotate-3"></div>
                            <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                                <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center">
                                    <Stethoscope className="w-16 h-16 text-slate-300" />
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-2">Step 01</div>
                            <h3 className="text-3xl font-serif text-slate-100 mb-4">Describe Your Symptoms</h3>
                            <p className="text-slate-400 leading-relaxed font-light">
                                Simply chat with our AI assistant or use the structured symptom checker. Describe how you're feeling in plain language, and our system will ask relevant follow-up questions to understand your condition.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-2">Step 02</div>
                            <h3 className="text-3xl font-serif text-slate-100 mb-4">Get Instant Analysis</h3>
                            <p className="text-slate-400 leading-relaxed font-light">
                                Within seconds, receive a comprehensive report detailing possible conditions, severity levels, and recommended next steps. Our AI cross-references your symptoms with millions of medical cases.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-100 rounded-2xl transform -rotate-3"></div>
                            <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                                <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center">
                                    <FileText className="w-16 h-16 text-slate-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-surface-highlight/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif text-slate-100 mb-4">Trusted by Thousands</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="DocMate saved me an unnecessary trip to the ER. The analysis was spot on and gave me peace of mind immediately."
                            author="Sarah Jenkins"
                            role="Patient"
                            rating={5}
                        />
                        <TestimonialCard
                            quote="The interface is so calming and easy to use. I finally feel in control of my family's health records."
                            author="Michael Chen"
                            role="Parent"
                            rating={5}
                        />
                        <TestimonialCard
                            quote="As a medical professional, I'm impressed by the accuracy of the triage system. It's a game changer."
                            author="Dr. Emily Weiss"
                            role="General Practitioner"
                            rating={5}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <HeartPulse className="w-6 h-6 text-primary-600" />
                                <span className="text-xl font-serif font-bold text-slate-900">DocMate</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                Empowering patients with AI-driven insights and secure health data management.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-4">Platform</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Symptom Checker</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Report Analyzer</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">AI Chatbot</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-4">Legal</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 text-center text-slate-400 text-xs">
                        &copy; 2024 DocMate Health AI. All rights reserved.
                    </div>
                </div>
            </footer>
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
            className="bg-white p-8 rounded-sm shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 border border-slate-50 group"
        >
            <div className="mb-6 p-3 bg-primary-50 rounded-lg w-fit group-hover:bg-primary-100 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-serif text-slate-100 mb-3 group-hover:text-primary-700 transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-light text-sm">
                {description}
            </p>
        </motion.div>
    );
}

function TestimonialCard({ quote, author, role, rating }: { quote: string, author: string, role: string, rating: number }) {
    return (
        <div className="bg-white p-8 rounded-sm shadow-lg shadow-slate-200/50 border border-slate-50">
            <div className="flex gap-1 mb-4">
                {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary-500 fill-current" />
                ))}
            </div>
            <blockquote className="text-lg font-serif text-slate-100 mb-6 italic leading-relaxed">
                "{quote}"
            </blockquote>
            <div>
                <div className="font-bold text-slate-900 text-sm">{author}</div>
                <div className="text-slate-400 text-xs uppercase tracking-wider">{role}</div>
            </div>
        </div>
    );
}
