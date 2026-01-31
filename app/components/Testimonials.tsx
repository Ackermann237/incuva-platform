'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { testimonials } from '../../lib/constants';

export default function Testimonials() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-5xl font-bold mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ils nous font <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">confiance</span>
        </motion.h2>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, x: 100, rotateY: 90 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -100, rotateY: -90 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 relative overflow-hidden"
              style={{ boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.25)' }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                    <Image
                      src={testimonials[testimonialIndex].avatar}
                      alt={testimonials[testimonialIndex].author}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-4 border-white/20"
                    />
                  </motion.div>
                  <div>
                    <p className="font-bold text-xl">{testimonials[testimonialIndex].author}</p>
                    <p className="text-gray-400">{testimonials[testimonialIndex].role}</p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-2xl text-gray-300 leading-relaxed italic">
                  "{testimonials[testimonialIndex].text}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              onClick={() => setTestimonialIndex(Math.max(0, testimonialIndex - 1))}
              className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-30"
              disabled={testimonialIndex === 0}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setTestimonialIndex(Math.min(testimonials.length - 1, testimonialIndex + 1))}
              className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-30"
              disabled={testimonialIndex === testimonials.length - 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
