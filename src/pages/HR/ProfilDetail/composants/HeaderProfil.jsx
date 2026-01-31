import React from 'react';
import { MapPin, Star, Heart, Briefcase, MessageSquare, UserCheck } from 'lucide-react';

export default function HeaderProfil({ talent, isFavorite, toggleFavorite, handleInitiateChat, hasProfileImage }) {
    return (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
            <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
            <div className="relative px-10 pb-12 -mt-24">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-8">

                    {/* Conteneur de l'Avatar/Icône */}
                    <div className="relative flex-shrink-0">
                        {hasProfileImage ? (
                            <img
                                src={talent.profileImageUrl}
                                alt={talent.name}
                                className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-2xl"
                            />
                        ) : (
                            <div className="w-40 h-40 rounded-full bg-indigo-100 border-8 border-white shadow-2xl flex items-center justify-center">
                                <UserCheck className="w-20 h-20 text-indigo-500" />
                            </div>
                        )}

                        {/* Bouton Favori */}
                        <button
                            onClick={toggleFavorite}
                            className="absolute -top-2 -right-2 p-3 bg-white rounded-full shadow-xl ring-4 ring-white hover:ring-pink-200 transition transform hover:scale-110"
                        >
                            <Heart
                                className={`w-6 h-6 transition-all ${
                                    isFavorite
                                        ? "text-red-500 fill-red-500"
                                        : "text-gray-400 hover:text-red-500"
                                }`}
                            />
                        </button>
                    </div>

                    {/* Infos principales */}
                    <div className="text-center md:text-left flex-1 min-w-0">
                        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">{talent.name}</h1>
                        <p className="text-xl text-indigo-600 font-semibold mt-2 flex items-center justify-center md:justify-start gap-2">
                            <Briefcase className="w-5 h-5" />
                            {talent.userRole === "job_seeker" ? "Chercheur d’emploi" : "Particulier / Freelance"}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4 text-gray-600">
                            <span className="flex items-center gap-2 font-medium">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                {talent.location}
                            </span>
                            {talent.rating && (
                                <span className="flex items-center gap-2 font-medium">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-gray-900">{talent.rating}/5</span>
                                    <span className="text-sm">({talent.reviewCount || 0} avis)</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Bouton Contacter */}
                    <div className="flex gap-4 flex-shrink-0 mt-4 md:mt-0">
                        <button
                            onClick={handleInitiateChat}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition flex items-center gap-3 transform hover:-translate-y-0.5"
                        >
                            <MessageSquare className="w-6 h-6" />
                            Contacter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}