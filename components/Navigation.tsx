"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaChartLine,
  FaBuilding,
  FaLightbulb,
  FaRobot,
  FaEnvelope
} from 'react-icons/fa';

const Navigation = () => {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Determine if user is a business
  const isBusiness = currentUser?.userType === 'business';
  
  // Check if we're on a dashboard page
  const isDashboardPage = pathname === '/dashboard';

  // Navigation links
  const navLinks = [
    { href: '/', label: 'Home', icon: <FaHome /> },
    { href: '#approach', label: 'Approach', icon: <FaRobot /> },
    { href: '#traffic-stats', label: 'Insights', icon: <FaLightbulb /> },
    { href: '#contact', label: 'Contact', icon: <FaEnvelope /> },
  ];

  // Scroll to section
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Render navigation content
  const renderNavContent = () => (
    <div className="flex items-center justify-between w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold bg-gradient-to-r from-pink-300 via-pink-400 to-purple-300 bg-clip-text text-transparent">
          CrowdCast
        </span>
      </Link>

      {/* Desktop Navigation Links - Hide on dashboard */}
      {!isDashboardPage && (
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={(e) => scrollToSection(e, link.href)}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                pathname === link.href 
                  ? 'text-pink-400' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Auth Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        {currentUser ? (
          <>
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard' 
                  ? 'text-pink-400' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/signin" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/signin' 
                  ? 'text-pink-400' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-white/70 hover:text-white transition-colors"
      >
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-black/80 backdrop-blur-md py-4 px-6">
        {renderNavContent()}
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-white/10 md:hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Links - Hide on dashboard */}
              {!isDashboardPage && (
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className="flex items-center space-x-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-white/10">
                {currentUser ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                      <FaUser />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-sm font-medium text-white/70 hover:text-white transition-colors w-full"
                    >
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/signin"
                      className="flex items-center space-x-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                      <FaUser />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center space-x-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                      <FaUser />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation; 