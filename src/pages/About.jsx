// frontend/src/pages/About.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Target, Users, Zap, Heart, Award, Globe, TrendingUp,
  Rocket, Shield, Brain, Eye, Lightbulb, Star, CheckCircle,
  Calendar, MapPin, Mail, Linkedin, Twitter, ArrowRight, X, Menu
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: "2023", label: "Année de création", icon: <Calendar className="w-8 h-8" /> },
    { value: "50K+", label: "Utilisateurs actifs", icon: <Users className="w-8 h-8" /> },
    { value: "10K+", label: "Entreprises partenaires", icon: <Globe className="w-8 h-8" /> },
    { value: "95%", label: "Taux de satisfaction", icon: <Star className="w-8 h-8" /> }
  ];

  const values = [
    {
      icon: <Heart className="w-10 h-10" />,
      title: "Passion",
      desc: "Nous sommes passionnés par la transformation du monde du travail et l'autonomisation des talents.",
      gradient: "from-red-500 to-pink-600"
    },
    {
      icon: <Lightbulb className="w-10 h-10" />,
      title: "Innovation",
      desc: "L'innovation est au cœur de tout ce que nous faisons, de l'IA à l'expérience utilisateur.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Intégrité",
      desc: "Nous plaçons la confiance et la transparence au centre de notre plateforme et de nos relations.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Collaboration",
      desc: "Ensemble, nous créons un écosystème où chacun peut prospérer et réussir.",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const team = [
    {
      name: "Sophie Laurent",
      role: "CEO & Co-fondatrice",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      bio: "15 ans d'expérience dans la tech et les RH",
      linkedin: "#"
    },
    {
      name: "Marc Dubois",
      role: "CTO & Co-fondateur",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      bio: "Expert en IA et architecte logiciel",
      linkedin: "#"
    },
    {
      name: "Julie Martin",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      bio: "Spécialiste UX/UI avec 10 ans d'expérience",
      linkedin: "#"
    },
    {
      name: "Thomas Bernard",
      role: "Head of Growth",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      bio: "Stratège marketing et growth hacker",
      linkedin: "#"
    }
  ];

  const timeline = [
    {
      year: "2023",
      title: "Lancement d'INCUVA",
      desc: "Création de la plateforme et premières fonctionnalités RH",
      icon: <Rocket className="w-6 h-6" />
    },
    {
      year: "2024",
      title: "Intégration de l'IA",
      desc: "Déploiement de notre moteur d'IA pour le matching intelligent",
      icon: <Brain className="w-6 h-6" />
    },
    {
      year: "2024",
      title: "10K Utilisateurs",
      desc: "Franchissement du cap des 10 000 utilisateurs actifs",
      icon: <Award className="w-6 h-6" />
    },
    {
      year: "2025",
      title: "Expansion Internationale",
      desc: "Ouverture dans 15 pays européens",
      icon: <Globe className="w-6 h-6" />
    }
  ];

  const achievements = [
    { label: "Startup de l'année 2024", icon: <Award /> },
    { label: "Meilleure plateforme RH", icon: <TrendingUp /> },
    { label: "Prix de l'innovation IA", icon: <Brain /> },
    { label: "Certification ISO 27001", icon: <Shield /> }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                INCUVA
              </span>
            </div>

            <div className="hidden md:flex space-x-8">
              <button onClick={() => navigate('/')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Accueil</button>
              <button onClick={() => navigate('/about')} className="text-purple-600 font-medium">À propos</button>
              <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Connexion</button>
            </div>

            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => navigate("/select_account_type")}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
              >
                Démarrer
              </button>
            </div>

            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <button onClick={() => navigate('/')} className="block w-full text-left text-gray-700 hover:text-purple-600 py-2">Accueil</button>
              <button onClick={() => navigate('/about')} className="block w-full text-left text-purple-600 py-2">À propos</button>
              <button onClick={() => navigate('/login')} className="block w-full text-left text-gray-700 hover:text-purple-600 py-2">Connexion</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-gray-900">
            Notre <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">mission</span> est de révolutionner le monde du travail
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            INCUVA connecte les talents avec les opportunités grâce à l'intelligence artificielle, créant un écosystème où chacun peut prospérer.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 text-white group-hover:scale-110 transition-transform shadow-xl">
                  {stat.icon}
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-600 font-medium text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 border-4 border-purple-200 rounded-full opacity-20"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-8 text-gray-900">
                Notre <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">histoire</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Tout a commencé en 2023 avec une vision simple : rendre le recrutement et la gestion des talents plus intelligent, plus humain et plus accessible.
                </p>
                <p>
                  Frustrés par les plateformes existantes qui ne répondaient pas aux besoins réels des entreprises et des talents, nous avons décidé de créer INCUVA.
                </p>
                <p>
                  Aujourd'hui, nous sommes fiers de servir des milliers d'entreprises et de talents à travers le monde, en combinant technologie de pointe et approche humaine.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                alt="Team"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <Eye className="w-16 h-16 mb-6" />
                <h3 className="text-4xl font-bold mb-6">Notre Vision</h3>
                <p className="text-xl leading-relaxed text-white/90">
                  Devenir la plateforme de référence mondiale pour connecter talents et opportunités, en utilisant l'IA pour créer des correspondances parfaites et durables.
                </p>
              </div>
            </div>

            <div className="p-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <Target className="w-16 h-16 mb-6" />
                <h3 className="text-4xl font-bold mb-6">Notre Mission</h3>
                <p className="text-xl leading-relaxed text-white/90">
                  Démocratiser l'accès aux opportunités professionnelles et faciliter la gestion RH grâce à une technologie accessible, intelligente et centrée sur l'humain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Nos <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">valeurs</span>
            </h2>
            <p className="text-2xl text-gray-600">Les principes qui guident chacune de nos actions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="group">
                <div className="p-10 bg-white rounded-3xl border-2 border-gray-200 hover:border-purple-300 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105">
                  <div className={`w-20 h-20 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-lg`}>
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Notre <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">parcours</span>
            </h2>
            <p className="text-2xl text-gray-600">Les étapes clés de notre développement</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 hidden md:block"></div>

            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-purple-600 font-bold text-xl mb-2">{item.year}</div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-xl z-10 flex-shrink-0">
                    {item.icon}
                  </div>

                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Notre <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">équipe</span>
            </h2>
            <p className="text-2xl text-gray-600">Les personnes qui rendent INCUVA possible</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="group">
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="relative overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{member.name}</h3>
                    <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <a
                      href={member.linkedin}
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Nos <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">récompenses</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 text-center hover:scale-105 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 text-white">
                  {achievement.icon}
                </div>
                <p className="font-bold text-gray-900">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Rejoignez l'aventure INCUVA
          </h2>
          <p className="text-2xl mb-12 text-white/90">
            Faites partie de la révolution du travail et transformez votre carrière ou votre entreprise
          </p>
          <button
            onClick={() => navigate("/select_account_type")}
            className="px-12 py-5 bg-white text-purple-700 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105 inline-flex items-center gap-3"
          >
            Commencer maintenant
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>
    </div>
  );
}