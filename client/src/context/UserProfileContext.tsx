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

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch Patient Profile (Medical Data)
                    const patientsRef = collection(db, 'patients');
                    const q = query(patientsRef, where('user_id', '==', user.uid));
                    const querySnapshot = await getDocs(q);

                    if (mounted) {
                        if (!querySnapshot.empty) {
                            // Handle potential duplicates by picking the most recently updated one
                            const docs = querySnapshot.docs.sort((a, b) => {
                                const aTime = a.data().updated_at?.toMillis() || 0;
                                const bTime = b.data().updated_at?.toMillis() || 0;
                                return bTime - aTime;
                            });

                            const doc = docs[0];
                            setDocId(doc.id); // Store docId for future updates
                            const docData = doc.data();
                            const { user_id, created_by, updated_at, ...profileData } = docData as any;
                            setProfile(prev => ({ ...prev, ...profileData, photoURL: user.photoURL || '' }));
                        } else {
                            if (user.displayName) {
                                setProfile(prev => ({ ...prev, fullName: user.displayName || '', photoURL: user.photoURL || '' }));
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
                    if (mounted && !err.message?.includes('offline')) {
                        setError(err.message);
                    }
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

        // 1. Optimistic Update
        const previousProfile = profile;
        const previousSettings = settings;

        setProfile(newProfile);
        setSettings(newSettings);

        // 2. Background Persistence
        try {
            const { photoURL, ...profileDataToSave } = newProfile; // Don't save photoURL to Firestore

            const medicalData = {
                user_id: user.uid,
                created_by: user.email,
                updated_at: serverTimestamp(),
                ...profileDataToSave
            };

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

        } catch (err: any) {
            console.error("Background save failed - Reverting:", err);
            setProfile(previousProfile);
            setSettings(previousSettings);
            setError("Failed to save changes. Please check your connection.");
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
