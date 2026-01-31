'use client';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Check, Play } from 'lucide-react';

export default function MobyusSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/30 to-black" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute w-96 h-96 bg-purple-600/20 blur-[180px] rounded-full -top-32 -right-32 animate-pulse" />
      <div className="absolute w-96 h-96 bg-blue-600/20 blur-[180px] rounded-full -bottom-32 -left-32 animate-pulse" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Mobyus</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            L'IA embarquée d'INCUVA inspirée des systèmes tactiques Mobyus — analyse, anticipe et exécute vos besoins en temps réel.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Card 1 - Analytics */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            className="relative p-10 rounded-3xl bg-gradient-to-br from-white/10 via-purple-50/10 to-pink-50/5 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(180,90,255,0.2)] overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-purple-400/40"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.7)" }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/30 blur-3xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Mobyus analyse & anticipe</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Le moteur prédictif de Mobyus observe vos comportements et détecte vos besoins avant même que vous ne les formuliez.
              </p>
              <ul className="space-y-3">
                {["Scan comportemental continu", "IA de recommandation dynamique", "Détection de signaux faibles"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Card 2 - Execution Engine */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            className="relative p-10 rounded-3xl bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-black backdrop-blur-2xl shadow-[0_0_60px_rgba(90,40,255,0.4)] border border-purple-500/20 overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-pink-400/40"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1, boxShadow: "0 0 40px rgba(236,72,153,0.7)" }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-150%", "150%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-72 h-72 border-4 border-white/10 rounded-full" />
            </motion.div>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-6 shadow-xl">
                <Cpu className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Mobyus exécute pour vous</h3>
              <p className="text-purple-200 leading-relaxed mb-6">
                Mobyus ne se limite pas au diagnostic : il exécute vos actions, automatise vos processus et devient votre véritable copilote intégral.
              </p>
              <ul className="space-y-3">
                {[
                  "Actions automatisées intelligentes",
                  "Génération instantanée de documents",
                  "Interaction vocale & textuelle fluide"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Play className="w-6 h-6 text-pink-300" />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
