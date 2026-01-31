// src/pages/Jobs/Entreprises/TechnicalTest/components/questions/MCQTips.jsx
import React from 'react';
import { Lightbulb, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const MCQTips = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-900">Conseils pour créer de bonnes questions MCQ</h4>
          <p className="text-blue-800 text-sm mt-1">
            Créez des questions efficaces qui testent réellement les connaissances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-900">À faire</h5>
              <ul className="text-sm text-gray-600 space-y-1 mt-1">
                <li>• Inclure 3-4 options par question</li>
                <li>• Les réponses fausses doivent être plausibles</li>
                <li>• Une seule réponse correcte pour les questions simples</li>
                <li>• Les options doivent être de longueur similaire</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-900">À éviter</h5>
              <ul className="text-sm text-gray-600 space-y-1 mt-1">
                <li>• Les options "Toutes ces réponses" ou "Aucune"</li>
                <li>• Les indices grammaticales évidents</li>
                <li>• Les questions trop longues ou complexes</li>
                <li>• Les options trop similaires</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white border border-blue-300 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Exemple de bonne question :</strong><br/>
              "Quelle méthode JavaScript permet d'ajouter un élément à la fin d'un tableau ?"<br/>
              Options: A) push(), B) pop(), C) shift(), D) unshift()
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQTips;