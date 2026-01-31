import React, { useState, useEffect } from "react";
import { Calendar, Video, Phone, MapPin, FileText, Upload, Plus, Clock, User } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { sendMessage, scheduleInterview } from "../../services/messaging";

export default function ScheduleInterview() {
    const { chatId } = useParams(); // <-- RÉCUPÉRER chatId DEPUIS L'URL
    const navigate = useNavigate();

    const [receiverId, setReceiverId] = useState("");
    const [datetime, setDatetime] = useState("");
    const [type, setType] = useState("video");
    const [documents, setDocuments] = useState([""]);
    const [supplementaryDoc, setSupplementaryDoc] = useState(null);
    const [loading, setLoading] = useState(false);

    // Charger receiverId depuis la conversation
      useEffect(() => {
        async function loadReceiver() {
          if (!chatId) return;
          const res = await import("../../services/messaging").then(m => m.getConversation(chatId));
          if (res.success && res.other_participant_id) {
            setReceiverId(res.other_participant_id);
          }
        }
        loadReceiver();
      }, [chatId]);

    function updateDocument(index, value) {
        const newDocs = [...documents];
        newDocs[index] = value;
        setDocuments(newDocs);
    }

    function addDocumentField() {
        setDocuments([...documents, ""]);
    }

    function removeDocument(index) {
        if (documents.length > 1) {
            setDocuments(documents.filter((_, i) => i !== index));
        }

    }

    async function schedule() {
      if (!datetime || !type) return;
      setLoading(true);

      // ----> NOUVELLE LIGNE : conversion du format
      const formattedDatetime = datetime.replace('T', ' ');

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('receiver_id', receiverId);
      formData.append('datetime', formattedDatetime);   // <-- ici la chaîne correcte
      formData.append('type', type);
      formData.append('documents_to_bring', JSON.stringify(documents));

      if (supplementaryDoc) {
        formData.append('supplementary_document', supplementaryDoc);
      }

      try {
        // Appel API pour planifier l'entretien
        const response = await scheduleInterview(formData);
        if (response.success) {
          // Préparer le contenu du message à envoyer

          // Envoyer le message dans la conversation
          await sendMessage(chatId, 'Félicitations, Vous avez un entretien', receiverId);
          // <‑‑ REDIRECTION
          navigate(`/messaging/conversation/${chatId}`);

          // Rediriger ou afficher un message de succès
          alert('Entretien planifié avec succès !');
        } else {
          alert('Erreur lors de la planification de l\'entretien.');
        }
      } catch (error) {
        console.error("Erreur lors de la planification :", error);
        alert('Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    }


    const typeOptions = [
        { value: "video", label: "Visioconférence", icon: Video, color: "from-blue-500 to-blue-600" },
        { value: "presentiel", label: "Présentiel", icon: MapPin, color: "from-green-500 to-green-600" },
        { value: "phone", label: "Téléphone", icon: Phone, color: "from-purple-500 to-purple-600" }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement...</p>       .
            </div>
            </div>
        );
    }
    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Planifier un entretien</h1>
                            <p className="text-gray-500 mt-1">Organisez votre rencontre professionnelle</p>
                        </div>
                    </div>
                </div>
                {/* Main Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Date & Time */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Date & Heure
                        </label>
                        <input  type="datetime-local"
                                value={datetime}
                                onChange={(e) => setDatetime(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-700"
                        />
                    </div>
                    {/* Interview Type */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Video className="w-5 h-5 text-blue-500" />
                            Type d'entretien
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {typeOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = type === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setType(option.value)}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${                      
                                            isSelected                        
                                                ? "border-blue-500 bg-blue-50 shadow-lg scale-105"                        
                                                : "border-gray-200 hover:border-gray-300 hover:shadow-md"                    
                                        }
                                        `}
                                    >
                                        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${option.color} mb-2`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <p className={`font-semibold ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                                            {option.label}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Documents Required */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Documents à apporter (Facultatif)
                        </label>
                        <div className="space-y-3">
                            {documents.map((doc, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={doc}
                                        onChange={(e) => updateDocument(idx, e.target.value)}
                                        placeholder="Ex: CV, Portfolio, Lettre de motivation..."
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-700"
                                    />
                                    {documents.length > 1 && (
                                        <button
                                            onClick={() => removeDocument(idx)}
                                            className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addDocumentField}
                            className="mt-3 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter un document
                        </button>
                    </div>
                    {/* Supplementary Document */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Upload className="w-5 h-5 text-blue-500" />
                            Document complémentaire (Facultatif)
                            <span className="text-xs text-gray-500 font-normal">(PDF/DOC - optionnel)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setSupplementaryDoc(e.target.files[0])}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100 cursor-pointer"
                            />
                        </div>
                        {supplementaryDoc && (
                            <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {supplementaryDoc.name}
                            </p>
                        )}
                    </div>
                    {/* Submit Button */}
                    <button
                        onClick={schedule}
                        disabled={!datetime || !type}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        Confirmer l'entretien
                    </button>
                </div>
            </div>
        </div>
    );
}