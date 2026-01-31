import React from 'react';
import { Mail, Phone, Linkedin } from 'lucide-react';

// En-tête de section plus uniforme
export const SectionHeader = ({ icon: Icon, title }) => (
  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b pb-3 text-gray-800">
    <Icon className="w-7 h-7 text-indigo-600" />
    {title}
  </h2>
);

// Item de contact stylisé
export const ContactItem = ({ icon: Icon, value, isLink = false }) => (
  <div className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
    <Icon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
    <div>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 font-medium hover:text-indigo-700 transition"
        >
          {value.replace(/^(mailto:|tel:|https?:\/\/)/, "")}
        </a>
      ) : (
        <span className="text-gray-700 font-medium">{value}</span>
      )}
    </div>
  </div>
);