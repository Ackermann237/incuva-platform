'use client';
import { motion } from 'framer-motion';
import { Users, Target, Award } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Créez votre profil",
    desc: "Inscrivez-vous en moins de 2 minutes et activez votre univers personnel",
    icon: <Users className="w-7 h-7" />,
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    num: "02",
    title: "Connectez-vous",
    desc: "L'IA détecte, analyse et propose les meilleures opportunités",
    icon: <Target className="w-7 h-7" />,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    num: "03",
    title: "Collaborez",
    desc: "Un espace unique pour gérer missions, paiements et contrats",
    icon: <Award className="w-7 h-7" />,
    gradient: "from-orange-500 to-red-500"
  }
];

export default function StepsSection() {
  return (
    <section className="relative py-40 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <path
            d="M 0 250 C 300 150, 500 350, 800 250 C 1100 150, 1400 350, 1700 250"
            stroke="url(#wave)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      </div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-600/20 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          className="text-center text-6xl md:text-7xl font-extrabold mb-28 tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Commencez en{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            3 étapes
          </span>
        </motion.h2>

        <div className="relative grid md:grid-cols-3 gap-24">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ scale: 1.1 }}
              className="relative text-center"
            >
              <div className="absolute inset-0 -z-10">
                <svg width="100%" height="100%">
                  <path
                    d="M 50 180 C 100 40, 200 40, 250 180"
                    strokeWidth="10"
                    fill="none"
                    stroke="url(#wave)"
                    className="opacity-20"
                  />
                </svg>
              </div>

              <motion.div
                className={`
                  w-20 h-20 mx-auto rounded-3xl
                  flex items-center justify-center
                  bg-gradient-to-br ${step.gradient}
                  shadow-[0_0_30px_rgba(255,255,255,0.4)]
                  border border-white/20
                `}
                whileHover={{ rotate: [0, -8, 8, -8, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                {step.icon}
              </motion.div>

              <div className="text-[140px] font-extrabold text-white/5 absolute -top-20 left-1/2 -translate-x-1/2 tracking-tighter pointer-events-none">
                {step.num}
              </div>

              <h3 className="text-3xl font-bold mt-10 mb-4">{step.title}</h3>
              <p className="text-gray-400 max-w-xs mx-auto">{step.desc}</p>

              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-40 bg-gradient-to-r from-purple-400 to-pink-400 blur-xl transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
