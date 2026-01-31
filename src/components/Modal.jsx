// Version alternative du Modal.jsx avec fond transparent
import React from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  hideHeader = false,
  noPadding = false,
  transparentBackground = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay de fermeture */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Contenu de la modale - complètement transparent */}
      <div className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        {/* En-tête optionnel */}
        {!hideHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Contenu enfant */}
        <div className={noPadding ? '' : 'p-1'}>
          {children}
        </div>
      </div>
    </div>
  );
}