"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate animation duration based on speed
  const getDuration = () => {
    switch (speed) {
      case "fast":
        return 5000;
      case "normal":
        return 7000;
      case "slow":
        return 10000;
      default:
        return 7000;
    }
  };

  // Handle automatic rotation
  useEffect(() => {
    if (isHovered || !pauseOnHover) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % items.length);
        
        // Reset animation state after transition
        setTimeout(() => {
          setIsAnimating(false);
        }, 1000);
      }
    }, getDuration());

    return () => clearInterval(interval);
  }, [isHovered, items.length, pauseOnHover, speed, isAnimating]);

  // Handle manual navigation
  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient mask for fade effect */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      
      {/* Testimonial cards */}
      <div className="relative h-[300px] flex items-center justify-center">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute w-[80vw] max-w-4xl mx-auto"
            initial={{ 
              opacity: 0, 
              x: idx === currentIndex ? 0 : (direction === "left" ? 100 : -100),
              scale: 0.9
            }}
            animate={{ 
              opacity: idx === currentIndex ? 1 : 0,
              x: idx === currentIndex ? 0 : (direction === "left" ? -100 : 100),
              scale: idx === currentIndex ? 1 : 0.9,
              transition: { duration: 0.5, ease: "easeOut" }
            }}
            style={{ zIndex: idx === currentIndex ? 20 : 10 }}
          >
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl border border-white/10 p-6 shadow-xl">
              <div className="relative">
                <div className="absolute -top-3 -left-3 text-3xl text-pink-300/30">"</div>
                <div className="absolute -bottom-3 -right-3 text-3xl text-cyan-300/30">"</div>
                
                <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-4">
                  {item.quote}
                </p>
                
                <div className="flex items-center mt-4 pt-3 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-white">
                      {item.name}
                    </span>
                    <span className="text-sm text-white/60">
                      {item.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Navigation arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-30">
        <button 
          onClick={goToPrev}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-all"
          aria-label="Previous testimonial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <button 
          onClick={goToNext}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-all"
          aria-label="Next testimonial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-30">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (isAnimating) return;
              setIsAnimating(true);
              setCurrentIndex(idx);
              setTimeout(() => {
                setIsAnimating(false);
              }, 1000);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex 
                ? "bg-gradient-to-r from-pink-500 to-cyan-500 w-4" 
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
