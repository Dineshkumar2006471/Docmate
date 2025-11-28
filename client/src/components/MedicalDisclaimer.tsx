import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MedicalDisclaimer() {
    return (
        <div className="bg-background/95 backdrop-blur-sm border-t border-white/5 p-4 z-30 sticky bottom-0 w-full">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-slate-500 text-xs md:text-sm text-center">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p>
                    <span className="font-semibold text-slate-400">Medical Disclaimer:</span> This application provides general information and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
            </div>
        </div>
    );
}
