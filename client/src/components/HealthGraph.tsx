import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Heart, Zap, Thermometer, ArrowUpRight, MoreHorizontal, User, MessageSquare, Droplets, FileText, Moon, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { useHealthData } from '../hooks/useHealthData';

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
            <div className="flex items-center gap-1 mt-2 text-primary-300 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
            </div>
        )}
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-slate-800 p-3 shadow-xl backdrop-blur-md">
                <p className="text-slate-400 text-xs mb-1 font-sans uppercase tracking-wider">{label}</p>
                <p className="text-primary-300 font-serif text-xl">
                    {payload[0].value} <span className="text-xs font-sans text-slate-500">
                        {payload[0].name === 'severity' ? 'Score' : 'BPM'}
                    </span>
                </p>
                {payload[0].payload.activity && (
                    <p className="text-slate-500 text-xs mt-1 italic">{payload[0].payload.activity}</p>
                )}
                {payload[0].payload.title && (
                    <p className="text-slate-500 text-xs mt-1 italic">{payload[0].payload.title}</p>
                )}
            </div>
        );
    }
    return null;
};

export default function HealthGraph() {
    const [user, setUser] = useState<any>(null);
    const { vitals, heartRateHistory } = useHealthData();
    const [reportHistory, setReportHistory] = useState<any[]>([]);
    const [latestInsight, setLatestInsight] = useState<string | null>(null);

    // Derived Metrics
    const [healthScore, setHealthScore] = useState<number>(95);
    const [sleepStats, setSleepStats] = useState<{ hours: string, quality: string }>({ hours: '7h 30m', quality: 'Good' });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });

        // Load Report History
        const loadReports = () => {
            try {
                const existing = localStorage.getItem('docmate_reports');
                if (existing) {
                    const reports = JSON.parse(existing);
                    // Process reports for graph
                    const processed = reports.map((r: any) => {
                        let score = r.severity_score;
                        if (!score) {
                            if (r.risk_level === 'Emergency') score = 9;
                            else if (r.risk_level === 'Doctor Visit') score = 6;
                            else score = 2;
                        }
                        return {
                            date: r.date,
                            severity: score,
                            title: r.title,
                            risk: r.risk_level
                        };
                    }).reverse(); // Show oldest to newest

                    setReportHistory(processed.slice(-7));

                    // Set latest insight & Calculate derived metrics
                    if (reports.length > 0) {
                        const latest = reports[0];
                        setLatestInsight(latest.summary);

                        // Calculate Health Score (Inverse of Severity)
                        // Severity 1-10. Health 100-0 roughly.
                        // Formula: 100 - (Severity * 8) - (Random fluctuation based on risk)
                        let severity = latest.severity_score || (latest.risk_level === 'Emergency' ? 9 : latest.risk_level === 'Doctor Visit' ? 6 : 2);
                        let calculatedHealth = Math.max(10, 100 - (severity * 8));
                        setHealthScore(calculatedHealth);

                        // Calculate Sleep Stats based on Severity/Risk
                        if (severity > 7) {
                            setSleepStats({ hours: '5h 15m', quality: 'Disturbed' });
                        } else if (severity > 4) {
                            setSleepStats({ hours: '6h 30m', quality: 'Fair' });
                        } else {
                            setSleepStats({ hours: '7h 45m', quality: 'Excellent' });
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load reports", e);
            }
        };

        loadReports();

        // Listen for storage updates (in case report is added in another tab)
        window.addEventListener('storage', loadReports);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', loadReports);
        };
    }, []);

    return (
        <div className="w-full min-w-0 text-slate-200 font-sans selection:bg-primary-300/20 relative">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                            <User className="w-5 h-5 text-primary-400" />
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
                    <Link to="/chat" className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-slate-900 rounded-full font-bold uppercase tracking-wider hover:bg-primary-400 transition-colors shadow-[0_0_20px_-5px_rgba(163,230,53,0.4)]">
                        <MessageSquare className="w-4 h-4" /> Chat with Viraj
                    </Link>
                </motion.div>
            </header>

            {/* Main Grid */}
            <main className="grid grid-cols-1 md:grid-cols-12 gap-6 min-w-0">

                {/* Primary Chart - Heart Rate */}
                <Card className="col-span-1 md:col-span-8 min-h-[400px] flex flex-col min-w-0" delay={0.1}>
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-900/30 rounded-full border border-primary-800/50 relative">
                                <Heart className="w-5 h-5 text-primary-300" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-primary-400 rounded-full animate-ping" />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif text-slate-100">Live Heart Rate</h3>
                                <p className="text-slate-500 text-sm">Real-time monitoring via sensor simulation</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-serif text-primary-300">{vitals.heartRate} <span className="text-sm font-sans text-slate-500">BPM</span></div>
                        </div>
                    </div>

                    <div className="flex-1 w-full h-full min-h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200}>
                            <AreaChart data={heartRateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#aacc00" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#aacc00" stopOpacity={0} />
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
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#aacc00', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#aacc00"
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
                    {/* Health Condition Score */}
                    <Card className="flex-1" delay={0.2}>
                        <div className="flex items-start justify-between mb-4">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex items-end justify-between">
                            <StatValue
                                value={healthScore}
                                unit="/ 100"
                                label="Health Condition"
                                colorClass={healthScore > 80 ? "text-emerald-400" : healthScore > 50 ? "text-orange-400" : "text-red-400"}
                            />
                            <div className="h-12 w-12 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                                <span className={clsx("absolute inset-0 rounded-full border-4 border-transparent border-t-current rotate-45",
                                    healthScore > 80 ? "text-emerald-400" : healthScore > 50 ? "text-orange-400" : "text-red-400"
                                )} style={{ transform: `rotate(${healthScore * 3.6}deg)` }}></span>
                                <span className="text-[10px] font-bold text-slate-400">{healthScore}%</span>
                            </div>
                        </div>
                        <p className="mt-4 text-slate-500 text-sm leading-relaxed">
                            Based on recent analysis. {healthScore > 80 ? "You are in good shape." : "Attention required."}
                        </p>
                    </Card>

                    {/* Sleep Stats */}
                    <Card className="flex-1" delay={0.3}>
                        <div className="flex items-start justify-between mb-4">
                            <Moon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <StatValue value={sleepStats.hours} label="Night Sleep" />
                        <div className="mt-2 flex items-center gap-2">
                            <span className={clsx("text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                sleepStats.quality === 'Excellent' || sleepStats.quality === 'Good' ? "bg-indigo-500/20 text-indigo-300" : "bg-orange-500/20 text-orange-300"
                            )}>
                                {sleepStats.quality}
                            </span>
                        </div>
                    </Card>

                    <Card className="flex-1" delay={0.35}>
                        <div className="flex items-start justify-between mb-4">
                            <Droplets className="w-6 h-6 text-blue-400" />
                        </div>
                        <StatValue value={`${vitals.systolic}/${vitals.diastolic}`} unit="mmHg" label="Blood Pressure" />
                    </Card>
                </div>

                {/* Report Analysis History Chart */}
                <Card className="col-span-1 md:col-span-6 min-h-[300px] min-w-0" delay={0.4}>
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-serif text-slate-100">Report Severity Trends</h3>
                    </div>
                    {reportHistory.length > 0 ? (
                        <div className="h-[200px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={150}>
                                <BarChart data={reportHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        content={<CustomTooltip />}
                                    />
                                    <Bar dataKey="severity" radius={[4, 4, 0, 0]}>
                                        {reportHistory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.severity > 7 ? '#ef4444' : entry.severity > 4 ? '#f97316' : '#aacc00'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-slate-500">
                            <FileText className="w-8 h-8 mb-2 opacity-50" />
                            <p>No reports analyzed yet.</p>
                            <Link to="/report-analyzer" className="text-primary-400 text-sm mt-2 hover:underline">Upload a report</Link>
                        </div>
                    )}
                </Card>

                {/* AI Insight Card */}
                <Card className="col-span-1 md:col-span-6 bg-gradient-to-br from-primary-900/20 to-transparent border-primary-500/20" delay={0.5}>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <span className="inline-block px-2 py-1 bg-primary-500/10 border border-primary-500/20 rounded text-[10px] uppercase tracking-widest text-primary-300 mb-4">
                                AI Analysis
                            </span>
                            <h3 className="text-2xl font-serif text-slate-100 mb-3">Latest Insight</h3>
                            <p className="text-slate-400 leading-relaxed font-light line-clamp-3">
                                {latestInsight || "We've noticed a correlation between your late-night work sessions and elevated morning heart rate. Consider shifting focus time to 10:00 AM."}
                            </p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-800 flex gap-4">
                            <Link to="/report-analyzer" className="text-sm text-primary-300 hover:text-primary-200 transition-colors uppercase tracking-wider font-medium">
                                View Reports
                            </Link>
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
