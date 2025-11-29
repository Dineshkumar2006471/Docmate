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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    setLoading(true);

                    // Fetch Patient Profile (Medical Data)
                    const patientsRef = collection(db, 'patients');
                    const q = query(patientsRef, where('user_id', '==', user.uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docData = querySnapshot.docs[0].data();
                        // Filter out non-profile fields to avoid overwriting with stale data if schema changes
                        // But for now, simple spread is okay as long as we match UserProfile interface
                        const { user_id, created_by, updated_at, ...profileData } = docData as any;
                        setProfile(prev => ({ ...prev, ...profileData }));
                    } else {
                        if (user.displayName) {
                            setProfile(prev => ({ ...prev, fullName: user.displayName || '' }));
                        }
                    }

                    // Fetch User Settings (Consent Data)
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        if (userData.settings) {
                            setSettings(prev => ({ ...prev, ...userData.settings }));
                        }
                    }

                } catch (err: any) {
                    console.error("Error fetching profile:", err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setProfile({
                    fullName: '', age: '', gender: '', bloodType: '', weight: '', height: '',
                    pastConditions: [], allergies: [], currentMedications: [],
                    smokingStatus: '', alcoholConsumption: '', exerciseLevel: '',
                    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: ''
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const saveProfile = async (newProfile: UserProfile, newSettings: UserSettings) => {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        try {
            // 1. Save Medical Data to 'patients' collection
            const patientsRef = collection(db, 'patients');
            const q = query(patientsRef, where('user_id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const medicalData = {
                user_id: user.uid,
                created_by: user.email,
                updated_at: serverTimestamp(),
                ...newProfile
            };

            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await setDoc(doc(db, 'patients', docId), medicalData, { merge: true });
            } else {
                await setDoc(doc(collection(db, 'patients')), medicalData);
            }

            // 2. Save Consent Data to 'users' collection
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                email: user.email,
                settings: newSettings,
                updated_at: serverTimestamp()
            }, { merge: true });

            // Update local state
            setProfile(newProfile);
            setSettings(newSettings);

            return true;
        } catch (err: any) {
            console.error("Error saving profile:", err);
            throw err;
        }
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
