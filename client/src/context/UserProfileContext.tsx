import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface UserProfile {
    // Basic Info
    fullName: string;
    age: string;
    gender: string;
    bloodType: string;
    weight: string;
    height: string;
    photoURL?: string;

    // Medical History
    pastConditions: string[];
    allergies: string[];
    currentMedications: string[];

    // Lifestyle
    smokingStatus: string;
    alcoholConsumption: string;
    exerciseLevel: string;

    // Emergency Contact
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
}

export interface UserSettings {
    locationSharingConsent: boolean;
    autoTriggerConsent: boolean;
}

interface UserProfileContextType {
    profile: UserProfile;
    settings: UserSettings;
    loading: boolean;
    error: string | null;
    saveProfile: (newProfile: UserProfile, newSettings: UserSettings) => Promise<boolean>;
    isProfileComplete: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile>(() => {
        // Initialize from LocalStorage if available
        try {
            const saved = localStorage.getItem('docmate_user_profile');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return {
            fullName: '',
            age: '',
            gender: '',
            bloodType: '',
            weight: '',
            height: '',
            pastConditions: [],
            allergies: [],
            currentMedications: [],
            smokingStatus: '',
            alcoholConsumption: '',
            exerciseLevel: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: ''
        };
    });

    const [settings, setSettings] = useState<UserSettings>(() => {
        try {
            const saved = localStorage.getItem('docmate_user_settings');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return {
            locationSharingConsent: false,
            autoTriggerConsent: false
        };
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [docId, setDocId] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Parallel Fetch with Timeout
                    const patientsRef = collection(db, 'patients');
                    const q = query(patientsRef, where('user_id', '==', user.uid));
                    const userDocRef = doc(db, 'users', user.uid);

                    const fetchPromise = Promise.all([
                        getDocs(q),
                        getDoc(userDocRef)
                    ]);

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Profile fetch timed out")), 15000)
                    );

                    try {
                        const [querySnapshot, userDocSnap] = await Promise.race([
                            fetchPromise,
                            timeoutPromise
                        ]) as [any, any];

                        if (mounted) {
                            // Handle Patient Profile
                            if (!querySnapshot.empty) {
                                // Handle potential duplicates by picking the most recently updated one
                                const docs = querySnapshot.docs.sort((a: any, b: any) => {
                                    const aTime = a.data().updated_at?.toMillis() || 0;
                                    const bTime = b.data().updated_at?.toMillis() || 0;
                                    return bTime - aTime;
                                });

                                const doc = docs[0];
                                setDocId(doc.id); // Store docId for future updates
                                const docData = doc.data();
                                const { user_id, created_by, updated_at, ...profileData } = docData as any;

                                const mergedProfile = { ...profile, ...profileData, photoURL: user.photoURL || '' };
                                setProfile(mergedProfile);
                                localStorage.setItem('docmate_user_profile', JSON.stringify(mergedProfile));
                            } else {
                                if (user.displayName) {
                                    setProfile(prev => {
                                        const updated = { ...prev, fullName: user.displayName || '', photoURL: user.photoURL || '' };
                                        localStorage.setItem('docmate_user_profile', JSON.stringify(updated));
                                        return updated;
                                    });
                                }
                            }

                            // Handle User Settings
                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                if (userData.settings) {
                                    setSettings(prev => {
                                        const updated = { ...prev, ...userData.settings };
                                        localStorage.setItem('docmate_user_settings', JSON.stringify(updated));
                                        return updated;
                                    });
                                }
                            }
                        }
                    } catch (fetchErr: any) {
                        console.warn("Profile fetch warning:", fetchErr);
                        // Don't set global error on timeout, allow user to proceed with empty/default profile
                        if (mounted && fetchErr.message !== "Profile fetch timed out") {
                            setError("Failed to load profile data. You can still edit and save.");
                        }
                    }

                } catch (err: any) {
                    console.error("Error in profile setup:", err);
                    if (mounted) setError(err.message);
                } finally {
                    if (mounted) setLoading(false);
                }
            } else {
                if (mounted) {
                    setLoading(false);
                    setDocId(null);
                    // Clear profile on logout
                    const emptyProfile = {
                        fullName: '', age: '', gender: '', bloodType: '', weight: '', height: '',
                        pastConditions: [], allergies: [], currentMedications: [],
                        smokingStatus: '', alcoholConsumption: '', exerciseLevel: '',
                        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: ''
                    };
                    setProfile(emptyProfile);
                    localStorage.removeItem('docmate_user_profile');
                    localStorage.removeItem('docmate_user_settings');
                }
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const saveProfile = async (newProfile: UserProfile, newSettings: UserSettings) => {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        // 1. Optimistic Update & Local Persistence
        const previousProfile = profile;
        const previousSettings = settings;

        setProfile(newProfile);
        setSettings(newSettings);

        // Save to LocalStorage immediately
        localStorage.setItem('docmate_user_profile', JSON.stringify(newProfile));
        localStorage.setItem('docmate_user_settings', JSON.stringify(newSettings));

        // 2. Background Persistence with Timeout
        try {
            const { photoURL, ...profileDataToSave } = newProfile; // Don't save photoURL to Firestore

            const medicalData = {
                user_id: user.uid,
                created_by: user.email,
                updated_at: serverTimestamp(),
                ...profileDataToSave
            };

            const performSave = async () => {
                let targetDocId = docId;

                // Double-check for existing document if we don't have an ID
                if (!targetDocId) {
                    const patientsRef = collection(db, 'patients');
                    const q = query(patientsRef, where('user_id', '==', user.uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docs = querySnapshot.docs.sort((a, b) => {
                            const aTime = a.data().updated_at?.toMillis() || 0;
                            const bTime = b.data().updated_at?.toMillis() || 0;
                            return bTime - aTime;
                        });
                        targetDocId = docs[0].id;
                        setDocId(targetDocId);
                    }
                }

                if (targetDocId) {
                    await setDoc(doc(db, 'patients', targetDocId), medicalData, { merge: true });
                } else {
                    const newDocRef = doc(collection(db, 'patients'));
                    setDocId(newDocRef.id);
                    await setDoc(newDocRef, medicalData);
                }

                // Save Consent Data
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                    email: user.email,
                    settings: newSettings,
                    updated_at: serverTimestamp()
                }, { merge: true });
            };

            // Race the save against a 5-second timeout
            // If it times out, we assume it's an offline save and return success to the UI
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Save timed out")), 5000)
            );

            await Promise.race([performSave(), timeoutPromise]);

        } catch (err: any) {
            if (err.message === "Save timed out") {
                console.warn("Save timed out - assuming background/offline sync.");
                return true; // Treat as success for UI
            }

            console.error("Background save failed - Reverting:", err);
            // We do NOT revert LocalStorage/State here because the user's intent was to save.
            // We just warn them.
            setError("Failed to sync with server. Your changes are saved locally.");
            return false;
        }

        return true;
    };

    const isProfileComplete = Boolean(
        profile.fullName &&
        profile.age &&
        profile.gender
    );

    // Debugging
    useEffect(() => {
        console.log("Profile Status:", {
            complete: isProfileComplete,
            name: profile.fullName,
            age: profile.age,
            gender: profile.gender,
            loading
        });
    }, [profile, isProfileComplete, loading]);

    return (
        <UserProfileContext.Provider value={{ profile, settings, loading, error, saveProfile, isProfileComplete }}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}
