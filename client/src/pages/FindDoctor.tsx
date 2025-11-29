import React, { useState } from 'react';
import { Search, MapPin, Star, Calendar, Clock, Filter, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function FindDoctor() {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');

    const doctors = [
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

    const specialties = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Pediatrician', 'General Physician'];

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="max-w-full mx-auto pb-20 relative min-w-0">
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-serif text-slate-100 mb-4">Find a Specialist</h1>
                <p className="text-slate-400">Book appointments with top-rated doctors near you.</p>
            </div>

            {/* Search and Filter */}
            <div className="glass-card p-6 rounded-2xl mb-10 border border-white/5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search doctors, specialties, conditions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-highlight/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-200 focus:border-teal-500/50 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {specialties.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpecialty(spec)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedSpecialty === spec
                                    ? 'bg-teal-500 text-white border-teal-500'
                                    : 'bg-surface-highlight/30 text-slate-400 border-white/5 hover:border-white/20'
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
                {filteredDoctors.map(doctor => (
                    <div key={doctor.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all group">
                        <div className="flex items-start gap-4 mb-6">
                            <img
                                src={doctor.image}
                                alt={doctor.name}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 mb-1">{doctor.name}</h3>
                                <p className="text-teal-400 text-sm font-medium mb-2">{doctor.specialty}</p>
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{doctor.rating}</span>
                                    <span className="text-slate-500 font-normal">({doctor.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                {doctor.location}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                {doctor.availability}
                            </div>
                        </div>

                        <button className="w-full bg-surface-highlight hover:bg-teal-500 hover:text-white text-slate-300 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-teal-500/20">
                            Book Appointment <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
