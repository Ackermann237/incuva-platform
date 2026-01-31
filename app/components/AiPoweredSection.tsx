'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play } from 'lucide-react';

const aiExperiences = [
  {
    title: "Pour les Entreprises",
    desc: "Une IA décisionnelle détecte les talents, prédit les départs et optimise vos performances. Elle apprend votre culture interne pour recommander les meilleurs recrutements et réorganisations.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
    gradient: "from-blue-600/80 to-cyan-600/80"
  },
  {
    title: "Pour les Freelances",
    desc: "Une IA de matching analyse votre expertise et vos habitudes pour vous connecter aux missions les plus compatibles. Elle anticipe vos besoins et met en avant les opportunités les plus rentables.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    gradient: "from-purple-600/80 to-pink-600/80"
  },
  {
    title: "Pour les Chercheurs",
    desc: "Une IA cognitive analyse vos compétences et votre potentiel pour générer des recommandations sur mesure : opportunités, parcours de carrière, formations et conseils d'entretien.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    gradient: "from-orange-600/80 to-red-600/80"
  }
];

export default function AIPoweredSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <motion.h2
        className="text-center text-5xl md:text-7xl font-extrabold mb-20 tracking-tight"
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        Propulsé par{" "}
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          l&apos;intelligence artificielle
        </span>
      </motion.h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {aiExperiences.map((item, idx) => (
          <motion.div
            key={idx}
            className="relative h-[500px] rounded-[2rem] overflow-hidden group cursor-pointer shadow-2xl"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.06 }}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src={item.image}
                fill
                alt={item.title}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>

            <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} to-black/70`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-20 transition-all duration-500" />

            <motion.div
              className="absolute bottom-0 p-10 text-white"
              initial={{ y: 20, opacity: 0.8 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-200 mb-6 leading-relaxed">
                {item.desc}
              </p>
              <motion.div
                className="flex items-center gap-2 text-white"
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
              >
                <Play className="w-5 h-5" />
                <span className="text-sm font-medium">Découvrir</span>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
