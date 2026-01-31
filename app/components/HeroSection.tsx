'use client'; // Nécessaire pour les hooks et animations

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, Play, ChevronDown, Sparkles } from 'lucide-react';
import Image from 'next/image';

// Interface pour les props (si besoin d'étendre plus tard)
interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export default function HeroSection({
  title = "L'intelligence des données",
  subtitle = "Au service des entreprises",
  ctaPrimary = "Commencer maintenant",
  ctaSecondary = "Voir la démo",
}: HeroSectionProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Animation de scroll pour le titre
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Effet de scroll pour la navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effet de souris pour le fond animé
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navigation vers les sections
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Fond animé (particules et gradient) */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"
          style={{ x: mousePosition.x, y: mousePosition.y }}
        />
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20"
        style={{ scale: scaleProgress, opacity: opacityProgress }}
      >
        {/* Badge "Nouvelle génération" */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300">Nouvelle génération de plateforme RH</span>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            {title}
          </span>
          <br />
          <span className="text-5xl md:text-7xl text-gray-400">{subtitle}</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Une plateforme intelligente qui connecte entreprises, freelances et talents.
          <br />
          Propulsée par l'IA. Conçue pour l'excellence.
        </motion.p>

        {/* Boutons CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
            onClick={() => router.push('/select_account_type')}
          >
            {ctaPrimary}
          </motion.button>
          <motion.button
            className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full font-medium hover:bg-white/10 transition-all flex items-center gap-2 justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {ctaSecondary}
          </motion.button>
        </motion.div>

        {/* Image héro (optimisée avec next/image) */}
        <motion.div
          className="relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <motion.div
            className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1551434678-e076c223a692"
              alt="Modern workspace"
              width={1200}
              height={600}
              priority
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />
          </motion.div>
        </motion.div>

        {/* Flèche de défilement */}
        <motion.div
          className="mt-16 flex items-center justify-center gap-2 text-gray-500"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => scrollToSection('segments')}
        >
          <span className="text-sm cursor-pointer">Faites défiler pour découvrir</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
