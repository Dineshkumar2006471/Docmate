import React, { useState, useEffect } from 'react';
import { FileText, Calendar, AlertTriangle, CheckCircle, ChevronRight, Download, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface SavedReport {
    id: string;
    date: string;
    title: string;
    risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
    summary: string;
    type: 'Symptom Check' | 'Lab Report';
}

export default function MyReports() {
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        // Load from LocalStorage
        const saved = localStorage.getItem('docmate_reports');
        if (saved) {
            setReports(JSON.parse(saved));
        } else {
            // Mock Data if empty
            setReports([
                { id: '1', date: '2023-11-15', title: 'Annual Blood Work', risk_level: 'Low', summary: 'All values within normal range.', type: 'Lab Report' },
                { id: '2', date: '2023-10-02', title: 'Stomach Pain Check', risk_level: 'Moderate', summary: 'Possible Gastritis. Recommended diet changes.', type: 'Symptom Check' },
                { id: '3', date: '2023-09-10', title: 'Urgent Care Visit', risk_level: 'High', summary: 'High fever and infection markers detected.', type: 'Lab Report' },
            ]);
        }
    }, []);

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(filter.toLowerCase()) ||
        r.summary.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-serif text-slate-100 mb-2">My Reports</h1>
                    <p className="text-slate-400">History of your medical analyses and symptom checks.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-surface-highlight/30 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-teal-500/50 outline-none"
                    />
                </div>
            </header>

            <div className="space-y-4">
                {filteredReports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-teal-500/30 transition-colors cursor-pointer"
                    >
                        {/* Icon & Date */}
                        <div className="flex items-center gap-4 min-w-[150px]">
                            <div className={`p-3 rounded-full ${report.type === 'Lab Report' ? 'bg-teal-500/10 text-teal-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{report.type}</div>
                                <div className="text-slate-200 font-medium flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-slate-500" /> {report.date}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h3 className="text-lg font-serif text-slate-100 mb-1 group-hover:text-teal-300 transition-colors">{report.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-1">{report.summary}</p>
                        </div>

                        {/* Status & Action */}
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${report.risk_level === 'Critical' || report.risk_level === 'High'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : report.risk_level === 'Moderate'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                }`}>
                                {report.risk_level}
                            </div>

                            <button className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-slate-200 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {filteredReports.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No reports found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
