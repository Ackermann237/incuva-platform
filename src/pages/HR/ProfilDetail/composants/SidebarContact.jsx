import React from 'react';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { ContactItem } from './Helpers';

export default function SidebarContact({ talent }) {
  const { email, phone, linkedin } = talent;

  // N'afficher la section que si au moins un champ est présent
  if (!email && !phone && !linkedin) return null;

  return (
    <div className="bg-indigo-50 rounded-3xl shadow-xl p-8 border border-indigo-200">
      <h3 className="text-xl font-bold mb-6 text-gray-900">Coordonnées</h3>
      <div className="space-y-4">
        {email && (
            <ContactItem icon={Mail} value={`mailto:${email}`} isLink={true} />
        )}
        {phone && (
            <ContactItem icon={Phone} value={`tel:${phone}`} isLink={true} />
        )}
        {linkedin && (
            <ContactItem icon={Linkedin} value={linkedin} isLink={true} />
        )}
      </div>
    </div>
  );
}