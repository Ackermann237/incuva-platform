// src/components/jarvis/Markdown.jsx
// Rendu Markdown des réponses de Jarvis. Le HTML brut n'est pas interprété (react-markdown l'affiche comme du texte),
// ce qui protège contre le contenu injecté par le modèle ou par des données d'entreprise.
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  table: ({ node, ...props }) => (
    <div className="jv-table-wrap">
      <table {...props} />
    </div>
  ),
};

function Markdown({ children }) {
  return (
    <div className="jv-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default React.memo(Markdown);
