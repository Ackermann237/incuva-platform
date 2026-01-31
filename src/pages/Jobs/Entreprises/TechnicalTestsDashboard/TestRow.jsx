// src/pages/Jobs/Entreprises/TechnicalTestsDashboard/TestRow.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Trash2,
  Copy,
  FileText,
  Code,
  CheckSquare,
  Clock,
  Users,
  TrendingUp,
  Layers,
  MoreVertical,
  BarChart
} from 'lucide-react';

export default function TestRow({
  test,
  onViewDetails,
  onViewStatistics,
  onEdit,
  onCopyLink,
  onDelete,
  onDuplicate
}) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Actif',
      draft: 'Brouillon',
      archived: 'Archivé'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'coding': return <Code className="w-4 h-4 text-green-600" />;
      case 'open_ended': return <FileText className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const questionTypes = test.questions?.reduce((acc, q) => {
    if (!acc.includes(q.type)) acc.push(q.type);
    return acc;
  }, []);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{test.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">{test.questions?.length || 0} questions</span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-600">{test.duration} min</span>
              </div>
              {test.is_public && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Public</span>
                </>
              )}
            </div>
            {questionTypes && questionTypes.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {questionTypes.map(type => (
                  <div key={type} className="flex items-center gap-1">
                    {getQuestionTypeIcon(type)}
                    <span className="text-xs text-gray-500">
                      {type === 'mcq' ? 'QCM' : type === 'coding' ? 'Code' : 'Ouverte'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{test.job_title || 'Non assigné'}</span>
        </div>
      </td>

      <td className="py-4 px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{test.candidate_count || 0} candidats</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Score: {test.average_score?.toFixed(1) || '0'}%</span>
          </div>
        </div>
      </td>

      <td className="py-4 px-6">
        {getStatusBadge(test.status)}
      </td>

      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate(`/test-results/${test.id}`)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir les résultats"
          >
            <BarChart className="w-4 h-4" />
          </button>

          {test.is_public && (
            <button
              onClick={onCopyLink}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Copier le lien"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button
                  onClick={onViewStatistics}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <BarChart className="w-4 h-4" />
                  Statistiques
                </button>

                <button
                  onClick={() => navigate(`/test-results/${test.id}`)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <BarChart className="w-4 h-4" />
                  Résultats des candidats
                </button>

                <button
                  onClick={onDuplicate}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </button>

                <button
                  onClick={onDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}