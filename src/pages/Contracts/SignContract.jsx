// src/pages/Contracts/SignContract.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  AlertCircle,
  Signature,
  PenTool,
  Type,
  Eraser,
  Undo,
  Redo,
  Download,
  Save,
  User,
  Building2
} from "lucide-react";
import contractsService from "../../services/contracts";

export default function SignContract({ contractId, onSuccess, onClose }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // États pour la signature
  const [signatureMode, setSignatureMode] = useState("type"); // "type" ou "draw"
  const [typedSignature, setTypedSignature] = useState("");
  const [signatureCanvasRef, setSignatureCanvasRef] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [signatureHistory, setSignatureHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Canvas ref
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Charger le contrat
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
          setContract(res);
          // Pré-remplir la signature typée avec le nom du candidat si disponible
          if (res.contract?.candidate_name) {
            setTypedSignature(res.contract.candidate_name);
          }
        } else {
          setError(res.error || "Contrat non trouvé");
        }
      } catch (err) {
        setError("Impossible de charger le contrat");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  // Initialiser le canvas pour le dessin
  useEffect(() => {
    if (signatureMode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Configurer le canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1e40af"; // Bleu foncé
      ctx.lineWidth = 2;

      ctxRef.current = ctx;

      // Effacer le canvas initialement
      clearCanvas();
    }
  }, [signatureMode]);

  // Fonctions pour le dessin de signature
  const startDrawing = (e) => {
    if (signatureMode !== "draw") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastX(x);
    setLastY(y);

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);

    // Sauvegarder l'état actuel dans l'historique
    saveToHistory();
  };

  const draw = (e) => {
    if (!isDrawing || signatureMode !== "draw") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    ctxRef.current.closePath();
  };

  const clearCanvas = () => {
    if (!ctxRef.current) return;

    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

    // Ajouter un état vide à l'historique
    saveToHistory();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = ctxRef.current.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = signatureHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);

    setSignatureHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevImageData = signatureHistory[historyIndex - 1];
      ctxRef.current.putImageData(prevImageData, 0, 0);
    } else {
      clearCanvas();
    }
  };

  const redo = () => {
    if (historyIndex < signatureHistory.length - 1) {
      const nextHistoryIndex = historyIndex + 1;
      setHistoryIndex(nextHistoryIndex);
      const nextImageData = signatureHistory[nextHistoryIndex];
      ctxRef.current.putImageData(nextImageData, 0, 0);
    }
  };

  const getSignatureData = () => {
    if (signatureMode === "type") {
      return {
        method: "typed",
        value: typedSignature.trim(),
        timestamp: new Date().toISOString()
      };
    } else {
      // Pour le dessin, convertir le canvas en image base64
      const canvas = canvasRef.current;
      if (!canvas) return null;

      return {
        method: "drawn",
        value: canvas.toDataURL("image/png"),
        timestamp: new Date().toISOString()
      };
    }
  };

  const handleSignAndAccept = async () => {
    if (signatureMode === "type" && !typedSignature.trim()) {
      setError("Veuillez entrer votre nom complet pour signer");
      return;
    }

    if (signatureMode === "draw") {
      // Vérifier si la signature a été dessinée
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const isEmpty = imageData.data.every(channel => channel === 0);

      if (isEmpty) {
        setError("Veuillez dessiner votre signature");
        return;
      }
    }

    setActionLoading(true);
    setError("");

    try {
      // Récupérer les données de signature
      const signatureData = getSignatureData();

      // Signer le contrat
      const res = await contractsService.updateContractStatus(contractId, "accept");

      if (res.success) {
        // Enregistrer la signature (vous devrez adapter votre backend pour accepter ces données)
        await saveSignatureToContract(contractId, signatureData);

        onSuccess?.();
      } else {
        setError(res.error || "Échec de la signature");
      }
    } catch (err) {
      setError("Erreur réseau lors de la signature");
    } finally {
      setActionLoading(false);
    }
  };

  const saveSignatureToContract = async (contractId, signatureData) => {
    // Implémentez cette fonction pour sauvegarder la signature dans votre backend
    try {
      const response = await fetch(`/api/contracts/${contractId}/signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signatureData)
      });

      return await response.json();
    } catch (error) {
      console.error("Erreur sauvegarde signature:", error);
      // On continue même si la sauvegarde échoue, le contrat est déjà accepté
    }
  };

  const downloadSignedContract = () => {
    if (!contract) return;

    // Créer un document PDF avec le contrat signé
    const printWindow = window.open("", "_blank");

    const signatureHTML = signatureMode === "type"
      ? `<div class="signature typed-signature">
           <p><strong>Signé par:</strong> ${typedSignature}</p>
           <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
           <p><strong>Méthode:</strong> Signature numérique</p>
         </div>`
      : `<div class="signature drawn-signature">
           <p><strong>Signature:</strong></p>
           <img src="${getSignatureData().value}" alt="Signature" style="max-width: 300px; margin: 10px 0; border: 1px solid #ccc;" />
           <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
         </div>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Contrat signé - ${contract.contract?.position || "Poste"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #333;
            }
            .contract-header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .contract-header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
            }
            .contract-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              border-left: 4px solid #2563eb;
            }
            .contract-content {
              margin: 30px 0;
              text-align: justify;
            }
            .signature-section {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px dashed #ccc;
            }
            .signature {
              margin: 30px 0;
              padding: 20px;
              background: #f0f9ff;
              border-radius: 10px;
              border: 1px solid #bae6fd;
            }
            .typed-signature {
              font-family: 'Brush Script MT', cursive;
              font-size: 24px;
              color: #1e40af;
            }
            .parties {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .party {
              flex: 1;
              padding: 20px;
            }
            .company {
              border-right: 1px solid #ccc;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              color: rgba(37, 99, 235, 0.1);
              z-index: -1;
              font-weight: bold;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">SIGNÉ</div>
          
          <div class="contract-header">
            <h1>CONTRAT DE TRAVAIL</h1>
            <p>Document légalement signé</p>
          </div>
          
          <div class="contract-info">
            <p><strong>Poste:</strong> ${contract.contract?.position || "Non spécifié"}</p>
            <p><strong>Candidat:</strong> ${contract.contract?.candidate_name || "Non spécifié"}</p>
            <p><strong>Entreprise:</strong> ${contract.company_name || "Non spécifié"}</p>
            <p><strong>Salaire:</strong> ${Number(contract.contract?.salary || 0).toLocaleString()} € brut/an</p>
            <p><strong>Type de contrat:</strong> ${contract.contract?.contract_type || "Non spécifié"}</p>
            <p><strong>Date de création:</strong> ${new Date(contract.contract?.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="contract-content">
            ${cleanAndFormatContent(contract.contract?.contract_content || "")}
          </div>
          
          <div class="signature-section">
            <h2>SECTION DE SIGNATURE</h2>
            <p>Le présent contrat a été signé électroniquement par les parties ci-dessous.</p>
            
            ${signatureHTML}
            
            <div class="parties">
              <div class="party company">
                <h3>Pour l'Entreprise</h3>
                <p><strong>Nom:</strong> ${contract.company_name || "Entreprise"}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                <div style="margin-top: 50px; border-top: 1px solid #333; width: 200px;">
                  <p style="text-align: center;">Signature et cachet</p>
                </div>
              </div>
              
              <div class="party candidate">
                <h3>Pour le Candidat</h3>
                <p><strong>Nom:</strong> ${contract.contract?.candidate_name || "Candidat"}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                <div style="margin-top: 50px;">
                  <p><em>Signature ci-dessus</em></p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 50px; font-size: 12px; color: #666;">
              <p>Ce document a été généré électroniquement et ne nécessite pas de signature manuscrite originale.</p>
              <p>ID du contrat: ${contractId} | Généré le: ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Imprimer le contrat signé
            </button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Fonction de formatage (conservée de l'ancien code)
  const cleanAndFormatContent = (htmlContent) => {
    if (!htmlContent) return "";
    let content = htmlContent;
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*\*/g, '');
    return content
      .replace(/<h1>/g, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b pb-2">')
      .replace(/<h2>/g, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">')
      .replace(/<h3>/g, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">')
      .replace(/<p>/g, '<p class="mb-3 text-gray-700 leading-relaxed text-justify">')
      .replace(/<ul>/g, '<ul class="list-disc list-outside ml-6 space-y-1 my-4 text-gray-700">')
      .replace(/<ol>/g, '<ol class="list-decimal list-outside ml-6 space-y-1 my-4 text-gray-700">')
      .replace(/<li>/g, '<li class="pl-1">')
      .replace(/<strong>/g, '<strong class="font-bold text-gray-900">')
      .replace(/<hr>/g, '<hr class="my-6 border-gray-200">');
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error || !contract) {
    return (
      <div className="flex flex-col items-center p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur</h3>
        <p className="text-gray-700 max-w-md">{error || "Contrat non trouvé"}</p>
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        {/* Header principal */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold">Signature électronique</h1>
                <p className="text-white/90 text-sm mt-1">
                  Poste : {contract.contract?.position}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSignedContract}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                title="Télécharger le contrat signé"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu en deux colonnes */}
        <div className="bg-white rounded-b-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Colonne gauche : Contrat */}
            <div className="lg:border-r lg:pr-8">
              <div className="sticky top-0 bg-white pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Contrat à signer
                </h2>

                {/* Informations principales */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Candidat</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {contract.contract?.candidate_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Entreprise</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {contract.company_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu du contrat */}
              <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
                <div
                  dangerouslySetInnerHTML={{
                    __html: cleanAndFormatContent(contract.contract?.contract_content)
                  }}
                />
              </div>
            </div>

            {/* Colonne droite : Signature */}
            <div className="lg:pl-8">
              <div className="sticky top-0 bg-white pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Signature className="w-6 h-6 text-blue-600" />
                  Signature électronique
                </h2>
              </div>

              {/* Sélecteur de mode de signature */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Choisissez votre méthode de signature :</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSignatureMode("type")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                      signatureMode === "type"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Type className="w-5 h-5" />
                    <span className="font-medium">Nom complet</span>
                  </button>
                  <button
                    onClick={() => setSignatureMode("draw")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                      signatureMode === "draw"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <PenTool className="w-5 h-5" />
                    <span className="font-medium">Dessiner</span>
                  </button>
                </div>
              </div>

              {/* Zone de signature selon le mode */}
              <div className="mb-6">
                {signatureMode === "type" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entrez votre nom complet pour signer
                      </label>
                      <input
                        type="text"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Votre nom complet"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        En entrant votre nom, vous acceptez les termes du contrat.
                      </p>
                    </div>

                    {/* Aperçu de la signature typée */}
                    {typedSignature.trim() && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Aperçu de votre signature :</p>
                        <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-2xl font-signature text-blue-700">{typedSignature}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">Dessinez votre signature dans la zone ci-dessous :</p>

                      {/* Canvas pour le dessin */}
                      <div className="relative">
                        <canvas
                          ref={canvasRef}
                          className="w-full h-48 bg-white border-2 border-gray-300 rounded-lg cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            startDrawing(e.touches[0]);
                          }}
                          onTouchMove={(e) => {
                            e.preventDefault();
                            draw(e.touches[0]);
                          }}
                          onTouchEnd={stopDrawing}
                        />

                        {/* Lignes de guide */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="h-full flex flex-col justify-between">
                            <div className="h-px bg-gray-200 w-full"></div>
                            <div className="h-px bg-gray-200 w-full"></div>
                            <div className="h-px bg-gray-200 w-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Outils de dessin */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                          <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Annuler"
                          >
                            <Undo className="w-5 h-5" />
                          </button>
                          <button
                            onClick={redo}
                            disabled={historyIndex >= signatureHistory.length - 1}
                            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Rétablir"
                          >
                            <Redo className="w-5 h-5" />
                          </button>
                          <button
                            onClick={clearCanvas}
                            className="p-2 text-red-600 hover:text-red-800"
                            title="Effacer tout"
                          >
                            <Eraser className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="text-xs text-gray-500">
                          Utilisez la souris ou votre doigt pour signer
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Avertissement légal */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-blue-900">Consentement à la signature électronique</p>
                    <p className="text-sm text-blue-800 mt-1">
                      En signant ce contrat, vous reconnaissez avoir lu, compris et accepté tous les termes.
                      Cette signature électronique a la même valeur légale qu'une signature manuscrite originale.
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-4">
                <button
                  onClick={handleSignAndAccept}
                  disabled={actionLoading || (signatureMode === "type" && !typedSignature.trim())}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Signer et Accepter le Contrat
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading}
                  className="w-full px-8 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Refuser le Contrat
                </button>

                <button
                  onClick={downloadSignedContract}
                  className="w-full px-8 py-3.5 border-2 border-blue-200 text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger une copie
                </button>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styles supplémentaires */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          border-radius: 10px;
        }
        .font-signature {
          font-family: 'Brush Script MT', 'Segoe Script', cursive;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Fonction handleAction pour le rejet (conservée de l'ancien code)
const handleAction = async (action) => {
  if (action === "reject") {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser ce contrat ? Cette action est irréversible.")) {
      return;
    }

    // Votre logique existante pour rejeter le contrat
    try {
      const res = await contractsService.updateContractStatus(contractId, "reject");
      if (res.success) {
        onSuccess?.();
      }
    } catch (err) {
      setError("Erreur lors du refus du contrat");
    }
  }
};