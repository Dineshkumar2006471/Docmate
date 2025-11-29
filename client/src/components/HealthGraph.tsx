import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Heart, Zap, Thermometer, ArrowUpRight, MoreHorizontal, User, MessageSquare, Droplets } from 'lucide-react';
import clsx from 'clsx';
import { auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { useHealthData } from '../hooks/useHealthData';

// --- Mock Data for Sleep (still static as it's nightly) ---
const sleepData = [
    { day: 'Mon', hours: 7.2, quality: 85 },
    { day: 'Tue', hours: 6.5, quality: 70 },
    { day: 'Wed', hours: 8.0, quality: 92 },
    { day: 'Thu', hours: 7.5, quality: 88 },
    { day: 'Fri', hours: 5.5, quality: 60 },
    { day: 'Sat', hours: 9.0, quality: 95 },
    { day: 'Sun', hours: 8.2, quality: 90 },
];

// --- Components ---

const Card = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        className={clsx("glass-card p-6 relative overflow-hidden group", className)}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        {children}
    </motion.div>
);

const StatValue = ({ value, unit, label, trend, colorClass = "text-slate-100" }: { value: string | number, unit?: string, label: string, trend?: string, colorClass?: string }) => (
    <div className="flex flex-col">
        <span className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-1">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className={`text-3xl md:text-4xl font-serif font-light ${colorClass}`}>{value}</span>
            {unit && <span className="text-sm text-slate-500 font-sans">{unit}</span>}
        </div>
        {trend && (
            <div className="flex items-center gap-1 mt-2 text-teal-300 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
            </div>
        )}
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-white/10 p-3 shadow-xl backdrop-blur-md">
                <p className="text-slate-400 text-xs mb-1 font-sans uppercase tracking-wider">{label}</p>
                <p className="text-teal-300 font-serif text-xl">
                    {payload[0].value} <span className="text-xs font-sans text-slate-500">BPM</span>
                </p>
                {payload[0].payload.activity && (
                    <p className="text-slate-500 text-xs mt-1 italic">{payload[0].payload.activity}</p>
                )}
            </div>
        );
    }
    return null;
};

export default function HealthGraph() {
    const [user, setUser] = useState<any>(null);
    const { vitals, heartRateHistory } = useHealthData();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen min-w-0 bg-background text-slate-200 font-sans selection:bg-teal-300/20 relative overflow-hidden">
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                            <User className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">Welcome Back</h2>
                            <p className="text-slate-200 font-medium">{user?.displayName || user?.email || 'Guest User'}</p>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-slate-100 leading-tight">
                        Health <span className="italic text-slate-500">Overview</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-4"
                >
                    <Link to="/chat" className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-slate-900 rounded-full font-bold uppercase tracking-wider hover:bg-teal-400 transition-colors shadow-[0_0_20px_-5px_rgba(20,184,166,0.4)]">
                        <MessageSquare className="w-4 h-4" /> Chat with Aura
                    </Link>
                </motion.div>
            </header>

            {/* Main Grid */}
            <main className="grid grid-cols-1 md:grid-cols-12 gap-6 min-w-0">

                {/* Primary Chart - Heart Rate */}
                <Card className="col-span-1 md:col-span-8 min-h-[400px] flex flex-col min-w-0" delay={0.1}>
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-900/30 rounded-full border border-teal-800/50 relative">
                                <Heart className="w-5 h-5 text-teal-300" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-teal-400 rounded-full animate-ping" />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif text-slate-100">Live Heart Rate</h3>
                                <p className="text-slate-500 text-sm">Real-time monitoring via sensor simulation</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-serif text-teal-300">{vitals.heartRate} <span className="text-sm font-sans text-slate-500">BPM</span></div>
                        </div>
                    </div>

                    <div className="flex-1 w-full h-full min-h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200}>
                            <AreaChart data={heartRateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Plus Jakarta Sans' }}
                                    dy={10}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#14b8a6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorHeart)"
                                    isAnimationActive={false} // Disable animation for smoother real-time updates
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Side Stats */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-6 min-w-0">
                    <Card className="flex-1" delay={0.2}>
                        <div className="flex items-start justify-between mb-4">
                            <Activity className="w-6 h-6 text-secondary-400" />
                            <span className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse" />
                        </div>
                        <StatValue value={vitals.glucose} unit="mg/dL" label="Glucose Level" trend="Live" />
                        <div className="mt-6 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary-400 transition-all duration-1000" style={{ width: `${(vitals.glucose / 200) * 100}%` }} />
                        </div>
                    </Card>

                    <Card className="flex-1" delay={0.3}>
                        <div className="flex items-start justify-between mb-4">
                            <Thermometer className="w-6 h-6 text-orange-400" />
                        </div>
                        <StatValue value={vitals.temperature} unit="°F" label="Body Temp" colorClass={vitals.temperature > 99 ? "text-orange-400" : "text-slate-100"} />
                        <p className="mt-4 text-slate-500 text-sm leading-relaxed">
                            {vitals.temperature > 99 ? "Temperature slightly elevated." : "Temperature is within normal range."}
                        </p>
                    </Card>

                    <Card className="flex-1" delay={0.35}>
                        <div className="flex items-start justify-between mb-4">
                            <Droplets className="w-6 h-6 text-blue-400" />
                        </div>
                        <StatValue value={`${vitals.systolic}/${vitals.diastolic}`} unit="mmHg" label="Blood Pressure" />
                    </Card>
                </div>

                {/* Sleep Analysis Bar Chart */}
                <Card className="col-span-1 md:col-span-6 min-h-[300px] min-w-0" delay={0.4}>
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-serif text-slate-100">Sleep Quality Index</h3>
                    </div>
                    <div className="h-[200px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={150}>
                            <BarChart data={sleepData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0a1414', borderColor: '#334155', color: '#f1f5f9' }}
                                />
                                <Bar dataKey="quality" radius={[4, 4, 0, 0]}>
                                    {sleepData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.quality > 80 ? '#14b8a6' : '#94a3b8'} fillOpacity={entry.quality > 80 ? 0.8 : 0.3} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* AI Insight Card */}
                <Card className="col-span-1 md:col-span-6 bg-gradient-to-br from-teal-900/20 to-transparent border-teal-500/20" delay={0.5}>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <span className="inline-block px-2 py-1 bg-teal-500/10 border border-teal-500/20 rounded text-[10px] uppercase tracking-widest text-teal-300 mb-4">
                                AI Analysis
                            </span>
                            <h3 className="text-2xl font-serif text-slate-100 mb-3">Pattern Detected</h3>
                            <p className="text-slate-400 leading-relaxed font-light">
                                "We've noticed a correlation between your <span className="text-slate-200 font-medium">late-night work sessions</span> and elevated morning heart rate. Consider shifting focus time to 10:00 AM."
                            </p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
                            <button className="text-sm text-teal-300 hover:text-teal-200 transition-colors uppercase tracking-wider font-medium">
                                View Details
                            </button>
                            <button className="text-sm text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider font-medium">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </Card>

            </main>
        </div>
    );
}
