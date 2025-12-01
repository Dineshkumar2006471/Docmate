import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    TrendingUp,
    AlertTriangle,
    Calendar,
    CheckCircle,
    User,
    ArrowRight,
    Brain,
    Shield,
    ChevronRight,
    X,
    Loader2
} from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config';

// --- Types ---
interface RiskPrediction {
    condition: string;
    timeline: string;
    riskLevel: 'Low' | 'Moderate' | 'High';
    reason: string;
    contributingFactors: string[];
}

interface ActionItem {
    id: string;
    task: string;
    category: 'Immediate' | 'Short-term' | 'Long-term';
    completed: boolean;
}

interface InsightsData {
    score: number;
    riskLevel: string;
    color: string;
    ringColor: string;
    summary: string;
    predictions: RiskPrediction[];
    actionPlan: ActionItem[];
    history: { date: string; score: number }[];
}
export default function AIInsights() {
    const { profile } = useUserProfile();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'risks' | 'trends' | 'predictions' | 'plan'>('risks');
    const [selectedPrediction, setSelectedPrediction] = useState<RiskPrediction | null>(null);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [rawAssessments, setRawAssessments] = useState<any[] | null>(null);

    // Toggle Action Item Completion
    const toggleActionItem = (id: string) => {
        if (!insights) return;
        const updatedPlan = insights.actionPlan.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setInsights({ ...insights, actionPlan: updatedPlan });

        // Save to LocalStorage
        const completedIds = updatedPlan.filter(i => i.completed).map(i => i.id);
        localStorage.setItem('docmate_completed_actions', JSON.stringify(completedIds));
    };

    const handleFindSpecialist = () => {
        const specialty = profile.allergies.length > 0 ? 'Allergist' : 'General Physician';
        navigate(`/find-doctor?search=${specialty}`);
    };

    // 1. Fetch Assessments (Depends only on Auth)
    useEffect(() => {
        if (!auth.currentUser) return;

        // SIMPLIFIED QUERY: Limit to 20 to prevent loading issues
        const q = query(
            collection(db, 'SymptomAssessment'),
            where('patient_id', '==', auth.currentUser.uid),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
                const allAssessments = snapshot.docs.map(doc => doc.data());
                // Client-side sort
                const sortedAssessments = allAssessments
                    .sort((a, b) => {
                        const dateA = a.created_date?.toMillis ? a.created_date.toMillis() : 0;
                        const dateB = b.created_date?.toMillis ? b.created_date.toMillis() : 0;
                        return dateB - dateA;
                    })
                    .slice(0, 10);

                setRawAssessments(sortedAssessments);
            } catch (e) {
                console.error("Error processing assessments", e);
            }
        }, (error) => {
            console.error("Firestore Snapshot Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    // 2. Fetch AI Insights (Depends on Profile & Assessments)
    useEffect(() => {
        if (!profile || !rawAssessments) return;

        const fetchAIInsights = async () => {
            // Try to load from cache first
            const cacheKey = `docmate_insights_${auth.currentUser?.uid}`;
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsedCache = JSON.parse(cached);
                    // Only use cache if it's less than 24 hours old or if we are just loading
                    if (Date.now() - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
                        setInsights(parsedCache.data);
                        setLoading(false); // Show cached data immediately
                    }
                }
            } catch (e) {
                console.error("Cache read error", e);
            }

            try {
                // Get recent reports from local storage
                let recentReports = [];
                try {
                    const storedReports = localStorage.getItem('docmate_reports');
                    if (storedReports) {
                        const parsed = JSON.parse(storedReports);
                        if (Array.isArray(parsed)) {
                            recentReports = parsed.slice(0, 3); // Send last 3 reports
                        }
                    }
                } catch (e) {
                    console.error("Error reading reports", e);
                }

                console.log("Sending to AI:", { profile, assessmentsCount: rawAssessments.length, reportsCount: recentReports.length });

                const response = await fetch(`${API_URL}/api/generate-health-insights`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userProfile: profile,
                        assessments: rawAssessments.slice(0, 5), // Send last 5 assessments
                        recentReports
                    })
                });

                const data = await response.json();

                if (data.error) throw new Error(data.error);

                // --- Process Data & UI Logic ---
                const score = data.score || 0;
                const color = score > 80 ? 'text-emerald-400' : score > 50 ? 'text-amber-400' : 'text-red-400';
                const ringColor = score > 80 ? 'text-emerald-500' : score > 50 ? 'text-amber-500' : 'text-red-500';

                // Merge with locally calculated history
                const history = rawAssessments.map(a => ({
                    date: a.created_date?.toDate ? new Date(a.created_date.toDate()).toLocaleDateString() : 'N/A',
                    score: a.severity_score ? 10 - a.severity_score : 10
                })).reverse();

                // Merge saved completion status for action plan
                let savedCompletedIds: string[] = [];
                try {
                    const stored = localStorage.getItem('docmate_completed_actions');
                    savedCompletedIds = stored ? JSON.parse(stored) : [];
                } catch (e) { }

                const actionPlan = data.actionPlan.map((item: any) => ({
                    ...item,
                    completed: savedCompletedIds.includes(item.id)
                }));

                const finalInsights = {
                    score,
                    riskLevel: data.riskLevel,
                    color,
                    ringColor,
                    summary: data.summary,
                    predictions: data.predictions,
                    actionPlan,
                    history
                };

                setInsights(finalInsights);

                // Update Cache
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: finalInsights
                }));

                setLoading(false);

            } catch (e) {
                console.error("Error generating AI insights", e);
                // If we have cached data, we are fine, otherwise stop loading
                setLoading(false);
            }
        };

        fetchAIInsights();
    }, [profile, rawAssessments]);

    // Circular Gauge Component
    const ScoreGauge = () => {
        if (!insights) return null;
        return (
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-800"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - insights.score / 100)}
                        className={`${insights.ringColor} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold font-serif ${insights.color}`}>{insights.score}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Health Score</span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!insights) return <div>Failed to load insights.</div>;

    return (
        <div className="max-w-full mx-auto pb-20 relative min-w-0">
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-serif text-slate-100 mb-4 flex items-center gap-3">
                    <Brain className="w-8 h-8 text-primary-400" /> Health 360° Insights
                </h1>
                <p className="text-slate-400">AI-powered predictive analysis and personalized health roadmap.</p>
            </div>

            {/* 1. Health Scorecard */}
            <div className="glass-card p-8 rounded-3xl border border-slate-800 mb-10 flex flex-col md:flex-row items-center gap-10">
                <div className="shrink-0">
                    <ScoreGauge />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">Overall Health Profile</h2>
                    <p className="text-slate-300 leading-relaxed text-lg mb-6">
                        {insights.summary}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="px-4 py-2 bg-surface-highlight rounded-xl border border-slate-800 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-slate-300">Vitals Stable</span>
                        </div>
                        <div className="px-4 py-2 bg-surface-highlight rounded-xl border border-slate-800 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-slate-300">Insurance Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Tabbed Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-1">
                {[
                    { id: 'risks', label: 'Risk Factors', icon: AlertTriangle },
                    { id: 'trends', label: 'Trends', icon: TrendingUp },
                    { id: 'predictions', label: 'Predictions', icon: Brain },
                    { id: 'plan', label: 'Action Plan', icon: CheckCircle },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 rounded-t-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all relative top-[1px]
                            ${activeTab === tab.id
                                ? 'bg-surface-highlight text-primary-400 border-t border-x border-slate-800'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-surface-highlight'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* 3. Tab Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'risks' && (
                        <motion.div
                            key="risks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="glass-card p-6 rounded-2xl border border-slate-800">
                                <h3 className="text-lg font-serif text-slate-100 mb-6">Identified Risk Factors</h3>
                                {profile.allergies.length > 0 ? (
                                    <div className="space-y-4">
                                        {profile.allergies.map((allergy, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                <span className="text-red-200 font-medium">{allergy}</span>
                                                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase rounded-full">High Sensitivity</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 italic">No major allergies reported.</div>
                                )}
                            </div>
                            <div className="glass-card p-6 rounded-2xl border border-slate-800">
                                <h3 className="text-lg font-serif text-slate-100 mb-6">Lifestyle Factors</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-xl">
                                        <span className="text-slate-300">Age Group Risk</span>
                                        <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-bold uppercase rounded-full">Low</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-xl">
                                        <span className="text-slate-300">Chronic Conditions</span>
                                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${profile.pastConditions.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-primary-500/10 text-primary-400'}`}>
                                            {profile.pastConditions.length > 0 ? 'Moderate' : 'Low'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'trends' && (
                        <motion.div
                            key="trends"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card p-8 rounded-2xl border border-slate-800"
                        >
                            <h3 className="text-lg font-serif text-slate-100 mb-6">Health Score Trends</h3>
                            {insights.history.length > 1 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={insights.history}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#aacc00" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#aacc00" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={[0, 10]}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                                itemStyle={{ color: '#aacc00' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#aacc00"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorScore)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-serif text-slate-300 mb-2">Not Enough Data</h3>
                                    <p className="text-slate-500">Complete at least 2 symptom checks to see trends.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'predictions' && (
                        <motion.div
                            key="predictions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 space-y-8 pl-8 py-4">
                                {insights.predictions.map((pred, i) => (
                                    <div key={i} className="relative group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-[#0f172a] ${pred.riskLevel === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />

                                        <div
                                            onClick={() => setSelectedPrediction(pred)}
                                            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-primary-500/30 transition-all cursor-pointer group-hover:translate-x-2"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-100">{pred.condition}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                                        <Calendar className="w-4 h-4" /> Timeline: {pred.timeline}
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${pred.riskLevel === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    {pred.riskLevel} Risk
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm mb-4">{pred.reason}</p>
                                            <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                                                View Contributing Factors <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'plan' && (
                        <motion.div
                            key="plan"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="glass-card p-6 rounded-2xl border border-slate-800">
                                <h3 className="text-lg font-serif text-slate-100 mb-6">Preventive Measures Roadmap</h3>
                                <div className="space-y-6">
                                    {['Immediate', 'Short-term', 'Long-term'].map((cat) => {
                                        const items = insights.actionPlan.filter(i => i.category === cat);
                                        if (items.length === 0) return null;
                                        return (
                                            <div key={cat}>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-400 mb-3">{cat} Actions</h4>
                                                <div className="space-y-2">
                                                    {items.map(item => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => toggleActionItem(item.id)}
                                                            className="flex items-center gap-3 p-3 bg-surface-highlight/30 rounded-xl border border-slate-800 cursor-pointer hover:bg-surface-highlight transition-colors"
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${item.completed ? 'bg-primary-500 border-primary-500' : 'border-slate-600'}`}>
                                                                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className={`text-sm transition-all ${item.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.task}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-2xl border border-primary-500/20 bg-primary-900/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100 mb-1">Recommended Specialist</h3>
                                    <p className="text-slate-400 text-sm">Based on your risk profile</p>
                                </div>
                                <button
                                    onClick={handleFindSpecialist}
                                    className="px-6 py-3 bg-primary-500 hover:bg-primary-400 text-slate-900 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors"
                                >
                                    Find {profile.allergies.length > 0 ? 'Allergist' : 'General Physician'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Prediction Detail Slide-out Panel */}
            <AnimatePresence>
                {selectedPrediction && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPrediction(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-surface-highlight border-l border-slate-800 z-50 p-8 shadow-2xl overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-serif text-slate-100">Prediction Details</h2>
                                <button onClick={() => setSelectedPrediction(null)} className="p-2 hover:bg-surface-highlight rounded-full text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Condition</div>
                                    <div className="text-xl font-bold text-primary-400">{selectedPrediction.condition}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Why this matters</div>
                                    <p className="text-slate-300 leading-relaxed">{selectedPrediction.reason}</p>
                                </div>

                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-4">Contributing Data Points</div>
                                    <div className="space-y-3">
                                        {selectedPrediction.contributingFactors.map((factor, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-slate-800">
                                                <Activity className="w-4 h-4 text-slate-500" />
                                                <span className="text-slate-200 text-sm">{factor}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-800">
                                    <button
                                        onClick={() => alert("Prevention tips coming soon! (This would open a detailed content modal)")}
                                        className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-slate-900 rounded-xl font-bold uppercase tracking-widest transition-colors"
                                    >
                                        View Prevention Tips
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
