import React from 'react';
import { Link } from 'lucide-react';
import { SectionHeader } from './Helpers';

export default function SectionPortfolio({ portfolio }) {
  if (!portfolio?.length) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <SectionHeader icon={Link} title="Portfolio & Réalisations" />
      <div className="grid md:grid-cols-2 gap-5">
        {portfolio.map((item, i) => (
          <div key={i} className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 hover:shadow-md transition">
            <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition mt-2"
              >
                <Link className="w-4 h-4" />
                Voir le projet
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}