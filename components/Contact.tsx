"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaGlobe } from "react-icons/fa";

const Contact = () => {
  return (
    <section id="contact" className="w-full py-12">
      <div className="relative z-20">
        <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-white">
          <span className="text-pink-300">
            Get in
          </span>{" "}
          <span className="text-cyan-300">
            touch
          </span>
        </h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-8 rounded-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Email</h3>
            </div>
            <p className="text-white/80 mb-4">
              Have questions about our platform? Send us an email and we'll get back to you as soon as possible.
            </p>
            <a 
              href="mailto:contact@aitriosplatform.com" 
              className="text-pink-300 hover:text-pink-200 transition-colors"
            >
              contact@aitriosplatform.com
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-8 rounded-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 flex items-center justify-center">
                <FaPhone className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Phone</h3>
            </div>
            <p className="text-white/80 mb-4">
              Prefer to speak directly? Call our support team for immediate assistance with your inquiries.
            </p>
            <a 
              href="tel:+1234567890" 
              className="text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              +1 (234) 567-890
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8 rounded-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 flex items-center justify-center">
                <FaGlobe className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Website</h3>
            </div>
            <p className="text-white/80 mb-4">
              Visit our website for more information about our services, pricing plans, and latest updates.
            </p>
            <a 
              href="https://www.aitriosplatform.com" 
              className="text-purple-300 hover:text-purple-200 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.aitriosplatform.com
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 