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
    const [profile, setProfile] = useState<UserProfile>({
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
    });

    const [settings, setSettings] = useState<UserSettings>({
        locationSharingConsent: false,
        autoTriggerConsent: false
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [docId, setDocId] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Profile loading timed out - forcing completion");
                setLoading(false);
            }
        }, 8000); // 8 seconds timeout

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch Patient Profile (Medical Data)
                    const patientsRef = collection(db, 'patients');
                    const q = query(patientsRef, where('user_id', '==', user.uid));
                    const querySnapshot = await getDocs(q);

                    if (mounted) {
                        if (!querySnapshot.empty) {
                            const doc = querySnapshot.docs[0];
                            setDocId(doc.id); // Store docId for future updates
                            const docData = doc.data();
                            const { user_id, created_by, updated_at, ...profileData } = docData as any;
                            setProfile(prev => ({ ...prev, ...profileData }));
                        } else {
                            if (user.displayName) {
                                setProfile(prev => ({ ...prev, fullName: user.displayName || '' }));
                            }
                        }
                    }

                    // Fetch User Settings (Consent Data)
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (mounted && userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        if (userData.settings) {
                            setSettings(prev => ({ ...prev, ...userData.settings }));
                        }
                    }

                } catch (err: any) {
                    console.error("Error fetching profile:", err);
                    if (mounted) setError(err.message);
                } finally {
                    if (mounted) setLoading(false);
                }
            } else {
                if (mounted) {
                    setLoading(false);
                    setDocId(null);
                    setProfile({
                        fullName: '', age: '', gender: '', bloodType: '', weight: '', height: '',
                        pastConditions: [], allergies: [], currentMedications: [],
                        smokingStatus: '', alcoholConsumption: '', exerciseLevel: '',
                        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: ''
                    });
                }
                clearTimeout(safetyTimeout);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const saveProfile = async (newProfile: UserProfile, newSettings: UserSettings) => {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        // 1. Optimistic Update (Instant UI Feedback)
        const previousProfile = profile;
        const previousSettings = settings;

        setProfile(newProfile);
        setSettings(newSettings);

        // 2. Background Sync (Fire and Forget)
        (async () => {
            try {
                // Save Medical Data to 'patients' collection
                const medicalData = {
                    user_id: user.uid,
                    created_by: user.email,
                    updated_at: serverTimestamp(),
                    ...newProfile
                };

                if (docId) {
                    await setDoc(doc(db, 'patients', docId), medicalData, { merge: true });
                } else {
                    const patientsRef = collection(db, 'patients');
                    const q = query(patientsRef, where('user_id', '==', user.uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const existingDocId = querySnapshot.docs[0].id;
                        setDocId(existingDocId);
                        await setDoc(doc(db, 'patients', existingDocId), medicalData, { merge: true });
                    } else {
                        const newDocRef = doc(collection(db, 'patients'));
                        setDocId(newDocRef.id);
                        await setDoc(newDocRef, medicalData);
                    }
                }

                // Save Consent Data to 'users' collection
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                    email: user.email,
                    settings: newSettings,
                    updated_at: serverTimestamp()
                }, { merge: true });

            } catch (err: any) {
                console.error("Background save failed - Reverting:", err);
                setProfile(previousProfile);
                setSettings(previousSettings);
                setError("Failed to save changes. Please check your connection.");
            }
        })();

        return true; // Return immediately to unblock UI
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
