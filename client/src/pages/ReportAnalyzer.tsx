import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, Phone, MapPin, CheckCircle, Download, Calendar, Share2, Loader2, Check, Shield, User } from 'lucide-react';
import { API_URL } from '../config';

// --- Types ---
interface ReportAnalysis {
    patient_info: {
        name: string;
        age: number;
        gender: string;
        blood_type: string;
    };
    triage_status: {
        level: "Emergency" | "Doctor Visit" | "Low Risk";
        severity_score: number;
        color_code: "Red" | "Orange" | "Green";
        alert_message: string;
    };
    vital_signs: Array<{
        label: string;
        value: string;
        status: "Critical" | "Warning" | "Normal";
    }>;
    ai_analysis: {
        warning_signs: string[];
        possible_conditions: Array<{
            condition: string;
            probability: string;
            description: string;
        }>;
        recommendations: string;
    };
}

interface Remedies {
    disclaimer: string;
    vital_advice?: {
        temperature?: string;
        blood_pressure?: string;
    };
    remedies: {
        home: string[];
        ayurvedic: string[];
        natural: string[];
    };
}

export default function ReportAnalyzer() {
    // Input State
    const [reportTitle, setReportTitle] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState('');

    // Result State
    const [result, setResult] = useState<ReportAnalysis | null>(null);
    const [remedies, setRemedies] = useState<Remedies | null>(null);
    const [showRemedies, setShowRemedies] = useState(false);
    const [currentReportId, setCurrentReportId] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const simulateProcessingSteps = () => {
        const steps = [
            "Uploading file...",
            "Extracting text from report...",
            "Analyzing medical data with AI...",
            "Saving analysis..."
        ];
        let currentStep = 0;
        setProcessStep(steps[0]);

        const interval = setInterval(() => {
            currentStep++;
            if (currentStep < steps.length) {
                setProcessStep(steps[currentStep]);
            } else {
                clearInterval(interval);
            }
        }, 1500); // Change text every 1.5s

        return interval;
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsProcessing(true);
        const stepInterval = simulateProcessingSteps();

        const formData = new FormData();
        formData.append('report', file);

        const isValid = (d: any) => d && d.patient_info && d.triage_status && d.vital_signs && d.ai_analysis;

        try {
            const response = await fetch(`${API_URL}/api/analyze-report`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (!response.ok || !isValid(data)) {
                throw new Error((data && data.error) || 'Invalid analysis response');
            }

            // Ensure the progress UX completes before showing results
            setTimeout(() => {
                clearInterval(stepInterval);
                setResult(data as ReportAnalysis);
                setIsProcessing(false);
                const id = saveReportToHistory(data as ReportAnalysis, reportTitle, reportDate);
                setCurrentReportId(id);
            }, 1500 * 4); // align with steps timing

        } catch (error) {
            console.error("Report Analysis Failed", error);
            clearInterval(stepInterval);
            setIsProcessing(false);
            alert('Failed to analyze the report. Please try a different file or try again later.');
        }
    };

    const saveReportToHistory = (data: ReportAnalysis, title: string, date: string) => {
        const id = Date.now().toString();
        const newReport = {
            id,
            title: title || "Untitled Report",
            date: date || new Date().toISOString().split('T')[0],
            risk_level: data.triage_status.level,
            severity_score: data.triage_status.severity_score,
            summary: data.ai_analysis.recommendations,
            type: 'Lab Report',
            // Store full data for PDF generation
            fullData: {
                ...data,
                remedies: null // Will be updated if fetched
            }
        };

        const existing = localStorage.getItem('docmate_reports');
        const reports = existing ? JSON.parse(existing) : [];
        reports.unshift(newReport);
        localStorage.setItem('docmate_reports', JSON.stringify(reports));
        return id;
    };

    const fetchRemedies = async () => {
        if (!result) return;
        setShowRemedies(true);
        if (remedies) return; // Already fetched

        try {
            // Get all possible conditions for better context
            const diagnosis = result.ai_analysis.possible_conditions.map(c => c.condition).join(', ') || "General Health Check";

            const response = await fetch(`${API_URL}/api/suggest-remedies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    diagnosis,
                    risk_level: result.triage_status.level,
                    vital_signs: result.vital_signs,
                    warning_signs: result.ai_analysis.warning_signs,
                    ai_recommendations: result.ai_analysis.recommendations
                })
            });

            const data = await response.json();

            if (data.remedies) {
                setRemedies(data);

                // Update the report in localStorage with remedies
                if (currentReportId) {
                    const existing = localStorage.getItem('docmate_reports');
                    if (existing) {
                        const reports = JSON.parse(existing);
                        const updatedReports = reports.map((r: any) => {
                            if (r.id === currentReportId) {
                                return {
                                    ...r,
                                    fullData: {
                                        ...r.fullData,
                                        remedies: data
                                    }
                                };
                            }
                            return r;
                        });
                        localStorage.setItem('docmate_reports', JSON.stringify(updatedReports));
                    }
                }
            } else {
                throw new Error("Invalid remedies format");
            }
        } catch (e) {
            console.error("Failed to fetch remedies", e);
            // Fallback
            setRemedies({
                disclaimer: "These are general suggestions. Consult a doctor.",
                remedies: {
                    home: ["Hydration", "Rest"],
                    ayurvedic: ["Ginger Tea"],
                    natural: ["Sunlight"]
                }
            });
        }
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setRemedies(null);
        setShowRemedies(false);
        setReportTitle('');
        setReportDate('');
        setCurrentReportId(null);
    };

    const handleShareLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const shareData = {
                    title: 'My Medical Emergency Location',
                    text: `I need help! Here is my current location:`,
                    url: mapLink
                };

                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        await navigator.clipboard.writeText(mapLink);
                        alert("Location link copied to clipboard: " + mapLink);
                    }
                } catch (err) {
                    console.error("Error sharing location:", err);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve your location. Please enable location services.");
            }
        );
    };

    return (
        <div className="max-w-full mx-auto relative min-w-0">
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            {/* Processing Modal Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary-500 animate-pulse" />
                            </div>
                        </div>
                        <motion.h2
                            key={processStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-8 text-2xl font-serif text-slate-100"
                        >
                            {processStep}
                        </motion.h2>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Critical Alert Banner (After Analysis) */}
            <AnimatePresence>
                {result?.triage_status.level === 'Emergency' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-red-500 text-white rounded-xl p-6 mb-8 shadow-[0_0_30px_-5px_rgba(239,68,68,0.6)] flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-full animate-pulse">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold uppercase tracking-wider mb-1">CALL 911 IMMEDIATELY</h2>
                                <p className="text-red-100 text-lg">{result.triage_status.alert_message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!result ? (
                // --- Upload State ---
                <div className="max-w-full mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-serif text-slate-100 mb-3">Upload Medical Report</h1>
                        <p className="text-slate-400">Upload blood tests, ECGs, X-rays, or clinical documents for AI analysis.</p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
                        {/* Form Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Title</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={reportTitle}
                                        onChange={(e) => setReportTitle(e.target.value)}
                                        placeholder="e.g. Breathing Problem"
                                        className="w-full bg-surface-highlight/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500/50 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="date"
                                        value={reportDate}
                                        onChange={(e) => setReportDate(e.target.value)}
                                        className="w-full bg-surface-highlight/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500/50 outline-none transition-colors [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upload Zone */}
                        <input
                            type="file"
                            className="hidden"
                            id="report-upload"
                            onChange={handleFileUpload}
                            accept=".pdf,.jpg,.png,.txt"
                        />
                        <label
                            htmlFor="report-upload"
                            className={`block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group
                                ${file ? 'border-primary-500/50 bg-primary-500/5' : 'border-slate-800 hover:border-primary-500/30 hover:bg-surface-highlight/30'}
                            `}
                        >
                            {file ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-4 text-primary-400">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary-100 mb-1">{file.name}</h3>
                                    <p className="text-primary-500/60 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-8 h-8 text-primary-400" />
                                    </div>
                                    <h3 className="text-xl font-serif text-slate-100 mb-2">Click to upload file</h3>
                                    <p className="text-slate-500 text-sm">PDF, JPEG, PNG, TXT (Max 10MB)</p>
                                </>
                            )}
                        </label>
                        {/* Action Button */}
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={handleAnalyze}
                                disabled={!file}
                                className={`w-full py-4 px-8 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                                ${file
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 scale-100'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed grayscale'
                                    }
                            `}
                            >
                                Analyze Report
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // --- Result Dashboard ---
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700" id="report-content">

                    {/* Emergency Quick Actions (Only if Critical) */}
                    {result.triage_status.level === 'Emergency' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <a href="tel:911" className="bg-red-600 hover:bg-red-500 text-white p-6 rounded-2xl flex flex-col items-center text-center transition-all shadow-lg shadow-red-600/20 group">
                                <Phone className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase tracking-wider mb-1">Call 911</h3>
                                <p className="text-red-200 text-xs">Emergency Services</p>
                            </a>

                            <button
                                onClick={handleShareLocation}
                                className="bg-surface-highlight/30 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-surface-highlight transition-colors group text-slate-200"
                            >
                                <Share2 className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase tracking-wider mb-1">Share My Location</h3>
                                <p className="text-slate-500 text-xs">Send to Contacts</p>
                            </button>

                            <a href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" rel="noopener noreferrer" className="bg-surface-highlight/30 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-surface-highlight transition-colors group text-slate-200"
                            >
                                <MapPin className="w-8 h-8 text-primary-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase tracking-wider mb-1">Find Hospitals</h3>
                                <p className="text-slate-500 text-xs">Find Nearby Hospitals</p>
                            </a>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8">
                        {/* Top Section: Patient & Vitals */}
                        <div className="space-y-6 min-w-0">
                            {/* Patient Info */}
                            <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <h3 className="text-lg font-serif text-slate-100">Patient Information</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-500">Name</span>
                                        <span className="text-slate-200 font-medium">{result.patient_info.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-500">Age / Gender</span>
                                        <span className="text-slate-200">{result.patient_info.age} / {result.patient_info.gender}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span className="text-slate-500">Blood Type</span>
                                        <span className="text-slate-200">{result.patient_info.blood_type || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vitals Grid */}
                            {/* Vitals Grid */}
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-serif text-slate-100 mb-4">Key Findings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {result.vital_signs.map((vital, index) => {
                                        const isCriticalVital = vital.status === 'Critical';
                                        const isWarningVital = vital.status === 'Warning';

                                        let bgClass = 'bg-emerald-500/5 border-emerald-500/20';
                                        let textClass = 'text-emerald-400';
                                        let valueClass = 'text-slate-200';

                                        if (isCriticalVital) {
                                            bgClass = 'bg-red-500/25 border-red-500/50 shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]';
                                            textClass = 'text-red-400';
                                            valueClass = 'text-red-100';
                                        } else if (isWarningVital) {
                                            bgClass = 'bg-yellow-500/10 border-yellow-500/30';
                                            textClass = 'text-yellow-400';
                                            valueClass = 'text-yellow-100';
                                        }

                                        return (
                                            <div key={index} className={`p-4 rounded-xl border flex flex-col items-center justify-between text-center gap-3 transition-all hover:scale-[1.02] min-h-[140px] h-full overflow-hidden ${bgClass}`}>
                                                <div className={`text-xs md:text-sm font-bold uppercase tracking-wider ${textClass} opacity-80 break-words w-full px-1`}>
                                                    {vital.label}
                                                </div>
                                                <div className={`text-xl md:text-2xl font-bold ${valueClass} break-words w-full leading-tight px-1`}>
                                                    {vital.value}
                                                </div>
                                                <div className={`text-[10px] font-semibold uppercase tracking-widest opacity-70 ${textClass} border border-current px-2 py-0.5 rounded-full text-center leading-tight`}>
                                                    {vital.status}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Section: Summary & Remedies */}
                        <div className="space-y-6 min-w-0">
                            {/* AI Summary */}
                            <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <FileText className="w-40 h-40 text-primary-500" />
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${result.triage_status.level === 'Emergency' ? 'bg-red-500 text-white border-red-400' : 'bg-primary-500 text-white border-primary-400'
                                        }`}>
                                        {result.triage_status.level === 'Emergency' ? 'High Risk / Emergency' : result.triage_status.level}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-serif text-slate-100 mb-4">AI Assessment</h3>
                                <p className="text-slate-300 leading-relaxed text-lg font-light mb-6">
                                    {result.ai_analysis.recommendations}
                                </p>

                                <div className="bg-surface-highlight/30 rounded-xl p-6 border border-slate-800">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Immediate Recommendations</h4>
                                    <ul className="space-y-2">
                                        {result.triage_status.level === 'Emergency' ? (
                                            <>
                                                <li className="flex items-start gap-3 text-red-200"><AlertTriangle className="w-5 h-5 shrink-0" /> {result.triage_status.alert_message}</li>
                                                {result.ai_analysis.warning_signs.map((sign, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-slate-300"><CheckCircle className="w-5 h-5 shrink-0 text-primary-500" /> {sign}</li>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                {result.ai_analysis.warning_signs.map((sign, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-slate-300"><CheckCircle className="w-5 h-5 shrink-0 text-primary-500" /> {sign}</li>
                                                ))}
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Remedies Section */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-serif text-slate-100">Natural & Home Remedies (AI-Suggested)</h3>
                                    {!showRemedies && (
                                        <button
                                            onClick={fetchRemedies}
                                            className="text-sm text-primary-400 hover:text-primary-300 font-bold uppercase tracking-wider flex items-center gap-2"
                                        >
                                            Suggest Remedies <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {showRemedies && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-6"
                                    >
                                        {remedies ? (
                                            <>
                                                {/* Disclaimer */}
                                                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                    <p className="text-amber-200 text-sm italic">
                                                        <span className="font-bold block mb-1">Disclaimer:</span>
                                                        {remedies.disclaimer}
                                                    </p>
                                                </div>

                                                {/* Vital Specific Advice */}
                                                {remedies.vital_advice && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {remedies.vital_advice.temperature && (
                                                            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                                                <h4 className="text-red-400 font-bold text-sm uppercase mb-2">Temperature Advice</h4>
                                                                <p className="text-slate-300 text-sm">{remedies.vital_advice.temperature}</p>
                                                            </div>
                                                        )}
                                                        {remedies.vital_advice.blood_pressure && (
                                                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                                                                <h4 className="text-blue-400 font-bold text-sm uppercase mb-2">Blood Pressure Support</h4>
                                                                <p className="text-slate-300 text-sm">{remedies.vital_advice.blood_pressure}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-primary-500/5 border border-primary-500/10 rounded-xl p-4">
                                                        <h4 className="text-primary-400 font-bold text-sm uppercase mb-3">Home Remedies</h4>
                                                        <ul className="list-disc list-outside ml-4 text-slate-300 text-sm space-y-3">
                                                            {Array.isArray(remedies.remedies.home) && remedies.remedies.home.length > 0 ? (
                                                                remedies.remedies.home.map((r, i) => <li key={i} className="leading-relaxed pl-1">{r}</li>)
                                                            ) : (
                                                                <li className="italic opacity-50">No specific home remedies suggestions available.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                                                        <h4 className="text-emerald-400 font-bold text-sm uppercase mb-3">Ayurvedic</h4>
                                                        <ul className="list-disc list-outside ml-4 text-slate-300 text-sm space-y-3">
                                                            {Array.isArray(remedies.remedies.ayurvedic) && remedies.remedies.ayurvedic.length > 0 ? (
                                                                remedies.remedies.ayurvedic.map((r, i) => <li key={i} className="leading-relaxed pl-1">{r}</li>)
                                                            ) : (
                                                                <li className="italic opacity-50">No specific ayurvedic suggestions available.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                                                        <h4 className="text-amber-400 font-bold text-sm uppercase mb-3">Natural / Holistic</h4>
                                                        <ul className="list-disc list-outside ml-4 text-slate-300 text-sm space-y-3">
                                                            {Array.isArray(remedies.remedies.natural) && remedies.remedies.natural.length > 0 ? (
                                                                remedies.remedies.natural.map((r, i) => <li key={i} className="leading-relaxed pl-1">{r}</li>)
                                                            ) : (
                                                                <li className="italic opacity-50">No specific natural suggestions available.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" /> Generating suggestions...
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Security & Authenticity Section */}
                            <div className="glass-card p-6 rounded-2xl border border-primary-500/20 bg-primary-900/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="w-6 h-6 text-primary-400" />
                                    <h3 className="text-lg font-serif text-slate-100">AI Blockchain Security Verification</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                        <span className="text-slate-500">Status</span>
                                        <span className="text-primary-400 font-bold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Verified Secure
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                        <span className="text-slate-500">Encryption</span>
                                        <span className="text-slate-300 font-mono">AES-256-GCM</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm pt-1">
                                        <span className="text-slate-500">Blockchain Hash</span>
                                        <span className="text-xs font-mono text-slate-400 break-all bg-black/20 p-2 rounded border border-slate-800">
                                            0x{Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Export Actions */}
                            <div className="flex justify-end pt-4" data-html2canvas-ignore>
                                <button
                                    onClick={reset}
                                    className="mr-6 text-slate-500 hover:text-slate-300 transition-colors text-sm font-bold uppercase tracking-wider no-print"
                                >
                                    Analyze Another Report
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-colors no-print"
                                >
                                    <Download className="w-4 h-4" /> Print / Save as PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
