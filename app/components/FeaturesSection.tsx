'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { features } from '../../lib/constants';

export default function FeaturesSection() {
  const [activeUserType, setActiveUserType] = useState<'entreprise' | 'chercheur' | 'freelance'>('entreprise');

  return (
    <section id="features" className="py-32 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Des fonctionnalités <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">révolutionnaires</span>
          </h2>
          <p className="text-xl text-gray-400">Propulsées par l&apos;intelligence artificielle</p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-16 flex-wrap">
          {(['entreprise', 'chercheur', 'freelance'] as const).map((type) => (
            <motion.button
              key={type}
              onClick={() => setActiveUserType(type)}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeUserType === type
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type === 'entreprise' ? 'Entreprise' : type === 'chercheur' ? 'Chercheur' : 'Freelance'}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeUserType}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {features[activeUserType].map((feature, idx) => (
              <motion.div
                key={idx}
                className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500"
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                <motion.div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
