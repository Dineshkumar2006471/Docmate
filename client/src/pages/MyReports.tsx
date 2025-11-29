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
        <div className="max-w-7xl mx-auto pb-20">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif text-slate-100 mb-2">My Reports</h1>
                    <p className="text-slate-400">History of your medical analyses and symptom checks.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-surface-highlight/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:border-teal-500/50 outline-none transition-all focus:bg-surface-highlight/50"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-5 rounded-2xl flex flex-col gap-4 group hover:border-teal-500/30 transition-all hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                    >
                        {/* Decorative Gradient */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${report.type === 'Lab Report' ? 'from-teal-500/10' : 'from-purple-500/10'} to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-3 rounded-xl ${report.type === 'Lab Report' ? 'bg-teal-500/10 text-teal-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${report.risk_level === 'Critical' || report.risk_level === 'High'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : report.risk_level === 'Moderate'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                }`}>
                                {report.risk_level}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                {report.type} <span className="w-1 h-1 rounded-full bg-slate-600" /> {report.date}
                            </div>
                            <h3 className="text-lg font-serif text-slate-100 mb-2 group-hover:text-teal-300 transition-colors line-clamp-1">{report.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{report.summary}</p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                            <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                                View Details
                            </button>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredReports.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-slate-300 font-serif text-lg mb-1">No reports found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
}
