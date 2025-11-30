import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Clock, Filter, ChevronRight, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useUserProfile } from '../context/UserProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, CheckCircle } from 'lucide-react';
import { auth } from '../lib/firebase';

interface Doctor {
    id: string | number;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    location: string;
    availability: string;
    image: string;
    distance?: string;
}

export default function FindDoctor() {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const { profile } = useUserProfile();

    // Booking State
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingStep, setBookingStep] = useState<'form' | 'success'>('form');
    const [bookingData, setBookingData] = useState({ date: '', time: '', reason: '' });

    // Location & Data State
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [locationName, setLocationName] = useState<string>("");

    // Mock data for fallback/initial view
    const mockDoctors: Doctor[] = [
        {
            id: 1,
            name: "Dr. Sarah Chen",
            specialty: "Cardiologist",
            rating: 4.9,
            reviews: 128,
            location: "Heart Care Center, NY",
            availability: "Available Today",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300"
        },
        {
            id: 2,
            name: "Dr. James Wilson",
            specialty: "Neurologist",
            rating: 4.8,
            reviews: 96,
            location: "City General Hospital",
            availability: "Next Available: Tomorrow",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300"
        },
        {
            id: 3,
            name: "Dr. Emily Parker",
            specialty: "Dermatologist",
            rating: 4.9,
            reviews: 215,
            location: "Skin & Glow Clinic",
            availability: "Available Today",
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300"
        },
        {
            id: 4,
            name: "Dr. Michael Chang",
            specialty: "Pediatrician",
            rating: 4.7,
            reviews: 154,
            location: "Kids Health First",
            availability: "Available Today",
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300"
        }
    ];

    useEffect(() => {
        setDoctors(mockDoctors);
    }, []);

    const specialties = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Pediatrician', 'General Physician', 'Dentist', 'Orthopedic'];

    const handleUseLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lon: longitude });

                try {
                    // 1. Get Location Name (Reverse Geocoding)
                    const locationResp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const locationData = await locationResp.json();
                    setLocationName(locationData.address.city || locationData.address.town || locationData.address.suburb || "Your Location");

                    // 2. Fetch Doctors from Overpass API
                    await fetchNearbyDoctors(latitude, longitude);
                } catch (err) {
                    console.error("Error fetching location data:", err);
                    setError("Failed to fetch location data. Using mock data.");
                    setDoctors(mockDoctors);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError("Unable to retrieve your location. Please check permissions.");
                setLoading(false);
            }
        );
    };

    const fetchNearbyDoctors = async (lat: number, lon: number) => {
        // Overpass API Query for doctors, clinics, hospitals within 5km
        const query = `
            [out:json][timeout:25];
            (
              node["amenity"="doctors"](around:5000, ${lat}, ${lon});
              node["amenity"="clinic"](around:5000, ${lat}, ${lon});
              node["amenity"="hospital"](around:5000, ${lat}, ${lon});
            );
            out body;
            >;
            out skel qt;
        `;

        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });
            const data = await response.json();

            if (data.elements && data.elements.length > 0) {
                const mappedDoctors: Doctor[] = data.elements.map((item: any, index: number) => ({
                    id: item.id,
                    name: item.tags.name || `Doctor/Clinic #${item.id}`,
                    specialty: item.tags['healthcare:speciality'] || item.tags.amenity || "General Practice",
                    rating: (4 + Math.random()).toFixed(1), // Simulate rating as OSM doesn't have it
                    reviews: Math.floor(Math.random() * 200) + 20,
                    location: item.tags['addr:street'] ? `${item.tags['addr:street']}, ${locationName}` : "Nearby",
                    availability: "Call for Appointment",
                    image: `https://source.unsplash.com/random/300x300/?doctor,hospital&sig=${index}`, // Random medical image
                    distance: calculateDistance(lat, lon, item.lat, item.lon).toFixed(1) + " km"
                }));
                setDoctors(mappedDoctors);
            } else {
                setError("No doctors found nearby. Showing recommended specialists.");
                setDoctors(mockDoctors);
            }
        } catch (err) {
            console.error("Overpass API Error:", err);
            throw new Error("Failed to fetch doctor data");
        }
    };

    // Haversine formula for distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' ||
            doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
            (selectedSpecialty === 'General Physician' && doc.specialty === 'doctors');
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="max-w-full mx-auto pb-20 relative min-w-0">
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif text-slate-100 mb-4">Find a Specialist</h1>
                    <p className="text-slate-400">Book appointments with top-rated doctors near you.</p>
                </div>

                <button
                    onClick={handleUseLocation}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-4 py-2 rounded-lg border border-primary-500/20 transition-all font-bold uppercase text-xs tracking-wider"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    {loading ? "Detecting..." : "Use My Location"}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-300">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {/* Location Indicator */}
            {locationName && (
                <div className="mb-6 flex items-center gap-3 text-slate-300 bg-white/5 w-fit pr-6 pl-2 py-2 rounded-full border border-slate-800">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                        {auth.currentUser?.photoURL ? (
                            <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-slate-400" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-0.5">Current Location</span>
                        <div className="flex items-center gap-1 text-sm font-bold text-white leading-none">
                            <MapPin className="w-3 h-3 text-primary-400" /> {locationName}
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="glass-card p-6 rounded-2xl mb-10 border border-slate-800">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search doctors, specialties, conditions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-highlight/30 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-slate-200 focus:border-primary-500/50 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {specialties.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpecialty(spec)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedSpecialty === spec
                                    ? 'bg-primary-500 text-white border-primary-500'
                                    : 'bg-surface-highlight/30 text-slate-400 border-slate-800 hover:border-white/20'
                                    }`}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Doctor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.length > 0 ? filteredDoctors.map(doctor => (
                    <div key={doctor.id} className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-primary-500/30 transition-all group">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-800 relative">
                                <img
                                    src={doctor.image}
                                    alt={doctor.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Dr";
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 mb-1 line-clamp-1">{doctor.name}</h3>
                                <p className="text-primary-400 text-sm font-medium mb-2 capitalize">{doctor.specialty.replace(/_/g, ' ')}</p>
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{doctor.rating}</span>
                                    <span className="text-slate-500 font-normal">({doctor.reviews} reviews)</span>
                                </div>
                                {doctor.distance && (
                                    <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                                        <Navigation className="w-3 h-3" /> {doctor.distance} away
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="line-clamp-1">{doctor.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                                {doctor.availability}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedDoctor(doctor);
                                setBookingStep('form');
                                setBookingData({ date: '', time: '', reason: '' });
                            }}
                            className="w-full bg-surface-highlight hover:bg-primary-500 hover:text-white text-slate-300 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-500/20"
                        >
                            Book Appointment <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No doctors found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDoctor(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-surface-highlight/30">
                                <h3 className="text-xl font-serif text-slate-100">
                                    {bookingStep === 'form' ? 'Book Appointment' : 'Booking Confirmed'}
                                </h3>
                                <button
                                    onClick={() => setSelectedDoctor(null)}
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                {bookingStep === 'form' ? (
                                    <div className="space-y-6">
                                        {/* Doctor Summary */}
                                        <div className="flex items-center gap-4 p-4 bg-surface-highlight/30 rounded-xl border border-slate-800">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-700">
                                                <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-100">{selectedDoctor.name}</h4>
                                                <p className="text-primary-400 text-xs uppercase tracking-wider font-bold">{selectedDoctor.specialty}</p>
                                                <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                                    <MapPin className="w-3 h-3" /> {selectedDoctor.location}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    <input
                                                        type="date"
                                                        value={bookingData.date}
                                                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                                        className="w-full bg-surface-highlight/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500/50 outline-none transition-colors [color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Time</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    <input
                                                        type="time"
                                                        value={bookingData.time}
                                                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                                        className="w-full bg-surface-highlight/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500/50 outline-none transition-colors [color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for Visit</label>
                                            <textarea
                                                value={bookingData.reason}
                                                onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                                                placeholder="Briefly describe your symptoms or reason for visit..."
                                                className="w-full bg-surface-highlight/50 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-primary-500/50 outline-none transition-colors h-24 resize-none"
                                            />
                                        </div>

                                        <button
                                            onClick={() => setBookingStep('success')}
                                            disabled={!bookingData.date || !bookingData.time}
                                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                                ${!bookingData.date || !bookingData.time
                                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                    : 'bg-primary-500 hover:bg-primary-400 text-slate-900 shadow-lg shadow-primary-500/20'
                                                }
                                            `}
                                        >
                                            Confirm Booking
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 space-y-6">
                                        <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto border border-primary-500/20">
                                            <CheckCircle className="w-10 h-10 text-primary-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-serif text-slate-100 mb-2">Appointment Confirmed!</h4>
                                            <p className="text-slate-400">
                                                Your appointment with <span className="text-slate-200 font-bold">{selectedDoctor.name}</span> is scheduled for <span className="text-primary-400 font-bold">{bookingData.date} at {bookingData.time}</span>.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-surface-highlight/30 rounded-xl border border-slate-800 text-sm text-slate-400">
                                            A confirmation email has been sent to your registered address.
                                        </div>
                                        <button
                                            onClick={() => setSelectedDoctor(null)}
                                            className="w-full py-3 bg-surface-highlight hover:bg-slate-800 text-slate-200 rounded-xl font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
