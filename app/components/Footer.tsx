'use client';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Linkedin, Instagram, Send, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Layers className="w-5 h-5" />
              </motion.div>
              <span className="text-xl font-semibold">INCUVA</span>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
              La plateforme qui connecte entreprises, freelances et talents à travers des solutions intelligentes et sécurisées.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          {[
            { title: "Plateforme", links: ["Application mobile", "Dashboard Web", "Tarifs", "Sécurité"] },
            { title: "Ressources", links: ["Blog", "Guides", "Documentation", "FAQ"] },
            { title: "Entreprise", links: ["À propos", "Carrières", "Partenaires", "Contact"] },
          ].map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 className="font-semibold mb-4 text-sm">{section.title}</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                {section.links.map((link, linkIdx) => (
                  <motion.li key={linkIdx} whileHover={{ x: 5, color: '#ffffff' }}>
                    <a href="#" className="transition-colors">{link}</a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 mb-16 border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />

          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h4 className="text-2xl font-bold mb-3">Restez informé</h4>
            <p className="text-gray-400 mb-6">
              Recevez nos dernières actualités et conseils directement dans votre boîte mail
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-3 bg-white/5 text-white rounded-full border border-white/10 focus:border-purple-500 focus:outline-none transition-all placeholder-gray-500"
                required
              />
              <motion.button
                type="submit"
                className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all flex items-center gap-2 justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
                S&apos;abonner
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>&copy; 2025 INCUVA. Tous droits réservés.</p>
            <div className="flex gap-6">
              {["Conditions", "Confidentialité", "RGPD"].map((link, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  className="hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
