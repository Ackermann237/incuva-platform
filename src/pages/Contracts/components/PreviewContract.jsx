// src/pages/Contracts/components/PreviewContract.jsx
import React, { useState, useEffect } from 'react';
import { FileCheck, Edit3, Eye, Sparkles, PenTool, Save, X, AlertCircle } from 'lucide-react';

export default function PreviewContract({
  preview,
  isEditing,
  contentEditableRef,
  setIsEditing,
  handleSaveEdit,
  aiMode = "auto",
  onManualTextChange = null
}) {

  const [localIsEditing, setLocalIsEditing] = useState(isEditing);
  const [tempContent, setTempContent] = useState("");

  // --- FONCTION DE NETTOYAGE DU TEXTE ---
  const formatContent = (content) => {
    if (!content) return "";
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*\*/g, '');
    return formatted;
  };

  // Synchroniser avec le parent et nettoyer le contenu entrant
  useEffect(() => {
    setLocalIsEditing(isEditing);
    setTempContent(formatContent(preview));
  }, [isEditing, preview]);

  const getModeIcon = () => {
    switch(aiMode) {
      case "auto": return <Sparkles className="w-4 h-4 text-blue-600" />;
      case "prompt": return <Edit3 className="w-4 h-4 text-blue-600" />;
      case "manual": return <PenTool className="w-4 h-4 text-blue-600" />;
      default: return <Eye className="w-4 h-4 text-blue-600" />;
    }
  };

  const getModeLabel = () => {
    switch(aiMode) {
      case "auto": return "Généré automatiquement";
      case "prompt": return "Généré avec prompt personnalisé";
      case "manual": return "Saisie manuelle directe";
      default: return "Prévisualisation";
    }
  };

  // Démarre l'édition
  const startEditing = () => {
    setLocalIsEditing(true);
    setIsEditing(true);
  };

  // Annule l'édition
  const cancelEditing = () => {
    setLocalIsEditing(false);
    setIsEditing(false);
    setTempContent(formatContent(preview));
  };

  // Sauvegarde les modifications
  const saveEditing = () => {
    if (contentEditableRef.current) {
      const newContent = contentEditableRef.current.innerHTML;
      setTempContent(newContent);
      handleSaveEdit();
      setLocalIsEditing(false);
    }
  };

  // Gestion du changement en mode manuel
  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    setTempContent(newContent);
    if (onManualTextChange && aiMode === "manual") {
      const event = {
        target: { innerHTML: newContent }
      };
      onManualTextChange(event);
    }
  };

  // Rendu du contenu éditable
  const renderEditableContent = () => {
    return (
      <div className="relative">
        <div
          ref={contentEditableRef}
          contentEditable
          dangerouslySetInnerHTML={{ __html: tempContent }}
          onInput={handleContentChange}
          className="prose prose-sm max-w-none border-2 border-blue-200 rounded-xl p-6 bg-blue-50 min-h-96 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: "break-word"
          }}
        />

        {/* Barre d'outils d'édition */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={saveEditing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
          <button
            onClick={cancelEditing}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>

          {/* Indicateur mode manuel */}
          {aiMode === "manual" && (
            <div className="flex-1 text-right">
              <span className="text-sm text-gray-500 flex items-center justify-end gap-1">
                <PenTool className="w-3 h-3" />
                Saisie en direct activée
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rendu du contenu en lecture seule
  const renderReadOnlyContent = () => {
    return (
      <div className="relative">
        <div
          className="prose prose-sm max-w-none border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 min-h-96 overflow-y-auto max-h-[600px]"
          dangerouslySetInnerHTML={{ __html: formatContent(preview) }}
        />

        {/* Message spécial pour mode manuel vide */}
        {aiMode === "manual" && !preview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
            <PenTool className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Mode saisie manuelle activé</p>
            <p className="text-gray-400 text-sm mt-2">
              Cliquez sur "Modifier" ou commencez à écrire
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Prévisualisation du contrat</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            {getModeIcon()}
            <span>{getModeLabel()}</span>
          </div>
        </div>

        {/* Bouton Modifier (Si pas en édition et qu'il y a du contenu ou mode manuel) */}
        {((preview && !localIsEditing) || (aiMode === "manual" && !localIsEditing)) && (
          <button
            onClick={startEditing}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors ${
              aiMode === "manual" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {aiMode === "manual" ? <PenTool className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {aiMode === "manual" && !preview ? "Commencer la rédaction" : "Modifier"}
          </button>
        )}
      </div>

      {/* AVERTISSEMENT LÉGAL (Toujours visible si contenu) */}
      {preview && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
          <p>
            <strong>AVERTISSEMENT LÉGAL :</strong> Le contenu généré par l'IA doit être <u>impérativement vérifié</u> par un expert juridique qualifié avant l'envoi.
          </p>
        </div>
      )}

      {preview || aiMode === "manual" ? (
        <div>
          {localIsEditing ? renderEditableContent() : renderReadOnlyContent()}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <FileCheck className="w-16 h-16 mx-auto mb-4" />
          <p>Générez ou saisissez un contrat pour le prévisualiser</p>
          <div className="mt-4 text-sm bg-gray-50 inline-block p-4 rounded-xl">
            <p className="font-semibold text-gray-600 mb-2">Options disponibles :</p>
            <ul className="space-y-1 text-left">
              <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-600"/> <strong>Automatique</strong> : Rapide et standard</li>
              <li className="flex items-center gap-2"><Edit3 className="w-3 h-3 text-blue-600"/> <strong>Avec Prompt</strong> : Personnalisé par l'IA</li>
              <li className="flex items-center gap-2"><PenTool className="w-3 h-3 text-blue-600"/> <strong>Manuel</strong> : Saisie libre totale</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}