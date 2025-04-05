"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChartLine, FaUsers, FaMapMarkerAlt, FaClock, FaArrowRight, FaChartBar } from 'react-icons/fa';

// Mock data for traffic statistics
const trafficStats = [
  {
    id: 1,
    title: "Current Occupancy",
    value: "78%",
    change: "+12%",
    icon: <FaUsers className="text-pink-400" />,
    location: "Downtown Mall"
  },
  {
    id: 2,
    title: "Peak Hours",
    value: "2:00 PM - 5:00 PM",
    change: "Today",
    icon: <FaClock className="text-purple-400" />,
    location: "Central Park"
  },
  {
    id: 3,
    title: "Average Dwell Time",
    value: "24 min",
    change: "-3 min",
    icon: <FaChartLine className="text-cyan-400" />,
    location: "Shopping District"
  },
  {
    id: 4,
    title: "Traffic Flow",
    value: "High",
    change: "Increasing",
    icon: <FaMapMarkerAlt className="text-pink-400" />,
    location: "Business District"
  },
  {
    id: 5,
    title: "Crowd Density",
    value: "Medium",
    change: "Stable",
    icon: <FaUsers className="text-purple-400" />,
    location: "Entertainment Zone"
  },
  {
    id: 6,
    title: "Weekly Growth",
    value: "15%",
    change: "+5%",
    icon: <FaChartBar className="text-cyan-400" />,
    location: "City Center"
  }
];

const TrafficStats = () => {
  return (
    <section id="traffic-stats" className="py-20 px-4 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
              Live Traffic Insights
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Powered by Sony AITRIOS technology, providing real-time crowd analytics near you
          </p>
        </motion.div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {trafficStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
              <div className="relative bg-black/80 backdrop-blur-md p-6 rounded-lg h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.change.includes('+') ? 'bg-green-500/20 text-green-400' : 
                    stat.change.includes('-') ? 'bg-red-500/20 text-red-400' : 
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-400 text-sm mt-auto">{stat.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/signin"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg transform transition-transform group-hover:scale-105" />
            <div className="relative flex items-center justify-center space-x-2 text-white">
              <span>Sign in to see more insights</span>
              <FaArrowRight className="transform transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrafficStats; 