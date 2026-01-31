'use client';
import { motion } from 'framer-motion';
import { Check, Shield, Award } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-40 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-[900px] h-[900px] rounded-full border border-white/10 blur-xl" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-white/10" />
        <div className="absolute w-[350px] h-[350px] rounded-full border border-white/10" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
            animate={{
              y: [0, -80, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.12
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          className="text-6xl md:text-7xl font-extrabold mb-10 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Prêt à transformer
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            votre carrière ?
          </span>
        </motion.h2>

        <motion.p
          className="text-xl text-gray-400 mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Rejoignez des milliers de professionnels qui ont choisi INCUVA
          <br />
          pour propulser leur activité
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <motion.button
            whileHover={{ scale: 1.08 }}
            className="px-12 py-4 bg-white text-black rounded-full font-semibold shadow-xl hover:bg-gray-200 transition-all"
            onClick={() => window.location.href = "http://localhost:5173/register_company"}
          >
            Pour les entreprises
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, backdropFilter: 'blur(30px)' }}
            className="px-12 py-4 bg-white/10 border border-white/20 backdrop-blur-2xl rounded-full text-white font-semibold shadow-lg transition-all"
            onClick={() => window.location.href = "http://localhost:5173/register_individual"}
          >
            Pour les particuliers
          </motion.button>
        </div>

        {/* Guarantees */}
        <div className="flex flex-wrap justify-center gap-10 text-gray-400 text-sm">
          {[
            { icon: <Check className="w-6 h-6 text-green-400" />, text: "Gratuit pendant 30 jours" },
            { icon: <Shield className="w-6 h-6 text-blue-400" />, text: "Paiements sécurisés" },
            { icon: <Award className="w-6 h-6 text-pink-400" />, text: "Support 24/7" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + idx * 0.15 }}
              whileHover={{ scale: 1.15 }}
            >
              {item.icon}
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
