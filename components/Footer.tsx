"use client";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="w-full pt-16 pb-8 relative overflow-hidden">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-300/70 to-transparent"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-300/50 to-cyan-300/50"
            initial={{
              x: Math.random() * 100 + "%",
              y: "100%",
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: "-20%",
              opacity: 0,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-300 to-cyan-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to transform your business with AI?
          </motion.h2>
          
          <motion.p 
            className="text-white/80 max-w-xl mx-auto mb-8 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join the growing number of businesses leveraging Sony's Aitrios platform for real-time data detection and analysis.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <a href="/signin">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-pink-300 to-cyan-300 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Today
              </motion.button>
            </a>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-12 pt-8 border-t border-white/10 text-center text-white/80 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p>Copyright © 2025 Aitrios Platform | Powered by Sony</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
