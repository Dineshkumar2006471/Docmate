import { useState, useEffect } from 'react';

export interface VitalHistoryPoint {
    time: string;
    value: number;
    activity: string;
}

export interface Vitals {
    heartRate: number;
    temperature: number;
    systolic: number;
    diastolic: number;
    spo2: number;
    glucose: number;
}

export function useHealthData() {
    // Initial mock state
    const [vitals, setVitals] = useState<Vitals>({
        heartRate: 72,
        temperature: 98.6,
        systolic: 120,
        diastolic: 80,
        spo2: 98,
        glucose: 110
    });

    const [heartRateHistory, setHeartRateHistory] = useState<VitalHistoryPoint[]>([]);

    useEffect(() => {
        // Initialize history with some past data if empty
        if (heartRateHistory.length === 0) {
            const initialHistory = [];
            const now = new Date();
            for (let i = 10; i >= 0; i--) {
                const t = new Date(now.getTime() - i * 60000); // Past 10 minutes
                initialHistory.push({
                    time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    value: 70 + Math.floor(Math.random() * 20),
                    activity: 'Rest'
                });
            }
            setHeartRateHistory(initialHistory);
        }

        // Simulate Real-Time Updates
        const interval = setInterval(() => {
            setVitals(prev => {
                // Random walk for realistic fluctuation
                const newHr = Math.max(60, Math.min(130, prev.heartRate + (Math.random() - 0.5) * 5));
                const newTemp = Math.max(97, Math.min(100, prev.temperature + (Math.random() - 0.5) * 0.1));
                const newSys = Math.max(110, Math.min(140, prev.systolic + (Math.random() - 0.5) * 2));
                const newDia = Math.max(70, Math.min(90, prev.diastolic + (Math.random() - 0.5) * 2));
                const newSpo2 = Math.max(95, Math.min(100, prev.spo2 + (Math.random() - 0.5) * 1));
                const newGlucose = Math.max(80, Math.min(140, prev.glucose + (Math.random() - 0.5) * 2));

                return {
                    heartRate: Math.round(newHr),
                    temperature: parseFloat(newTemp.toFixed(1)),
                    systolic: Math.round(newSys),
                    diastolic: Math.round(newDia),
                    spo2: Math.round(newSpo2),
                    glucose: Math.round(newGlucose)
                };
            });

            setHeartRateHistory(prev => {
                const now = new Date();
                const newPoint = {
                    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    value: vitals.heartRate, // Use the *previous* state's HR for continuity, or just the new one
                    activity: 'Live'
                };
                // Keep last 20 points
                return [...prev.slice(-19), newPoint];
            });

        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return { vitals, heartRateHistory };
}
