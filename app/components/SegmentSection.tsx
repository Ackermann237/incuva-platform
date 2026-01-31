'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const segments = [
  {
    title: "Ressources Humaines",
    desc: "Prévoyez les départs, identifiez les écarts de compétences et renforcez la performance des équipes grâce à l’IA prédictive.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=800&fit=crop",
    gradient: "from-purple-500/20 to-indigo-500/20",
  },
  {
    title: "Retail & Logistique",
    desc: "Anticipez les pics saisonniers, optimisez vos effectifs et améliorez l’efficacité opérationnelle en temps réel.",
    image: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=600&h=800&fit=crop",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Finance & Performance",
    desc: "Projetez vos tendances financières, détectez les anomalies et générez des insights clairs en quelques secondes.",
    image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=600&h=800&fit=crop",
    gradient: "from-green-500/20 to-emerald-500/20",
  }
];


export default function SegmentSection() {
  return (
    <section id="segments" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Conçue pour <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">trois univers</span>
          </h2>
          <p className="text-xl text-gray-400">Une plateforme. Trois expériences uniques.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {segments.map((segment, idx) => (
            <motion.div
              key={idx}
              className="group relative cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative h-[600px] rounded-3xl overflow-hidden"
                style={{
                  clipPath: idx === 1 ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : undefined
                }}
              >
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src={segment.image}
                    alt={segment.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </motion.div>

                <div className={`absolute inset-0 bg-gradient-to-t ${segment.gradient} to-black/80`} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />

                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-8"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <h3 className="text-3xl font-bold mb-3">{segment.title}</h3>
                  <motion.p
                    className="text-gray-300 mb-6"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {segment.desc}
                  </motion.p>
                  <motion.div
                    className="flex items-center gap-2 text-white"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <span className="text-sm font-medium">En savoir plus</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
