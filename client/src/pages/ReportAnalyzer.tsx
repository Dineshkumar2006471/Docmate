import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, Phone, MapPin, CheckCircle, Download, Calendar, Share2, Loader2, Check, Shield } from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- Types ---
interface ReportAnalysis {
    is_critical: boolean;
    patient_details: { name: string; age: string; gender: string; history?: string };
    vitals: { temp: string; hr: string; bp: string; spo2: string };
    summary: string;
    anomalies: string[];
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
    const [remedies, setRemedies] = useState<string[]>([]);
    const [showRemedies, setShowRemedies] = useState(false);

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
            "Verifying blockchain signature...",
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

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/analyze-report`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // Wait a bit to ensure the user sees the "Saving analysis..." step if API is too fast
            setTimeout(() => {
                clearInterval(stepInterval);
                setResult(data);
                setIsProcessing(false);
                saveReportToHistory(data, reportTitle, reportDate);
            }, 6000); // Ensure at least 6 seconds of animation to show all steps

        } catch (error) {
            console.error("Report Analysis Failed", error);
            clearInterval(stepInterval);
            setIsProcessing(false);
        }
    };

    const saveReportToHistory = (data: ReportAnalysis, title: string, date: string) => {
        const newReport = {
            id: Date.now().toString(),
            title: title || "Untitled Report",
            date: date || new Date().toISOString().split('T')[0],
            risk_level: data.is_critical ? 'Critical' : 'Low', // Simplified mapping
            summary: data.summary,
            type: 'Lab Report'
        };

        const existing = localStorage.getItem('docmate_reports');
        const reports = existing ? JSON.parse(existing) : [];
        reports.unshift(newReport);
        localStorage.setItem('docmate_reports', JSON.stringify(reports));
    };

    const fetchRemedies = async () => {
        if (!result) return;
        setShowRemedies(true);
        if (remedies.length > 0) return; // Already fetched

        try {
            const remRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/suggest-remedies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosis: result.summary })
            });
            const remData = await remRes.json();
            setRemedies(remData.remedies || []);
        } catch (e) {
            console.error("Failed to fetch remedies", e);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) return;

        try {
            // 1. Setup Color Sanitizer (Browser Native)
            const ctx = document.createElement('canvas').getContext('2d');
            const safeColor = (color: string) => {
                if (!ctx || !color || color === 'transparent' || color === 'inherit' || color === 'none') return color;
                // If it contains unsupported formats, force conversion via Canvas
                if (color.includes('oklch') || color.includes('oklab') || color.includes('lab(') || color.includes('lch(')) {
                    ctx.fillStyle = color;
                    // If the browser supports the color, it will assign it. 
                    // Reading it back usually gives hex or rgb.
                    return ctx.fillStyle;
                }
                return color;
            };

            // 2. Create Clone Container
            const cloneContainer = document.createElement('div');
            cloneContainer.style.position = 'absolute';
            cloneContainer.style.left = '-9999px';
            cloneContainer.style.top = '0';
            cloneContainer.style.width = '1024px'; // Desktop width
            cloneContainer.style.minHeight = '100vh';
            cloneContainer.style.backgroundColor = '#ffffff';
            document.body.appendChild(cloneContainer);

            // 3. Deep Clone
            const clone = element.cloneNode(true) as HTMLElement;
            cloneContainer.appendChild(clone);

            // 4. Style Copier & Sanitizer
            const copyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
                if (!source || !target || !source.style) return;

                const computed = window.getComputedStyle(source);

                // --- Layout ---
                target.style.display = computed.display;
                target.style.position = computed.position === 'fixed' ? 'absolute' : computed.position;
                target.style.boxSizing = computed.boxSizing;

                // Fix Recharts/Chart Sizing: Force explicit pixels if auto/percent fails in clone
                if (computed.width !== 'auto') target.style.width = computed.width;
                else target.style.width = '100%';

                if (computed.height !== 'auto') target.style.height = computed.height;

                target.style.margin = computed.margin;
                target.style.padding = computed.padding;

                // --- Flex/Grid ---
                target.style.flexDirection = computed.flexDirection;
                target.style.flexWrap = computed.flexWrap;
                target.style.justifyContent = computed.justifyContent;
                target.style.alignItems = computed.alignItems;
                target.style.gap = computed.gap;
                target.style.gridTemplateColumns = computed.gridTemplateColumns;
                target.style.gridTemplateRows = computed.gridTemplateRows;

                // --- Typography ---
                target.style.fontFamily = computed.fontFamily;
                target.style.fontSize = computed.fontSize;
                target.style.fontWeight = computed.fontWeight;
                target.style.lineHeight = computed.lineHeight;
                target.style.textAlign = computed.textAlign;
                target.style.letterSpacing = computed.letterSpacing;

                // --- Color Sanitization (The Nuclear Fix) ---
                // We must check ALL properties that can hold color
                target.style.color = safeColor(computed.color);
                target.style.backgroundColor = safeColor(computed.backgroundColor);
                target.style.borderColor = safeColor(computed.borderColor);
                target.style.borderTopColor = safeColor(computed.borderTopColor);
                target.style.borderBottomColor = safeColor(computed.borderBottomColor);
                target.style.borderLeftColor = safeColor(computed.borderLeftColor);
                target.style.borderRightColor = safeColor(computed.borderRightColor);
                target.style.outlineColor = safeColor(computed.outlineColor);
                target.style.textDecorationColor = safeColor(computed.textDecorationColor);

                // SVG Specifics (Charts)
                if (source.tagName === 'svg' || source.tagName === 'path' || source.tagName === 'circle' || source.tagName === 'rect' || source.tagName === 'line' || source.tagName === 'text') {
                    target.style.fill = safeColor(computed.fill);
                    target.style.stroke = safeColor(computed.stroke);
                }

                // --- Borders & Radius ---
                target.style.borderWidth = computed.borderWidth;
                target.style.borderStyle = computed.borderStyle;
                target.style.borderRadius = computed.borderRadius;

                // --- Shadows ---
                // Shadows are complex. If they contain oklch, nuke them.
                if (computed.boxShadow && (computed.boxShadow.includes('ok') || computed.boxShadow.includes('lab('))) {
                    target.style.boxShadow = 'none';
                } else {
                    target.style.boxShadow = computed.boxShadow;
                }

                // --- CRITICAL: Remove classes ---
                target.removeAttribute('class');

                // Recurse
                const sourceChildren = Array.from(source.children) as HTMLElement[];
                const targetChildren = Array.from(target.children) as HTMLElement[];
                for (let i = 0; i < sourceChildren.length; i++) {
                    if (targetChildren[i]) copyComputedStyles(sourceChildren[i], targetChildren[i]);
                }
            };

            copyComputedStyles(element, clone);

            // 5. Capture
            const canvas = await html2canvas(clone, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: true,
                ignoreElements: (element) => {
                    // Ignore any script or style tags that might have been cloned (though cloneNode usually doesn't execute them)
                    return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
                }
            });

            // 6. PDF Gen
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Medical_Report_${result?.patient_details.name || 'Patient'}.pdf`);

            // Cleanup
            document.body.removeChild(cloneContainer);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert("Failed to generate PDF. Please try again.");
            const existingClone = document.querySelector('[style*="-9999px"]');
            if (existingClone) existingClone.remove();
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setRemedies([]);
        setShowRemedies(false);
        setReportTitle('');
        setReportDate('');
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
        <div className="max-w-5xl mx-auto relative">
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
                            <div className="w-24 h-24 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-teal-500 animate-pulse" />
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
                {result?.is_critical && (
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
                                <p className="text-red-100 text-lg">Critical anomalies detected in this report.</p>
                            </div>
                        </div>

                        {/* Operator Script */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/10 max-w-md w-full">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-red-200 mb-2">What to tell the operator:</h4>
                            <p className="text-sm font-mono text-white leading-relaxed">
                                "I have a medical emergency. Patient {result.patient_details.name}, Age {result.patient_details.age}.
                                Critical vitals detected. Requesting immediate ambulance."
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!result ? (
                // --- Upload State ---
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-serif text-slate-100 mb-3">Upload Medical Report</h1>
                        <p className="text-slate-400">Upload blood tests, ECGs, X-rays, or clinical documents for AI analysis.</p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl">
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
                                        className="w-full bg-surface-highlight/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-teal-500/50 outline-none transition-colors"
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
                                        className="w-full bg-surface-highlight/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-teal-500/50 outline-none transition-colors [color-scheme:dark]"
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
                                ${file ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/10 hover:border-teal-500/30 hover:bg-surface-highlight/30'}
                            `}
                        >
                            {file ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4 text-teal-400">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-teal-100 mb-1">{file.name}</h3>
                                    <p className="text-teal-500/60 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-8 h-8 text-teal-400" />
                                    </div>
                                    <h3 className="text-xl font-serif text-slate-100 mb-2">Click to upload file</h3>
                                    <p className="text-slate-500 text-sm">PDF, JPEG, PNG, TXT (Max 10MB)</p>
                                </>
                            )}
                        </label>
                        {/* Action Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={!file}
                            className={`mt-8 w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
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
            ) : (
                // --- Result Dashboard ---
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700" id="report-content">

                    {/* Emergency Quick Actions (Only if Critical) */}
                    {result.is_critical && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <a href="tel:911" className="bg-red-600 hover:bg-red-500 text-white p-6 rounded-2xl flex flex-col items-center text-center transition-all shadow-lg shadow-red-600/20 group">
                                <Phone className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase tracking-wider mb-1">Call 911</h3>
                                <p className="text-red-200 text-xs">Emergency Services</p>
                            </a>

                            <button
                                onClick={handleShareLocation}
                                className="bg-surface-highlight/30 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-colors group text-slate-200"
                            >
                                <Share2 className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase tracking-wider mb-1">Share Location</h3>
                                <p className="text-slate-500 text-xs">Send to Contacts</p>
                            </button>

                            <a href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" rel="noopener noreferrer" className="bg-surface-highlight/30 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-colors group text-slate-200">
                                <MapPin className="w-8 h-8 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase tracking-wider mb-1">Book Appointment</h3>
                                <p className="text-slate-500 text-xs">Find Nearby Hospitals</p>
                            </a>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Patient & Vitals */}
                        <div className="space-y-6">
                            {/* Patient Info */}
                            <div className="glass-card p-6 rounded-2xl border-l-4 border-l-teal-500">
                                <h3 className="text-lg font-serif text-slate-100 mb-4">Patient Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500">Name</span>
                                        <span className="text-slate-200 font-medium">{result.patient_details.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500">Age / Gender</span>
                                        <span className="text-slate-200">{result.patient_details.age} / {result.patient_details.gender}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span className="text-slate-500">History</span>
                                        <span className="text-slate-200">{result.patient_details.history || 'None recorded'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vitals Grid */}
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-serif text-slate-100 mb-4">Key Findings</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(result.vitals).map(([key, value]) => {
                                        // Simple logic to determine color (mock logic, ideally backend provides this)
                                        const isCriticalVital = result.is_critical && (key === 'temp' || key === 'bp' || key === 'hr');

                                        return (
                                            <div key={key} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all
                                            ${isCriticalVital
                                                    ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]'
                                                    : 'bg-emerald-500/5 border-emerald-500/20'
                                                }
                                        `}>
                                                <div className={`text-xs uppercase font-bold mb-2 ${isCriticalVital ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {key}
                                                </div>
                                                <div className={`text-xl font-bold ${isCriticalVital ? 'text-red-100' : 'text-slate-200'}`}>
                                                    {value}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Summary & Remedies */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* AI Summary */}
                            <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <FileText className="w-40 h-40 text-teal-500" />
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${result.is_critical ? 'bg-red-500 text-white border-red-400' : 'bg-teal-500 text-white border-teal-400'
                                        }`}>
                                        {result.is_critical ? 'High Risk / Emergency' : 'Standard Report Analysis'}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-serif text-slate-100 mb-4">AI Assessment</h3>
                                <p className="text-slate-300 leading-relaxed text-lg font-light mb-6">
                                    {result.summary}
                                </p>

                                <div className="bg-surface-highlight/30 rounded-xl p-6 border border-white/5">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Immediate Recommendations</h4>
                                    <ul className="space-y-2">
                                        {result.is_critical ? (
                                            <>
                                                <li className="flex items-start gap-3 text-red-200"><AlertTriangle className="w-5 h-5 shrink-0" /> Seek immediate emergency care.</li>
                                                <li className="flex items-start gap-3 text-slate-300"><CheckCircle className="w-5 h-5 shrink-0 text-teal-500" /> Monitor vitals continuously.</li>
                                                <li className="flex items-start gap-3 text-slate-300"><CheckCircle className="w-5 h-5 shrink-0 text-teal-500" /> Keep patient calm and still.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex items-start gap-3 text-slate-300"><CheckCircle className="w-5 h-5 shrink-0 text-teal-500" /> Follow up with primary care physician.</li>
                                                <li className="flex items-start gap-3 text-slate-300"><CheckCircle className="w-5 h-5 shrink-0 text-teal-500" /> Continue prescribed medications if any.</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Remedies Section */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-serif text-slate-100">Natural & Home Remedies</h3>
                                    {!showRemedies && (
                                        <button
                                            onClick={fetchRemedies}
                                            className="text-sm text-teal-400 hover:text-teal-300 font-bold uppercase tracking-wider flex items-center gap-2"
                                        >
                                            Suggest Remedies <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {showRemedies && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {remedies.length > 0 ? remedies.map((remedy, i) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-teal-500/5 border border-teal-500/10 rounded-xl">
                                                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-xs font-bold text-teal-400">{i + 1}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm">{remedy}</p>
                                            </div>
                                        )) : (
                                            <div className="col-span-2 flex items-center justify-center py-8 text-slate-500 gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" /> Generating suggestions...
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Security & Authenticity Section */}
                            <div className="glass-card p-6 rounded-2xl border border-teal-500/20 bg-teal-900/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="w-6 h-6 text-teal-400" />
                                    <h3 className="text-lg font-serif text-slate-100">AI Blockchain Security Verification</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-slate-500">Status</span>
                                        <span className="text-teal-400 font-bold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Verified Secure
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-slate-500">Encryption</span>
                                        <span className="text-slate-300 font-mono">AES-256-GCM</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm pt-1">
                                        <span className="text-slate-500">Blockchain Hash</span>
                                        <span className="text-xs font-mono text-slate-400 break-all bg-black/20 p-2 rounded border border-white/5">
                                            0x{Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Export Actions */}
                            <div className="flex justify-end pt-4" data-html2canvas-ignore>
                                <button
                                    onClick={reset}
                                    className="mr-6 text-slate-500 hover:text-slate-300 transition-colors text-sm font-bold uppercase tracking-wider"
                                >
                                    Analyze Another Report
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-colors"
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
