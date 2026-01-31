'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { faqData } from '@/lib/constants';

export default function FAQSection() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  return (
    <section id="faq" className="py-32 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Questions <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">fréquentes</span>
          </h2>
          <p className="text-xl text-gray-400">Tout ce que vous devez savoir sur INCUVA</p>
        </motion.div>

        <div className="space-y-6">
          {faqData.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.questions.map((item, qIdx) => {
                  const faqId = `${catIdx}-${qIdx}`;
                  return (
                    <motion.div
                      key={qIdx}
                      className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: qIdx * 0.1 }}
                    >
                      <motion.button
                        onClick={() => setActiveFaq(activeFaq === faqId ? null : faqId)}
                        className="w-full p-6 text-left flex justify-between items-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-medium text-lg pr-4">{item.q}</span>
                        <motion.div animate={{ rotate: activeFaq === faqId ? 90 : 0 }} transition={{ duration: 0.3 }}>
                          <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {activeFaq === faqId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                              <p>{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
