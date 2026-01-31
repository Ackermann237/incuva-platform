import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

// Composant personnalisé pour un sélecteur
export const Select = ({ value, onChange, options, label, className }) => {
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Composant personnalisé pour une case à cocher
export const Checkbox = ({ checked, onChange, label, className }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

// Composant personnalisé pour un curseur de plage
export const RangeSlider = ({ min, max, value, onChange, className }) => {
  return (
    <div className={className}>
      <input
        type="range"
        min={min}
        max={max}
        value={value[0]}
        onChange={(e) => onChange([Number(e.target.value), value[1]])}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        onChange={(e) => onChange([value[0], Number(e.target.value)])}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min} €</span>
        <span>{max} €</span>
      </div>
      <div className="text-sm text-gray-600 mt-1">
        Plage sélectionnée: {value[0].toLocaleString()} € - {value[1].toLocaleString()} €
      </div>
    </div>
  );
};

// Composant personnalisé pour un bouton toggle
export const ToggleButtonGroup = ({ value, onChange, options, className }) => {
  return (
    <div className={`inline-flex rounded-md shadow-sm isolate ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative px-4 py-2 border text-sm font-medium whitespace-nowrap focus:z-10 ${
            value === option.value
              ? "bg-white text-gray-900 border-purple-500 z-10"
              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
          } first:rounded-l-md last:rounded-r-md border`}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};