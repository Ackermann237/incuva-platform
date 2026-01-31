'use client';
import { motion } from 'framer-motion';
import { Network, Brain, ShieldCheck, Globe } from 'lucide-react';

const aboutItems = [
  {
    icon: <Network className="w-8 h-8" />,
    title: "Écosystème Connecté",
    desc: "Un réseau intelligent qui connecte les bonnes personnes",
    delay: 0
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "IA Avancée",
    desc: "Des algorithmes qui comprennent vos besoins réels",
    delay: 0.1
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Sécurité Totale",
    desc: "Transactions sécurisées par blockchain",
    delay: 0.2
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Portée Mondiale",
    desc: "Connectez-vous au monde entier",
    delay: 0.3
  }
];

export default function AboutSection() {
  return (
    <section id="about" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Pourquoi{" "}
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              INCUVA
            </span>{" "}
            ?
          </h2>
          <p className="text-xl text-gray-400">
            La plateforme qui réinvente le monde du travail
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-10">
          {aboutItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -14 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0px_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0px_20px_60px_rgba(0,0,0,0.45)] transition-all duration-500"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 shadow-inner"
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                {item.icon}
              </motion.div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-2xl transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
