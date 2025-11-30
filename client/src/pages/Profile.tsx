import React, { useState, useEffect } from 'react';
import { useUserProfile, type UserProfile as UserProfileType, type UserSettings } from '../context/UserProfileContext';
import { User, Activity, Heart, Shield, Save, AlertCircle, CheckCircle, Phone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
    const { profile, settings, saveProfile, loading, error } = useUserProfile();
    const [formData, setFormData] = useState<UserProfileType>(profile);
    const [formSettings, setFormSettings] = useState<UserSettings>(settings);
    const [isEditing, setIsEditing] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (!loading) {
            setFormData(profile);
            setFormSettings(settings);
        }
    }, [profile, settings, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserProfileType) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, [field]: val.split(',').map(item => item.trim()) }));
    };

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaveStatus('saving');
        try {
            await saveProfile(formData, formSettings);
            setSaveStatus('success');
            setIsEditing(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading profile...</div>;

    return (
        <div className="max-w-full mx-auto pb-20 relative min-w-0">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-slate-100 mb-2">My Profile</h1>
                    <p className="text-slate-400 text-sm">Manage your personal health information and settings.</p>
                </div>
                <button
                    onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                    disabled={saveStatus === 'saving'}
                    className={`btn-primary flex items-center gap-2 ${isEditing ? 'bg-primary-500 hover:bg-primary-400' : 'bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-300'}`}
                >
                    {saveStatus === 'saving' ? (
                        <Activity className="w-4 h-4 animate-spin" />
                    ) : isEditing ? (
                        <Save className="w-4 h-4" />
                    ) : (
                        <FileText className="w-4 h-4" />
                    )}
                    {saveStatus === 'saving' ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            {saveStatus === 'success' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-sm flex items-center gap-3 text-primary-300">
                    <CheckCircle className="w-5 h-5" /> Profile updated successfully!
                </motion.div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-3 text-red-300">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Personal Information */}
                <div className="glass-panel p-6 rounded-sm border border-white/10 space-y-6">
                    <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-4">
                        <User className="w-5 h-5 text-primary-400" /> Personal Information
                    </h3>

                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-surface-highlight/50 rounded-full flex items-center justify-center border-2 border-primary-500/30 shadow-[0_0_20px_-5px_rgba(204,255,0,0.2)]">
                            <User className="w-12 h-12 text-primary-300" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            >
                                <option value="" className="bg-slate-800 text-slate-200">Select</option>
                                <option value="Male" className="bg-slate-800 text-slate-200">Male</option>
                                <option value="Female" className="bg-slate-800 text-slate-200">Female</option>
                                <option value="Other" className="bg-slate-800 text-slate-200">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Height (cm)</label>
                            <input
                                type="text"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Weight (kg)</label>
                            <input
                                type="text"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Blood Type</label>
                            <select
                                name="bloodType"
                                value={formData.bloodType}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            >
                                <option value="" className="bg-slate-800 text-slate-200">Select</option>
                                <option value="A+" className="bg-slate-800 text-slate-200">A+</option>
                                <option value="A-" className="bg-slate-800 text-slate-200">A-</option>
                                <option value="B+" className="bg-slate-800 text-slate-200">B+</option>
                                <option value="B-" className="bg-slate-800 text-slate-200">B-</option>
                                <option value="AB+" className="bg-slate-800 text-slate-200">AB+</option>
                                <option value="AB-" className="bg-slate-800 text-slate-200">AB-</option>
                                <option value="O+" className="bg-slate-800 text-slate-200">O+</option>
                                <option value="O-" className="bg-slate-800 text-slate-200">O-</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Medical History */}
                <div className="glass-panel p-6 rounded-sm border border-white/10 space-y-6">
                    <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-4">
                        <Activity className="w-5 h-5 text-red-400" /> Medical History
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Allergies (comma separated)</label>
                            <input
                                type="text"
                                value={formData.allergies.join(', ')}
                                onChange={(e) => handleArrayChange(e, 'allergies')}
                                disabled={!isEditing}
                                placeholder="e.g. Peanuts, Penicillin"
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Past Conditions (comma separated)</label>
                            <input
                                type="text"
                                value={formData.pastConditions.join(', ')}
                                onChange={(e) => handleArrayChange(e, 'pastConditions')}
                                disabled={!isEditing}
                                placeholder="e.g. Asthma, Diabetes"
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Medications (comma separated)</label>
                            <input
                                type="text"
                                value={formData.currentMedications.join(', ')}
                                onChange={(e) => handleArrayChange(e, 'currentMedications')}
                                disabled={!isEditing}
                                placeholder="e.g. Ibuprofen"
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="glass-panel p-6 rounded-sm border border-white/10 space-y-6">
                    <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-4">
                        <Phone className="w-5 h-5 text-red-400" /> Emergency Contact
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Contact Name</label>
                            <input
                                type="text"
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Relationship</label>
                            <input
                                type="text"
                                name="emergencyContactRelationship"
                                value={formData.emergencyContactRelationship}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="emergencyContactPhone"
                                value={formData.emergencyContactPhone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-surface-highlight/30 border border-white/10 rounded-sm px-4 py-3 text-slate-100 focus:border-primary-500/50 outline-none disabled:opacity-50 font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Settings & Consent */}
                <div className="glass-panel p-6 rounded-sm border border-white/10 space-y-6">
                    <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-4">
                        <Shield className="w-5 h-5 text-primary-300" /> Privacy & Settings
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-sm border border-white/5">
                            <div>
                                <h4 className="text-slate-100 font-medium text-sm">Location Sharing</h4>
                                <p className="text-slate-500 text-xs mt-1">Allow sharing location with emergency services.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="locationSharingConsent"
                                    checked={formSettings.locationSharingConsent}
                                    onChange={handleSettingChange}
                                    disabled={!isEditing}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-sm border border-white/5">
                            <div>
                                <h4 className="text-slate-100 font-medium text-sm">Auto-Trigger Alerts</h4>
                                <p className="text-slate-500 text-xs mt-1">Automatically notify contacts if critical vitals detected.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="autoTriggerConsent"
                                    checked={formSettings.autoTriggerConsent}
                                    onChange={handleSettingChange}
                                    disabled={!isEditing}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
