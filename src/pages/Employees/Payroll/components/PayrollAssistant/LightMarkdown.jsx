// src/pages/Employees/Payroll/components/PayrollAssistant/LightMarkdown.jsx
// Markdown des réponses de l'assistant (thème clair). Le HTML brut n'est pas interprété.
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  p: ({ node, ...props }) => <p className="my-1.5 first:mt-0 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="my-1.5 list-disc space-y-1 pl-5" {...props} />,
  ol: ({ node, ...props }) => <ol className="my-1.5 list-decimal space-y-1 pl-5" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
  h1: ({ node, ...props }) => <h4 className="mb-1 mt-3 text-base font-bold text-gray-900" {...props} />,
  h2: ({ node, ...props }) => <h4 className="mb-1 mt-3 text-base font-bold text-gray-900" {...props} />,
  h3: ({ node, ...props }) => <h5 className="mb-1 mt-2 text-sm font-bold text-gray-900" {...props} />,
  a: ({ node, ...props }) => <a className="text-blue-700 underline" target="_blank" rel="noopener noreferrer" {...props} />,
  code: ({ node, ...props }) => <code className="rounded bg-white/70 px-1 py-0.5 text-[0.85em]" {...props} />,
  table: ({ node, ...props }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-xs" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => <th className="border-b border-gray-200 bg-gray-50 px-2 py-1.5 font-semibold" {...props} />,
  td: ({ node, ...props }) => <td className="border-b border-gray-100 px-2 py-1.5" {...props} />,
};

export default function LightMarkdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
