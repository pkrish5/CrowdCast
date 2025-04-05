'use client';

import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopArrow = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && 
        <div
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 cursor-pointer bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-6 h-6" />
        </div>
      }
    </>
  );
};

export default ScrollToTopArrow; 