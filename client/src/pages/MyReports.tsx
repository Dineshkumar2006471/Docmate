import React, { useState, useEffect } from 'react';
// DocMate Reports Dashboard
import { FileText, Calendar, AlertTriangle, CheckCircle, ChevronRight, Download, Search, Activity, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SavedReport {
    id: string;
    date: string;
    title: string;
    risk_level: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Emergency' | 'Doctor Visit';
    severity_score?: number;
    summary: string;
    type: 'Symptom Check' | 'Lab Report';
    warning_signs?: string[];
    top_condition?: string;
    probability?: string;
}

export default function MyReports() {
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [filter, setFilter] = useState('');
    const [stats, setStats] = useState({ total: 0, avgSeverity: 0, latestDate: 'N/A' });

    useEffect(() => {
        // Load from LocalStorage
        const saved = localStorage.getItem('docmate_reports');
        let loadedReports: SavedReport[] = [];

        if (saved) {
            try {
                loadedReports = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse reports", e);
            }
        }

        // If empty or invalid, use rich mock data for demonstration
        if (loadedReports.length === 0) {
            loadedReports = [
                {
                    id: '1',
                    date: '2023-11-29',
                    title: 'Viral Infection Check',
                    risk_level: 'High',
                    severity_score: 8.5,
                    summary: 'Symptoms indicate a strong likelihood of viral infection. Immediate rest and hydration recommended.',
                    type: 'Symptom Check',
                    top_condition: 'Viral Gastroenteritis',
                    probability: '85%',
                    warning_signs: ['High Fever > 101°F', 'Severe Dehydration', 'Persistent Vomiting']
                },
                {
                    id: '2',
                    date: '2023-11-15',
                    title: 'Annual Blood Work',
                    risk_level: 'Low',
                    severity_score: 2.1,
                    summary: 'All values within normal range. Cholesterol slightly elevated but manageable.',
                    type: 'Lab Report',
                    top_condition: 'Healthy',
                    probability: '98%',
                    warning_signs: []
                },
                {
                    id: '3',
                    date: '2023-10-02',
                    title: 'Stomach Pain Analysis',
                    risk_level: 'Moderate',
                    severity_score: 5.8,
                    summary: 'Possible Gastritis. Recommended diet changes and avoiding spicy foods.',
                    type: 'Symptom Check',
                    top_condition: 'Acute Gastritis',
                    probability: '72%',
                    warning_signs: ['Abdominal Tenderness']
                },
            ];
        }

        setReports(loadedReports);

        // Calculate Stats
        if (loadedReports.length > 0) {
            const total = loadedReports.length;
            const latest = loadedReports[0].date;

            // Calculate Average Severity
            const sumSeverity = loadedReports.reduce((acc, curr) => {
                let score = curr.severity_score;
                if (score === undefined) {
                    // Map risk to score if missing
                    if (curr.risk_level === 'Critical' || curr.risk_level === 'Emergency') score = 9;
                    else if (curr.risk_level === 'High') score = 7;
                    else if (curr.risk_level === 'Moderate' || curr.risk_level === 'Doctor Visit') score = 5;
                    else score = 2;
                }
                return acc + score;
            }, 0);

            setStats({
                total,
                latestDate: new Date(latest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                avgSeverity: parseFloat((sumSeverity / total).toFixed(1))
            });
        }

    }, []);

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(filter.toLowerCase()) ||
        r.summary.toLowerCase().includes(filter.toLowerCase()) ||
        (r.top_condition && r.top_condition.toLowerCase().includes(filter.toLowerCase()))
    );

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Critical':
            case 'Emergency':
            case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'Moderate':
            case 'Doctor Visit': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-primary-400 bg-primary-500/10 border-primary-500/20';
        }
    };

    const getRiskBadgeColor = (level: string) => {
        switch (level) {
            case 'Critical':
            case 'Emergency':
            case 'High': return 'bg-red-500 text-white';
            case 'Moderate':
            case 'Doctor Visit': return 'bg-amber-500 text-slate-900';
            default: return 'bg-primary-500 text-slate-900';
        }
    };

    return (
        <div className="max-w-full mx-auto pb-20 space-y-8">
            {/* 1. Aggregate Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Assessments */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Assessments</p>
                        <h3 className="text-4xl font-serif text-slate-100">{stats.total}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                </div>

                {/* Latest Assessment */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Latest Activity</p>
                        <h3 className="text-4xl font-serif text-slate-100">{stats.latestDate}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                </div>

                {/* Avg Severity */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Severity</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className={`text-4xl font-serif ${stats.avgSeverity > 7 ? 'text-red-400' : stats.avgSeverity > 4 ? 'text-amber-400' : 'text-primary-400'}`}>
                                {stats.avgSeverity}<span className="text-lg text-slate-500 font-sans">/10</span>
                            </h3>
                        </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${stats.avgSeverity > 5 ? 'bg-red-500/10 border-red-500/20' : 'bg-primary-500/10 border-primary-500/20'}`}>
                        <Activity className={`w-6 h-6 ${stats.avgSeverity > 5 ? 'text-red-400' : 'text-primary-400'}`} />
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-2xl font-serif text-slate-100">Report Timeline</h2>
                    <p className="text-slate-400 text-sm">Longitudinal record of your health assessments.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by condition (e.g., 'Fever')..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-surface-highlight/30 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:border-primary-500/50 outline-none transition-all focus:bg-surface-highlight/50"
                    />
                </div>
            </div>

            {/* 2. The Report Timeline (Main Feed) */}
            <div className="space-y-6">
                {filteredReports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-primary-500/30 transition-all group"
                    >
                        {/* Assessment Card Header */}
                        <div className="bg-surface-highlight/30 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getRiskBadgeColor(report.risk_level)}`}>
                                    {report.risk_level}
                                </span>
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {report.date}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                                {report.type}
                            </div>
                        </div>

                        {/* Assessment Card Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">

                            {/* Main Content */}
                            <div className="md:col-span-8 space-y-4">
                                <div>
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-slate-100">
                                            {report.top_condition || report.title}
                                        </h3>
                                        {report.probability && (
                                            <span className="text-primary-400 font-mono text-sm font-bold bg-primary-500/10 px-2 py-0.5 rounded">
                                                {report.probability} Probability
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                        {report.summary}
                                    </p>
                                </div>

                                {/* Warning Signs Section */}
                                {(report.warning_signs && report.warning_signs.length > 0) || (report.risk_level === 'High' || report.risk_level === 'Critical' || report.risk_level === 'Emergency') ? (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mr-2">
                                            <AlertTriangle className="w-4 h-4" /> Warning Signs:
                                        </div>
                                        {report.warning_signs ? (
                                            report.warning_signs.map((sign, i) => (
                                                <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded font-medium">
                                                    {sign}
                                                </span>
                                            ))
                                        ) : (
                                            // Fallback if no specific signs but high risk
                                            <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded font-medium">
                                                Critical Values Detected
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            {/* Actions / Footer */}
                            <div className="md:col-span-4 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                                <button className="w-full md:w-auto px-6 py-3 bg-surface-highlight hover:bg-primary-500 hover:text-slate-900 text-slate-300 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-500/20">
                                    View Report <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredReports.length === 0 && (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                    <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-slate-300 font-serif text-lg mb-1">No matching reports found</h3>
                    <p className="text-slate-500 text-sm">Try searching for a different condition or symptom.</p>
                </div>
            )}
        </div>
    );
}
