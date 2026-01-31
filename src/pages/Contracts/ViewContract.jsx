// src/pages/Contracts/ViewContract.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Euro,
  Briefcase,
  AlertCircle,
  Loader2,
  Signature,
} from "lucide-react";
import contractsService from "../../services/contracts";
import { fr } from "date-fns/locale";
import { format } from "date-fns";

export default function ViewContract({ contractId, onSign, onReject, onClose }) {
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [isCandidate, setIsCandidate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!contractId) {
      setError("ID du contrat manquant");
      setLoading(false);
      return;
    }

    const fetchContract = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await contractsService.viewContract(contractId);
        if (res.success) {
          setContract(res.contract);
          setCompanyName(res.company_name);
          setIsCandidate(res.is_candidate);
        } else {
          setError(res.error || "Contrat non trouvé");
        }
      } catch (err) {
        console.error("Erreur chargement contrat:", err);
        setError("Impossible de charger le contrat");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handleAction = async (action) => {
    if (!isCandidate || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await contractsService.updateContractStatus(contractId, action);
      if (res.success) {
        setContract((prev) => ({ ...prev, status: res.status }));
        alert(`Contrat ${action === "accept" ? "accepté" : "refusé"} avec succès !`);
        if (action === "reject") onClose?.();
      } else {
        alert(res.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!contract) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Contrat - ${contract.position}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            .info { margin: 20px 0; }
            .info strong { display: inline-block; width: 150px; }
            .status { padding: 8px 16px; border-radius: 999px; font-weight: bold; display: inline-block; margin-top: 20px; }
            .accepted { background: #dcfce7; color: #166534; }
            .pending { background: #dbeafe; color: #1e40af; }
            .rejected { background: #fee2e2; color: #991b1b; }
            .signature { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ccc; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Contrat de travail</h1>
          <div class="info"><strong>Poste :</strong> ${contract.position}</div>
          <div class="info"><strong>Candidat :</strong> ${contract.candidate_name}</div>
          <div class="info"><strong>Entreprise :</strong> ${companyName}</div>
          <div class="info"><strong>Salaire :</strong> ${Number(contract.salary).toLocaleString()} € brut/an</div>
          <div class="info"><strong>Type :</strong> ${contract.contract_type}</div>
          <div class="info"><strong>Date :</strong> ${format(new Date(contract.created_at), "dd MMMM yyyy", { locale: fr })}</div>
          <div class="info"><strong>Statut :</strong> 
            <span class="status ${contract.status}">
              ${contract.status === "accepted" ? "Accepté" : contract.status === "pending" ? "En attente" : "Refusé"}
            </span>
          </div>
          ${contract.description ? `<div class="info"><strong>Description :</strong><p>${contract.description.replace(/\n/g, "<br>")}</p></div>` : ""}
          ${contract.status === "accepted" ? `<div class="signature"><strong>Signé électroniquement le</strong> ${format(new Date(contract.updated_at), "dd MMMM yyyy à HH:mm", { locale: fr })}</div>` : ""}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusConfig = (status) => {
    const config = {
      accepted: { label: "Accepté", icon: <CheckCircle className="w-5 h-5" />, color: "bg-green-100 text-green-700 border-green-200" },
      pending: { label: "En attente", icon: <Clock className="w-5 h-5" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
      rejected: { label: "Refusé", icon: <XCircle className="w-5 h-5" />, color: "bg-red-100 text-red-700 border-red-200" },
    };
    return config[status] || config.pending;
  };

  // === ÉCRAN DE CHARGEMENT ===
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  // === ERREUR ===
  if (error || !contract) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Contrat non trouvé</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          Fermer
        </button>
      </div>
    );
  }

  const status = getStatusConfig(contract.status);

  return (
    <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Fermer
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
        </div>

        {/* Contrat Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <FileText className="w-8 h-8 md:w-10 md:h-10" />
                  Contrat de travail
                </h1>
                <p className="text-white/90 mt-1 text-sm">ID: {contractId}</p>
              </div>
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 border-2 ${status.color}`}>
                {status.icon}
                <span className="font-bold">{status.label}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Candidat", value: contract.candidate_name, gradient: "from-blue-400 to-blue-500" },
                { icon: Building2, label: "Entreprise", value: companyName, gradient: "from-blue-500 to-blue-600" },
                { icon: Briefcase, label: "Poste", value: contract.position, gradient: "from-blue-500 to-blue-600" },
                { icon: Euro, label: "Salaire brut annuel", value: `${Number(contract.salary).toLocaleString()} €`, gradient: "from-blue-500 to-blue-600" },
                { icon: FileText, label: "Type de contrat", value: contract.contract_type, gradient: "from-blue-500 to-blue-600" },
                { icon: Calendar, label: "Date de création", value: format(new Date(contract.created_at), "dd MMMM yyyy", { locale: fr }), gradient: "from-blue-500 to-blue-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-white`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <p className="font-bold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {contract.description && (
              <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-4">Description / Avantages</p>
                <div
                  className="prose prose-blue max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ __html: contract.description }}
                />
              </div>
            )}

            {/* Signature électronique */}
            {contract.status === "accepted" && (
              <div className="p-6 bg-green-50 rounded-xl border-2 border-green-300">
                <p className="font-bold text-green-800 flex items-center gap-2">
                  <Signature className="w-6 h-6" />
                  Contrat signé électroniquement
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Le {format(new Date(contract.updated_at || contract.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
            )}

            {/* Boutons pour le candidat */}
            {isCandidate && contract.status === "pending" && (
              <div className="flex gap-4 justify-center pt-6 border-t">
                <button
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Refuser
                </button>
                <button
                  onClick={onSign}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Signature className="w-5 h-5" />
                  Lire le contrat
                </button>
              </div>
            )}

            {/* Pour l'entreprise */}
            {!isCandidate && contract.status === "pending" && (
              <div className="text-center py-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800 font-medium">En attente de la signature du candidat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}