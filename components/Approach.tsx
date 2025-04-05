"use client";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaChartLine, FaUsers } from "react-icons/fa";
import { CanvasRevealEffect } from "./ui/CanvasRevealEffect";

// Define the Card component inline since it's not imported
const Card = ({
  title,
  icon,
  children,
  des,
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  des: React.ReactNode;
}) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-white/[0.2] group/canvas-card flex items-center justify-center
       max-w-xl w-full mx-auto p-6 relative lg:h-[40rem] rounded-3xl"
      style={{
        background: "rgb(4,7,29)",
        backgroundColor:
          "linear-gradient(90deg, rgba(4,7,29,1) 0%, rgba(12,14,35,1) 100%)",
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      <Icon className="absolute h-10 w-10 -top-3 -left-3 text-white opacity-30" />
      <Icon className="absolute h-10 w-10 -bottom-3 -left-3 text-white opacity-30" />
      <Icon className="absolute h-10 w-10 -top-3 -right-3 text-white opacity-30" />
      <Icon className="absolute h-10 w-10 -bottom-3 -right-3 text-white opacity-30" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="h-full w-full absolute inset-0"
      >
        {children}
      </motion.div>

      <div className="relative z-20 px-10 w-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: hovered ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center w-16 h-16 mb-4"
        >
          {icon}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-white text-center text-4xl
           relative z-10 font-bold group-hover/canvas-card:text-white 
           group-hover/canvas-card:translate-y-3 group-hover/canvas-card:transition-all"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-white/60 text-center text-lg
           relative z-10 mt-4 group-hover/canvas-card:translate-y-3 group-hover/canvas-card:transition-all"
        >
          {des}
        </motion.p>
      </div>
    </motion.div>
  );
};

const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m6-6H6"
      />
    </svg>
  );
};

const Approach = () => {
  return (
    <section id="approach" className="w-full py-12">
      <div className="relative z-20">
        <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-16 text-white">
          <span className="text-pink-300">
            Our
          </span>{" "}
          <span className="text-cyan-300">
            Approach
          </span>
        </h2>
      </div>
      
      <div className="my-8 flex flex-col lg:flex-row items-center justify-center w-full gap-2">
        <Card
          title="Business Model"
          icon={<FaRobot className="w-6 h-6" />}
          des={
            <>
              We are utilizing <span className="font-bold text-pink-300">Sony's Aitrios platform</span> that detects real time data, 
              and selling it as a <span className="font-bold text-cyan-300">subscription service</span> to small businesses who will 
              also be able to use these cameras to use as real time data.
            </>
          }
        >
          <CanvasRevealEffect
            animationSpeed={5.1}
            containerClassName="bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-3xl overflow-hidden"
            colors={[[255, 166, 158], [221, 255, 247]]}
            dotSize={2}
          />
        </Card>

        <Card
          title="Data Analytics"
          icon={<FaChartLine className="w-6 h-6" />}
          des={
            <>
              Our platform provides <span className="font-bold text-pink-300">real-time analytics</span> on foot traffic, 
              congestion patterns, and customer behavior, helping businesses make <span className="font-bold text-cyan-300">data-driven decisions</span> 
              to optimize operations and increase revenue.
            </>
          }
        >
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-3xl overflow-hidden"
            colors={[[122, 255, 255], [122, 255, 255]]}
            dotSize={2}
          />
        </Card>

        <Card
          title="Community Impact"
          icon={<FaUsers className="w-6 h-6" />}
          des={
            <>
              By democratizing access to <span className="font-bold text-pink-300">advanced AI technology</span>, we're helping 
              small businesses compete with larger corporations and <span className="font-bold text-cyan-300">create more vibrant local economies</span> 
              through smarter resource allocation.
            </>
          }
        >
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl overflow-hidden"
            colors={[[122, 255, 255], [122, 255, 255]]}
            dotSize={2}
          />
        </Card>
      </div>
      
      {/* Get Started button */}
      <div className="flex justify-center mt-6 mb-4">
        <a href="/signin">
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-pink-300 to-cyan-300 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Today
          </motion.button>
        </a>
      </div>
    </section>
  );
};

export default Approach;
