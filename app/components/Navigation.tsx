'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Layers } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
9
  // All navigation routes
  const routes: Record<string, string> = {
    Ressources: "/ressources",
    Fonctionnalités: "/features",
    Recherches: "/search",
    Entreprise: "/about",
    Tarifs: "/pricing",
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">INCUVA</span>
          </motion.div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8 text-sm">
            {Object.keys(routes).map((item) => (
              <motion.button
                key={item}
                onClick={() => router.push(routes[item])}
                className="text-gray-300 hover:text-white transition-colors relative"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.button>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-sm rounded-full text-gray-300 hover:text-white transition-all"
              onClick={() => window.location.href = "http://localhost:5173/login"}
            >
              Connexion
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
              onClick={() => window.location.href = "http://localhost:5173/select_account_type"}
            >
              Démarrer
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10"
          >
            <div className="px-6 py-6 space-y-4">
              {Object.keys(routes).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    router.push(routes[item]);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white py-2"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
