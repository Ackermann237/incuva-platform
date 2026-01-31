// src/pages/Employees/Payroll/components/Bulletins/CompanyTab.jsx
import React from 'react';
import { Building, MapPin, Phone, Mail as MailIcon } from 'lucide-react';

const CompanyTab = ({ company }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{company.company_name}</h3>
            <p className="text-gray-300">Informations administratives officielles</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.siret && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-300 text-sm">SIRET</p>
              <p className="font-medium font-mono text-lg">{company.siret}</p>
            </div>
          )}
          {company.industry && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-300 text-sm">Secteur d'activité</p>
              <p className="font-medium text-lg">{company.industry}</p>
            </div>
          )}
          {company.company_size && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-300 text-sm">Taille</p>
              <p className="font-medium text-lg">{company.company_size}</p>
            </div>
          )}
          {company.city && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-300 text-sm">Ville</p>
              <p className="font-medium text-lg">{company.city}</p>
            </div>
          )}
          {company.country && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-300 text-sm">Pays</p>
              <p className="font-medium text-lg">{company.country}</p>
            </div>
          )}
          {company.geographic_area && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-300 text-sm">Zone géographique</p>
              <p className="font-medium text-lg capitalize">{company.geographic_area}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Localisation
          </h4>
          <div className="space-y-3">
            <p className="text-gray-900 font-medium">{company.company_name}</p>
            {company.address ? (
              <div className="space-y-2">
                <p className="text-gray-700">{company.address.street}, {company.address.postal_code} {company.address.city}</p>
                <p className="text-gray-700">{company.city}, {company.country}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Adresse non spécifiée</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Contact & Responsable
          </h4>
          <div className="space-y-3">
            {company.email && (
              <div className="flex items-center gap-3">
                <MailIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{company.phone}</span>
              </div>
            )}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">Service RH</p>
              <p className="text-gray-900 font-medium">Responsable paie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyTab;