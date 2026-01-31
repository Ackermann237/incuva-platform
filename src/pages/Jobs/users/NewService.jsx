// frontend/src/pages/users/NewService.jsx
import React, { useState } from 'react';
import { createService } from '../../../services/jobs';
import { useNavigate } from 'react-router-dom';

const NewService = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'maintenance',
    duration: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await createService(formData);
    setLoading(false);

    if (res.success) {
      alert('Service créé avec succès !');
      navigate('/user_dashboard');
    } else {
      setError(res.error || 'Erreur lors de la création du service');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Proposer un Service</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium">Titre du service</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded p-2 mt-1"
            placeholder="Ex: Réparation plomberie à domicile"
          />
        </div>

        <div>
          <label className="block font-medium">Description détaillée</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            className="w-full border rounded p-2 mt-1"
            placeholder="Décrivez votre service..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Prix (en €)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          <div>
            <label className="block font-medium">Durée estimée (heures)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Catégorie</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded p-2 mt-1">
            <option value="maintenance">Maintenance / Réparation</option>
            <option value="cleaning">Ménage</option>
            <option value="gardening">Jardinage</option>
            <option value="babysitting">Garde d'enfants</option>
            <option value="tutoring">Cours particuliers</option>
            <option value="delivery">Livraison</option>
            <option value="other">Autre</option>
          </select>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Publier le service'}
        </button>
      </form>
    </div>
  );
};

export default NewService;