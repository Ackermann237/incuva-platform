import React from 'react';
import { Briefcase } from 'lucide-react';

export default function Header() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full shadow-lg mx-auto">
        <Briefcase className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
        Offres d'emploi disponibles
      </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Trouvez le poste qui correspond parfaitement à vos compétences et aspirations
      </p>
    </div>
  );
}