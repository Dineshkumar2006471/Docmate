import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Calendar, FileText, Activity, AlertTriangle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Assessment {
    id: string;
    created_date: any;
    symptoms_description: string;
    triage_level: string;
    severity_score: number;
    ai_analysis: {
        possible_conditions: { name: string; probability: number }[];
        recommendation: string;
        warning_signs: string[];
    };
    red_flags?: string[];
    vitals?: any;
}

export default function ReportViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'SymptomAssessment', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setReport({ id: docSnap.id, ...docSnap.data() } as Assessment);
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const handleDownloadPDF = () => {
        if (!report) return;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`Medical Report: ${report.ai_analysis.possible_conditions[0]?.name || 'Assessment'}`, 20, 20);
        doc.setFontSize(12);
        doc.text(`Date: ${new Date(report.created_date?.seconds * 1000).toLocaleDateString()}`, 20, 30);
        doc.text(`Triage Level: ${report.triage_level}`, 20, 40);
        doc.text(`Severity Score: ${report.severity_score}/10`, 20, 50);

        doc.text("Symptoms:", 20, 60);
        doc.setFontSize(10);
        const splitSymptoms = doc.splitTextToSize(report.symptoms_description, 170);
        doc.text(splitSymptoms, 20, 65);

        doc.save(`report_${report.id}.pdf`);
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading report...</div>;
    if (!report) return <div className="p-10 text-center text-slate-400">Report not found.</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 relative min-w-0">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Reports
            </button>

            <div className="glass-panel p-8 rounded-3xl border border-white/10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-serif text-slate-100 mb-2">
                            {report.ai_analysis.possible_conditions[0]?.name || "Medical Assessment"}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(report.created_date?.seconds * 1000).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${report.triage_level === 'Emergency' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    report.triage_level === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                }`}>
                                {report.triage_level}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-teal-400" /> Symptoms
                            </h3>
                            <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                {report.symptoms_description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" /> AI Analysis
                            </h3>
                            <div className="space-y-4">
                                {report.ai_analysis.possible_conditions.map((condition, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-slate-200 font-medium">{condition.name}</span>
                                        <span className="text-teal-400 font-bold">{condition.probability}% Match</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-surface-highlight/30 p-6 rounded-2xl border border-white/5 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Severity Score</div>
                            <div className="text-4xl font-serif text-slate-100 mb-2">{report.severity_score}/10</div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${report.severity_score > 7 ? 'bg-red-500' : report.severity_score > 4 ? 'bg-amber-500' : 'bg-teal-500'}`}
                                    style={{ width: `${report.severity_score * 10}%` }}
                                />
                            </div>
                        </div>

                        {report.red_flags && report.red_flags.length > 0 && (
                            <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                                <h4 className="text-red-400 font-bold flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-5 h-5" /> Warning Signs
                                </h4>
                                <ul className="space-y-2">
                                    {report.red_flags.map((flag, i) => (
                                        <li key={i} className="text-red-300 text-sm flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                                            {flag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
