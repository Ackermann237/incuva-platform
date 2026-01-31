// src/pages/Jobs/CreateOffers.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, ArrowLeft, Loader2, CheckCircle, AlertCircle,
  Plus, X, MapPin, Tag, Clock, Users, Building, GraduationCap,
  Calendar, Award, Globe, Euro
} from "lucide-react";
import { createJob } from "../../services/jobs";

// Configuration MapBox (remplacez par votre clé)
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGV3aXNiMTIiLCJhIjoiY21icnhzcTl2MGZhcjJxbzlscGd5Zm90cCJ9.zR8fsh1F98YtlEQgDXS5aA';
const MAPBOX_API_URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/{search}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=FR&language=fr&types=place,locality,address`;

export default function CreateOffers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [benefitsInput, setBenefitsInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    country: "",
    city: "",
    salary_range: "",
    contract_type: "",
    work_hours: "35", // Nouveau champ: heures de travail par semaine
    remote_policy: "hybrid", // Nouveau: politique de télétravail
    experience_level: "", // Nouveau: niveau d'expérience requis
    education_level: "", // Nouveau: niveau d'éducation
    department: "", // Nouveau: département/service
    employment_type: "full_time", // Nouveau: type d'emploi
    required_skills: [],
    benefits: [], // Nouveau: avantages
    missions: ["", ""],
    immediate_start: false, // Nouveau: début immédiat
    visa_sponsorship: false, // Nouveau: sponsorship visa
  });

  // Types de contrat disponibles
  const contractTypes = [
    { id: "CDI", label: "CDI" },
    { id: "CDD", label: "CDD" },
    { id: "Stage", label: "Stage" },
    { id: "Alternance", label: "Alternance" },
    { id: "Freelance", label: "Freelance" },
    { id: "Interim", label: "Intérim" },
    { id: "Temps partiel", label: "Temps partiel" }
  ];

  // Options pour les heures de travail
  const workHoursOptions = [
    { value: "20", label: "20h/semaine" },
    { value: "24", label: "24h/semaine" },
    { value: "28", label: "28h/semaine" },
    { value: "30", label: "30h/semaine" },
    { value: "35", label: "35h/semaine" },
    { value: "37", label: "37h/semaine" },
    { value: "39", label: "39h/semaine" },
    { value: "40", label: "40h/semaine" },
    { value: "42", label: "42h/semaine" },
    { value: "other", label: "Autre" }
  ];

  // Politiques de télétravail
  const remotePolicies = [
    { value: "full_remote", label: "100% Télétravail" },
    { value: "hybrid", label: "Hybride (2-3 jours/semaine)" },
    { value: "flexible", label: "Flexible" },
    { value: "office_only", label: "Présentiel uniquement" }
  ];

  // Niveaux d'expérience
  const experienceLevels = [
    { value: "internship", label: "Stage" },
    { value: "junior", label: "Junior (0-2 ans)" },
    { value: "mid", label: "Confirmé (2-5 ans)" },
    { value: "senior", label: "Senior (5-10 ans)" },
    { value: "expert", label: "Expert (10+ ans)" },
    { value: "entry", label: "Débutant accepté" }
  ];

  // Niveaux d'éducation
  const educationLevels = [
    { value: "none", label: "Non requis" },
    { value: "high_school", label: "Baccalauréat" },
    { value: "associate", label: "Bac+2" },
    { value: "bachelor", label: "Licence/Bac+3" },
    { value: "master", label: "Master/Bac+5" },
    { value: "phd", label: "Doctorat" },
    { value: "other", label: "Autre" }
  ];

  // Types d'emploi
  const employmentTypes = [
    { value: "full_time", label: "Temps plein" },
    { value: "part_time", label: "Temps partiel" },
    { value: "contract", label: "Contractuel" },
    { value: "temporary", label: "Temporaire" },
    { value: "internship", label: "Stage" },
    { value: "apprenticeship", label: "Apprentissage" }
  ];

  // Suggestions de compétences
  const skillSuggestions = [
    "JavaScript", "Python", "React", "Node.js", "Java", "PHP", "Symfony",
    "Vue.js", "Angular", "HTML/CSS", "TypeScript", "SQL", "NoSQL", "MongoDB",
    "PostgreSQL", "Docker", "AWS", "Git", "Agile", "Scrum", "UX/UI", "Figma",
    "Photoshop", "Illustrator", "Marketing Digital", "SEO", "Social Media",
    "Communication", "Gestion de projet", "Leadership", "Anglais", "Espagnol"
  ];

  // Suggestions d'avantages
  const benefitSuggestions = [
    "Mutuelle santé",
    "Tickets restaurant",
    "Comité d'entreprise",
    "Prime transport",
    "Télétravail flexible",
    "Formation continue",
    "Évolution de carrière",
    "Congés supplémentaires",
    "Horaires flexibles",
    "RTT",
    "Épargne salariale",
    "Participation aux bénéfices",
    "Parking gratuit",
    "Gym/salle de sport",
    "Crèche entreprise"
  ];

  // Gestion de l'autocomplétion pour la localisation
  const handleLocationChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));
    setFormData(prev => ({ ...prev, country: "", city: "" }));

    if (value.length > 2) {
      try {
        const response = await fetch(MAPBOX_API_URL.replace('{search}', encodeURIComponent(value)));
        const data = await response.json();
        setLocationSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur de géocodage:", error);
      }
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectLocation = (suggestion) => {
    const placeName = suggestion.place_name;
    const context = suggestion.context || [];
    let country = "";
    let city = suggestion.text || "";

    context.forEach(item => {
      if (item.id.includes("country")) {
        country = item.text;
      } else if (item.id.includes("place")) {
        city = item.text;
      }
    });

    setFormData(prev => ({
      ...prev,
      location: placeName,
      country: country,
      city: city
    }));
    setShowSuggestions(false);
  };

  // Gestion des compétences
  const handleSkillsInput = (e) => {
    setSkillsInput(e.target.value);
  };

  const addSkill = () => {
    const skill = skillsInput.trim();
    if (skill && !formData.required_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
      setSkillsInput("");
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index)
    }));
  };

  // Gestion des avantages
  const handleBenefitsInput = (e) => {
    setBenefitsInput(e.target.value);
  };

  const addBenefit = () => {
    const benefit = benefitsInput.trim();
    if (benefit && !formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
      setBenefitsInput("");
    }
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const addSuggestedBenefit = (benefit) => {
    if (!formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
      setBenefitsInput("");
    }
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (type === 'skill') addSkill();
      if (type === 'benefit') addBenefit();
    }
  };

  // Suggestions de compétences
  const filteredSkillSuggestions = skillSuggestions.filter(skill =>
    skill.toLowerCase().includes(skillsInput.toLowerCase()) &&
    !formData.required_skills.includes(skill)
  );

  // Suggestions d'avantages
  const filteredBenefitSuggestions = benefitSuggestions.filter(benefit =>
    benefit.toLowerCase().includes(benefitsInput.toLowerCase()) &&
    !formData.benefits.includes(benefit)
  );

  const addSuggestedSkill = (skill) => {
    if (!formData.required_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
      setSkillsInput("");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMissionChange = (index, value) => {
    const newMissions = [...formData.missions];
    newMissions[index] = value;
    setFormData(prev => ({ ...prev, missions: newMissions }));
  };

  const addMission = () => {
    setFormData(prev => ({ ...prev, missions: [...prev.missions, ""] }));
  };

  const removeMission = (index) => {
    const newMissions = [...formData.missions];
    newMissions.splice(index, 1);
    setFormData(prev => ({ ...prev, missions: newMissions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      salary_range: formData.salary_range,
      contract_type: formData.contract_type,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === "") {
        setError(`Le champ "${field}" est obligatoire`);
        return;
      }
    }

    // Filtrer les missions vides
    const validMissions = formData.missions.filter(m => m.trim() !== "");
    if (validMissions.length === 0) {
      setError("Au moins une mission doit être renseignée");
      return;
    }

    if (formData.required_skills.length === 0) {
      setError("Au moins une compétence est requise");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    // DONNÉES FINALES ENVOYÉES AU BACKEND
    const jobData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      salary_range: formData.salary_range,
      contract_type: formData.contract_type,
      work_hours: formData.work_hours,
      remote_policy: formData.remote_policy,
      experience_level: formData.experience_level,
      education_level: formData.education_level,
      department: formData.department,
      employment_type: formData.employment_type,
      required_skills: formData.required_skills,
      benefits: formData.benefits,
      country: formData.country,
      city: formData.city,
      missions: validMissions,
      immediate_start: formData.immediate_start,
      visa_sponsorship: formData.visa_sponsorship
    };

    const res = await createJob(jobData);
    if (res.success) {
      setSuccess("Offre publiée avec succès !");
      setTimeout(() => navigate("/jobs"), 1500);
    } else {
      setError(res.error || "Erreur lors de la création");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-all hover:scale-110 text-blue-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Publier une offre</h1>
            <p className="text-gray-600">Attirez les meilleurs talents avec une offre détaillée</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Section 1: Informations principales */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Informations principales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Titre du poste */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Titre du poste *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    placeholder="Développeur Full Stack"
                    required
                  />
                </div>

                {/* Type de contrat */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de contrat *
                  </label>
                  <select
                    name="contract_type"
                    value={formData.contract_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="">Sélectionnez un type de contrat</option>
                    {contractTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Détails de l'emploi */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Détails de l'emploi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Heures de travail */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Heures de travail/semaine
                  </label>
                  <select
                    name="work_hours"
                    value={formData.work_hours}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Sélectionnez</option>
                    {workHoursOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Politique de télétravail */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Télétravail
                  </label>
                  <select
                    name="remote_policy"
                    value={formData.remote_policy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  >
                    {remotePolicies.map((policy) => (
                      <option key={policy.value} value={policy.value}>
                        {policy.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type d'emploi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type d'emploi
                  </label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  >
                    {employmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Département */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Département/Service
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    placeholder="IT, Marketing, RH..."
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Exigences */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Exigences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Niveau d'expérience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Niveau d'expérience
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Sélectionnez</option>
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Niveau d'éducation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Niveau d'éducation
                  </label>
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Sélectionnez</option>
                    {educationLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Localisation *
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <MapPin className="absolute left-3 w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleLocationChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    placeholder="Rechercher une ville, un pays..."
                    required
                  />
                </div>

                {/* Suggestions de localisation */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-blue-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => selectLocation(suggestion)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-blue-50 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{suggestion.text}</div>
                        <div className="text-sm text-gray-500">{suggestion.place_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(formData.country || formData.city) && (
                <div className="mt-2 text-sm text-gray-600">
                  {formData.city && <span>Ville: {formData.city}</span>}
                  {formData.country && <span>, Pays: {formData.country}</span>}
                </div>
              )}
            </div>

            {/* Fourchette salariale */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fourchette salariale *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-3.5 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  placeholder="40 000 € - 55 000 € annuels"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description détaillée (Entreprise, avantages...) *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Présentation de l'entreprise, environnement de travail, avantages..."
                required
              />
            </div>

            {/* Missions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Missions principales *
                </label>
                <button
                  type="button"
                  onClick={addMission}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {formData.missions.map((mission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mission}
                      onChange={(e) => handleMissionChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                      placeholder={`Mission ${index + 1}`}
                    />
                    {formData.missions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMission(index)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences requises */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Compétences requises *
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={handleSkillsInput}
                      onKeyDown={(e) => handleKeyDown(e, 'skill')}
                      className="flex-1 px-4 py-2 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                      placeholder="Ajoutez des compétences (JavaScript, React, etc.)"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                    >
                      Ajouter
                    </button>
                  </div>

                  {skillsInput && filteredSkillSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-blue-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredSkillSuggestions.map((skill, index) => (
                        <div
                          key={index}
                          onClick={() => addSuggestedSkill(skill)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors text-gray-700"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      <span className="text-sm font-medium">{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Avantages */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Avantages et bénéfices
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={benefitsInput}
                      onChange={handleBenefitsInput}
                      onKeyDown={(e) => handleKeyDown(e, 'benefit')}
                      className="flex-1 px-4 py-2 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-200"
                      placeholder="Ajoutez des avantages (Mutuelle, Tickets restaurant...)"
                    />
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                    >
                      Ajouter
                    </button>
                  </div>

                  {benefitsInput && filteredBenefitSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-green-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredBenefitSuggestions.map((benefit, index) => (
                        <div
                          key={index}
                          onClick={() => addSuggestedBenefit(benefit)}
                          className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors text-gray-700"
                        >
                          {benefit}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full"
                    >
                      <Award className="w-3 h-3" />
                      <span className="text-sm font-medium">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="ml-1 text-green-500 hover:text-green-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Options supplémentaires */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Options supplémentaires
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="immediate_start"
                    name="immediate_start"
                    checked={formData.immediate_start}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="immediate_start" className="text-gray-700">
                    Début immédiat possible
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="visa_sponsorship"
                    name="visa_sponsorship"
                    checked={formData.visa_sponsorship}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="visa_sponsorship" className="text-gray-700">
                    Sponsorship visa possible
                  </label>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border-2 border-blue-200 text-gray-700 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5" />
                    Publier l'offre
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}