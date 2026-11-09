"use client";

import { useEffect } from "react";

/**
 * High-performance IntersectionObserver hook for smooth scroll-triggered entrances.
 * Observes all elements marked with `.scroll-reveal` and smoothly adds `.scroll-reveal-visible`.
 */
export function ScrollRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-reveal-visible");
            // Unobserve once animated for maximum performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.12,
      }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
