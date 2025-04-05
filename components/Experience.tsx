"use client";
import React from "react";
import { motion } from "framer-motion";
import { CanvasRevealEffect } from "./ui/CanvasRevealEffect";

const Experience = () => {
  // Simple pulse animation data
  const pulsePoints = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3
  }));

  return (
    <div id="about" className="py-20 w-full">
      <div className="relative z-20">
        <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-8 text-white">
          <span className="text-pink-300">
            About
          </span>{" "}
          <span className="text-cyan-300">
            Us
          </span>
        </h2>
      </div>

      <div className="w-full mt-12 relative">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            className="border border-white/10 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm p-8 relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            {/* Simple pulse animation overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {pulsePoints.map((point) => (
                <motion.div
                  key={point.id}
                  className="absolute bg-gradient-to-r from-pink-300/40 to-cyan-300/40 rounded-full"
                  style={{
                    width: point.size,
                    height: point.size,
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [0, 2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: point.delay,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            <div className="relative">
              <CanvasRevealEffect
                animationSpeed={3}
                containerClassName="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl overflow-hidden"
                colors={[[255, 166, 158], [221, 255, 247]]}
                dotSize={2}
              />
              
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Our Vision
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  We are revolutionizing how businesses and users interact with real-time data. 
                  By leveraging <span className="font-bold text-pink-300">Sony's cutting-edge Aitrios platform</span>, we're creating a seamless 
                  ecosystem where data flows freely between businesses and their customers.
                </p>
                
                <div className="mt-8">
                  <a
                    href="/signin"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-pink-300 to-purple-300 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-lg"
                  >
                    Join Our Platform
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
