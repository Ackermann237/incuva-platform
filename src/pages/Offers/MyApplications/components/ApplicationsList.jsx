// src/pages/Offers/MyApplications/components/ApplicationsList.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import ApplicationItem from './ApplicationItem';

export default function ApplicationsList({ applications, loading, navigate, fetchApplications }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Mes candidatures ({applications.length})
          </h2>
          {loading && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {applications.map((application) => (
          <ApplicationItem
            key={application.application_id || application.id}
            application={application}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}