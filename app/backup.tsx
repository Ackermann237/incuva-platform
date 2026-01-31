
import Navigation from './components/Navigation';
import SegmentSection from './components/SegmentSection';
import FeaturesSection from './components/FeaturesSection';
import MobyusSection from './components/MobyusSection';
import Testimonials from './components/Testimonials';
import AboutSection from './components/AboutSection';
import AIPoweredSection from './components/AiPoweredSection';
import StepsSection from './components/StepsSection';
import CTASection from './components/CTASection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import { Sparkles, ChevronDown, Play, Layers } from 'lucide-react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30"
              animate={{
                background: [
                  "linear-gradient(to bottom right, rgba(139, 92, 246, 0.3), rgba(0, 0, 0, 0.8), rgba(236, 72, 153, 0.3))",
                  "linear-gradient(to bottom right, rgba(139, 92, 246, 0.2), rgba(0, 0, 0, 0.9), rgba(236, 72, 153, 0.2))",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            />
            {/* Floating particles - plus subtils et dynamiques */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(60)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white/60 rounded-full"
                  initial={{
                    opacity: 0,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    scale: 0.5 + Math.random(),
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.2, 0.5],
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Container : split left/right */}
          <motion.div
            className="relative z-10 max-w-7xl mx-auto px-6 pt-20 w-full flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* LEFT : Text block */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              {/* Badge - plus compact et élégant */}
              <motion.div
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/5 backdrop-blur-lg rounded-full border border-white/10"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span className="text-xs text-gray-300 tracking-wider font-medium">
                  Mobyus — Intelligence métier augmentée
                </span>
              </motion.div>

              {/* Title - polices réduites et gradient plus subtil */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  L’IA qui comprend
                </span>
                <br />
                <span className="text-2xl md:text-4xl text-gray-400 font-medium">
                  votre entreprise
                </span>
              </motion.h1>

              {/* Description - texte plus compact et lisible */}
              <motion.p
                className="text-base md:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Mobyus connecte vos données, les analyse, et prédit les tendances essentielles
                pour générer des insights clairs et actionnables, adaptés à chaque métier :
                <span className="text-gray-300 font-medium">
                  RH, Finance, Retail, Logistique, Industrie...
                </span>
                <br />
                <span className="text-gray-500 text-sm mt-2 block">
                  Des prédictions fiables. Des décisions plus rapides.
                </span>
              </motion.p>

              {/* CTA - boutons plus compacts */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-white text-black text-sm rounded-full font-medium hover:bg-gray-200 transition-all"
                >
                  Essayer Mobyus
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-1.5 justify-center group"
                >
                  <Play className="w-4 h-4 group-hover:scale-105 transition-transform" />
                  Voir la vision
                </motion.button>
              </motion.div>
            </div>

            {/* RIGHT : Hero GIF/Animation - bordure plus subtile */}
            <motion.div
              className="flex-1 w-full max-w-lg lg:max-w-xl"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-xl backdrop-blur-lg">
                <Image
                  src="/images/mob.gif"
                  alt="AI Neural Network Animation"
                  width={800}
                  height={500}
                  priority
                  className="w-full h-auto object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll down arrow - plus discret */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1.5 text-gray-500 cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            onClick={() =>
              document.getElementById('segments')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span className="text-xs">Faites défiler pour découvrir</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
      </section>




      {/* All sections */}
      <SegmentSection />
      <FeaturesSection />
      <MobyusSection />
      <Testimonials />
      <AboutSection />
      <AIPoweredSection />
      <StepsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
