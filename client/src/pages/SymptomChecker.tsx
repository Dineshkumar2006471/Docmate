import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ArrowRight, Thermometer, Heart, Wind, Droplets, RefreshCw } from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { API_URL } from '../config';
import { useUserProfile } from '../context/UserProfileContext';

// --- Types ---
type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

interface AnalysisResult {
    risk_level: RiskLevel;
    risk_score: number;
    possible_conditions: { name: string; probability: number }[];
    recommendation: string;
    warning_signs: string[];
}

const InputCard = ({ label, icon: Icon, value, onChange, unit, placeholder }: any) => (
    <div className="bg-surface-highlight/30 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 focus-within:border-primary-500/50 transition-colors">
        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-medium">
            <Icon className="w-4 h-4" />
            {label}
        </div>
        <div className="flex items-baseline gap-2">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-transparent text-2xl font-serif text-slate-100 outline-none w-full placeholder:text-slate-700"
            />
            <span className="text-slate-500 text-sm">{unit}</span>
        </div>
    </div>
);

export default function SymptomChecker() {
    const { profile } = useUserProfile();
    const [symptoms, setSymptoms] = useState('');
    const [vitals, setVitals] = useState({ temp: '', hr: '', bpSys: '', bpDia: '', spo2: '' });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Get live data
    const { vitals: liveVitals } = useHealthData();

    const syncVitals = () => {
        setVitals({
            temp: liveVitals.temperature.toString(),
            hr: liveVitals.heartRate.toString(),
            bpSys: liveVitals.systolic.toString(),
            bpDia: liveVitals.diastolic.toString(),
            spo2: liveVitals.spo2.toString()
        });
    };

    const saveToHistory = (data: AnalysisResult, symptomsText: string) => {
        const newReport = {
            id: Date.now().toString(),
            title: `Symptom Check: ${symptomsText.substring(0, 20)}${symptomsText.length > 20 ? '...' : ''}`,
            date: new Date().toISOString().split('T')[0],
            risk_level: data.risk_level,
            summary: data.recommendation || (data.possible_conditions[0] ? `Possible: ${data.possible_conditions[0].name}` : 'Analysis Complete'),
            type: 'Symptom Check'
        };

        const existing = localStorage.getItem('docmate_reports');
        const reports = existing ? JSON.parse(existing) : [];
        reports.unshift(newReport);
        localStorage.setItem('docmate_reports', JSON.stringify(reports));
    };

    const handleAnalyze = async () => {
        if (!symptoms) return;
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/api/analyze-symptoms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symptoms,
                    vitals,
                    userProfile: {
                        age: profile.age || 30,
                        gender: profile.gender || 'Unknown',
                        history: profile.pastConditions.join(', ') || 'None',
                        allergies: profile.allergies.join(', ') || 'None'
                    }
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || 'Failed to analyze symptoms');
            }

            // Validate data structure
            if (!data.risk_level || !data.possible_conditions) {
                throw new Error('Invalid response format from AI');
            }

            setResult(data);
            saveToHistory(data, symptoms);
        } catch (err: any) {
            console.error("Analysis Failed", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Scroll to results when they appear
    useEffect(() => {
        if (result && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [result]);

    return (
        <div className="max-w-full mx-auto space-y-8 relative pb-20">
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            {/* Profile Integration Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-primary-500"
            >
                <div>
                    <h3 className="text-lg font-serif text-slate-100">Personalized Risk Profile</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Analyzing for: <span className="text-slate-200 font-bold">{profile.fullName || 'Guest'}</span>
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="text-slate-200">{profile.gender || 'Unknown'}, {profile.age || '?'} yrs</span>
                        {profile.allergies.length > 0 && (
                            <>
                                <span className="mx-2 text-slate-600">|</span>
                                <span className="text-red-400 text-xs uppercase font-bold">Allergies: {profile.allergies.join(', ')}</span>
                            </>
                        )}
                    </p>
                </div>
                <div className="px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs font-bold uppercase tracking-widest">
                    {profile.pastConditions.length > 0 ? 'Monitor History' : 'Low Baseline Risk'}
                </div>
            </motion.div>

            {/* Input Section - Full Width */}
            <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-serif text-slate-100 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-400" /> Describe Symptoms
                    </h3>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe what you're feeling (e.g., 'Severe stomach pain after eating...')"
                        className="w-full h-32 bg-surface-highlight/30 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:border-primary-500/50 outline-none transition-colors resize-none"
                    />
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-serif text-slate-100 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-primary-400" /> Vitals (Optional)
                        </h3>
                        <button
                            onClick={syncVitals}
                            className="text-xs flex items-center gap-1 text-primary-300 hover:text-primary-200 transition-colors uppercase tracking-wider font-bold"
                        >
                            <RefreshCw className="w-3 h-3" /> Sync Live Data
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InputCard label="Temp (°F)" icon={Thermometer} value={vitals.temp} onChange={(v: string) => setVitals({ ...vitals, temp: v })} unit="°F" placeholder="98.6" />
                        <InputCard label="Heart Rate" icon={Heart} value={vitals.hr} onChange={(v: string) => setVitals({ ...vitals, hr: v })} unit="BPM" placeholder="72" />
                        <InputCard label="Systolic" icon={Activity} value={vitals.bpSys} onChange={(v: string) => setVitals({ ...vitals, bpSys: v })} unit="mmHg" placeholder="120" />
                        <InputCard label="SpO2" icon={Wind} value={vitals.spo2} onChange={(v: string) => setVitals({ ...vitals, spo2: v })} unit="%" placeholder="98" />
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !symptoms}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3
              ${isAnalyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-400 text-slate-900 shadow-[0_0_20px_-5px_rgba(163,230,53,0.4)]'}
            `}
                >
                    {isAnalyzing ? (
                        <>Analyzing Symptoms <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /></>
                    ) : (
                        <>Analyze Symptoms <ArrowRight className="w-5 h-5" /></>
                    )}
                </button>
            </div>

            {/* Results Section - Full Width Below */}
            <div ref={resultsRef}>
                <AnimatePresence>
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-2xl p-8 border ${result.risk_level === 'Critical' || result.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30' : 'glass-card'}`}
                        >
                            {/* Severity Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h3 className="text-2xl font-serif text-slate-100">Analysis Result</h3>
                                    <p className="text-slate-400 text-sm mt-1">AI Assessment based on provided symptoms</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest border text-center ${result.risk_level === 'Critical' || result.risk_level === 'High' ? 'bg-red-500 text-white border-red-400' : 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                                    }`}>
                                    {result.risk_level} Risk
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Warning Signs & Recommendation */}
                                <div className="space-y-6">
                                    {/* Warning Signs */}
                                    {result.warning_signs && result.warning_signs.length > 0 && (result.risk_level === 'High' || result.risk_level === 'Critical') && (
                                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider mb-4">
                                                <AlertTriangle className="w-5 h-5" /> Warning Signs
                                            </div>
                                            <ul className="list-disc list-inside text-red-200 space-y-2">
                                                {result.warning_signs.map((sign, i) => <li key={i}>{sign}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recommendation */}
                                    <div className="p-6 bg-surface-highlight/20 rounded-xl border border-slate-800">
                                        <div className="text-primary-400 text-xs uppercase tracking-wider mb-2 font-bold">Recommendation</div>
                                        <div className="text-lg font-serif text-slate-100 leading-relaxed">{result.recommendation}</div>

                                        <div className="mt-6">
                                            <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase tracking-wider">
                                                <span>Severity Score</span>
                                                <span>{result.risk_score}/10</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${result.risk_level === 'Critical' ? 'bg-red-500' : 'bg-primary-500'}`}
                                                    style={{ width: `${result.risk_score * 10}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Possible Conditions */}
                                <div>
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-4 font-bold flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Potential Causes
                                    </div>
                                    <div className="space-y-3">
                                        {result.possible_conditions.map((condition, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-xl border border-slate-800 hover:border-primary-500/30 transition-colors">
                                                <span className="text-slate-200 font-medium">{condition.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary-500 rounded-full"
                                                            style={{ width: `${condition.probability}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-primary-400 w-10 text-right">{condition.probability}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4 italic">
                                        * Probabilities are estimates based on AI analysis and should not replace professional medical diagnosis.
                                    </p>
                                </div>
                            </div>

                        </motion.div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 text-red-400 border border-dashed border-red-500/30 bg-red-500/5 rounded-2xl">
                            <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-bold mb-2">Analysis Failed</h3>
                            <p className="text-sm">{error}</p>
                            <button onClick={handleAnalyze} className="mt-4 text-sm underline hover:text-red-300">Try Again</button>
                        </div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
