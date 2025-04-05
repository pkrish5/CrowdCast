"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import FloatingText3D from "@/components/ui/FloatingText3D";
import ScrollToTopArrow from "@/components/ui/ScrollToTopArrow";
import Approach from "@/components/Approach";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import TrafficStats from "@/components/TrafficStats";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Three.js Animation with improved integration */}
        <div className="absolute inset-0 z-0">
          <FloatingText3D />
        </div>
        
        {/* Content Layer */}
        <div className="relative z-10 text-center px-6 md:px-0 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
                  CrowdCast
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-gray-300">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
                  Real-time Crowd Analytics
                </span>
              </h2>
            </div>
            
            <p className="text-gray-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Harness the power of <span className="text-pink-400 font-semibold">AI</span> to understand and optimize your space utilization.
              Get instant insights into crowd patterns and make <span className="text-cyan-400 font-semibold">data-driven decisions</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
              <Link
                href="/signup"
                className="group relative px-8 py-4 text-lg font-medium w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg transform transition-transform group-hover:scale-105" />
                <div className="relative flex items-center justify-center space-x-2 text-white">
                  <span>Get Started</span>
                  <FaArrowRight className="transform transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/signin"
                className="group px-8 py-4 text-lg font-medium text-gray-300 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-lg w-full sm:w-auto text-center"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements - Reduced opacity for better integration */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </section>

      {/* Traffic Stats Section */}
      <TrafficStats />

      {/* Experience Section */}
      <Experience />

      {/* Approach Section */}
      <Approach />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
      
      {/* Scroll to Top Arrow */}
      <ScrollToTopArrow />
    </main>
  );
}
