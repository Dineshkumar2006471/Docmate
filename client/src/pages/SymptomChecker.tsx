import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ArrowRight, Thermometer, Heart, Wind, Droplets, RefreshCw } from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';

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
    <div className="bg-surface-highlight/30 border border-white/5 rounded-xl p-4 flex flex-col gap-2 focus-within:border-teal-500/50 transition-colors">
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
    const [symptoms, setSymptoms] = useState('');
    const [vitals, setVitals] = useState({ temp: '', hr: '', bpSys: '', bpDia: '', spo2: '' });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            const response = await fetch('http://localhost:3000/api/analyze-symptoms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symptoms,
                    vitals,
                    userProfile: { age: 30, gender: 'Male', history: 'None' } // Mock Profile
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

    return (
        <div className="max-w-5xl mx-auto space-y-8 relative">
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            {/* Profile Integration Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-teal-500"
            >
                <div>
                    <h3 className="text-lg font-serif text-slate-100">Personalized Risk Profile</h3>
                    <p className="text-slate-400 text-sm mt-1">Based on your history: <span className="text-slate-200">Male, 30, No known allergies</span></p>
                </div>
                <div className="px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-xs font-bold uppercase tracking-widest">
                    Low Baseline Risk
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Input Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-serif text-slate-100 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-400" /> Describe Symptoms
                        </h3>
                        <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Describe what you're feeling (e.g., 'Severe stomach pain after eating...')"
                            className="w-full h-32 bg-surface-highlight/30 border border-white/5 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:border-teal-500/50 outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-serif text-slate-100 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-teal-400" /> Vitals (Optional)
                            </h3>
                            <button
                                onClick={syncVitals}
                                className="text-xs flex items-center gap-1 text-teal-300 hover:text-teal-200 transition-colors uppercase tracking-wider font-bold"
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
              ${isAnalyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-[0_0_20px_-5px_rgba(20,184,166,0.4)]'}
            `}
                    >
                        {isAnalyzing ? (
                            <>Analyzing Symptoms <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /></>
                        ) : (
                            <>Analyze Symptoms <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-1">
                    <AnimatePresence>
                        {result ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`rounded-2xl p-6 border ${result.risk_level === 'Critical' || result.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30' : 'glass-card'}`}
                            >
                                {/* Severity Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-serif text-slate-100">Analysis Result</h3>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${result.risk_level === 'Critical' || result.risk_level === 'High' ? 'bg-red-500 text-white border-red-400' : 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                                        }`}>
                                        {result.risk_level} Risk
                                    </div>
                                </div>

                                {/* Warning Signs */}
                                {result.warning_signs && result.warning_signs.length > 0 && (
                                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider mb-2">
                                            <AlertTriangle className="w-4 h-4" /> Warning Signs
                                        </div>
                                        <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                                            {result.warning_signs.map((sign, i) => <li key={i}>{sign}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Recommendation */}
                                <div className="mb-6">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Recommendation</div>
                                    <div className="text-xl font-serif text-slate-100 mb-1">{result.recommendation}</div>
                                    <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${result.risk_level === 'Critical' ? 'bg-red-500' : 'bg-teal-500'}`}
                                            style={{ width: `${result.risk_score * 10}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Possible Conditions */}
                                <div>
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">Potential Causes</div>
                                    <div className="space-y-3">
                                        {result.possible_conditions.map((condition, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg border border-white/5">
                                                <span className="text-sm text-slate-200">{condition.name}</span>
                                                <span className="text-xs font-bold text-teal-400">{condition.probability}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </motion.div>
                        ) : error ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-red-400 border border-dashed border-red-500/30 bg-red-500/5 rounded-2xl">
                                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                                <h3 className="text-lg font-bold mb-2">Analysis Failed</h3>
                                <p className="text-sm">{error}</p>
                                <button onClick={handleAnalyze} className="mt-4 text-sm underline hover:text-red-300">Try Again</button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                                <Activity className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm">Enter your symptoms and vitals to receive an AI-powered assessment.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
