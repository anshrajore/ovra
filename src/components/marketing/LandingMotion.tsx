"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/animation/gsap-client";

export function LandingMotion() {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    isMountedRef.current = true;

    // Use gsap.matchMedia for responsive & accessible animation scopes
    const mm = gsap.matchMedia();

    // 1. Accessibility First: Reduced Motion
    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Immediately display all animated elements with zero transforms
      gsap.set(
        "[data-gsap-hero], [data-gsap-card], [data-gsap-badge], [data-gsap-step], [data-gsap-edge], .scroll-reveal",
        {
          opacity: 1,
          visibility: "visible",
          clearProps: "transform,filter",
        }
      );
    });

    // 2. Standard Motion (Desktop & Tablet)
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero Entrance Timeline
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      const heroTitle = document.querySelector("h1");
      const heroParagraph = document.querySelector("section h1 + p");
      const heroButtons = document.querySelectorAll("section h1 ~ div a, section h1 ~ div button");
      const heroCards = document.querySelectorAll("[data-gsap-card]");
      const topBadges = document.querySelectorAll(".washi-tape, section > div:first-child > div");

      if (topBadges.length > 0) {
        heroTl.fromTo(
          topBadges,
          { opacity: 0, y: -15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08 }
        );
      }

      if (heroTitle) {
        heroTl.fromTo(
          heroTitle,
          { opacity: 0, y: 35, skewY: 1 },
          { opacity: 1, y: 0, skewY: 0, duration: 0.9 },
          "-=0.3"
        );
      }

      if (heroParagraph) {
        heroTl.fromTo(
          heroParagraph,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        );
      }

      if (heroButtons.length > 0) {
        heroTl.fromTo(
          heroButtons,
          { opacity: 0, y: 15, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
          "-=0.4"
        );
      }

      if (heroCards.length > 0) {
        heroTl.fromTo(
          heroCards,
          { opacity: 0, y: 50, rotateX: 15, scale: 0.9 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1, stagger: 0.15, ease: "back.out(1.4)" },
          "-=0.6"
        );
      }

      // Manifesto ScrollTrigger Section
      const manifestoSection = document.getElementById("manifesto");
      if (manifestoSection) {
        const manifestoHeading = manifestoSection.querySelector("h2");
        const manifestoSteps = manifestoSection.querySelectorAll(".grid > div");

        if (manifestoHeading) {
          gsap.fromTo(
            manifestoHeading,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: manifestoHeading,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (manifestoSteps.length > 0) {
          gsap.fromTo(
            manifestoSteps,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power2.out",
              scrollTrigger: {
                trigger: manifestoSection.querySelector(".grid"),
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      }

      // Pipelines & Project Folders ScrollTrigger Section
      const pipelinesSection = document.getElementById("pipelines");
      if (pipelinesSection) {
        const pipelineFolder = pipelinesSection.querySelector(".scroll-reveal");
        const pipelineNodes = pipelinesSection.querySelectorAll(".rounded-2xl.border");

        if (pipelineFolder) {
          gsap.fromTo(
            pipelineFolder,
            { opacity: 0, y: 40, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: pipelinesSection,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (pipelineNodes.length > 0) {
          gsap.fromTo(
            pipelineNodes,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: pipelinesSection,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      }

      // Tactile Badge Rack Stagger
      const badgeSection = document.querySelector("section.bg-\\[\\#FAF7F2\\].py-20");
      if (badgeSection) {
        const badgeButtons = badgeSection.querySelectorAll("button");
        if (badgeButtons.length > 0) {
          gsap.fromTo(
            badgeButtons,
            { opacity: 0, y: 30, scale: 0.92 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.05,
              ease: "back.out(1.2)",
              scrollTrigger: {
                trigger: badgeSection,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      }

      // API Inspector Section Entrance
      const apiInspector = document.querySelector("section .bg-\\[\\#0B0D13\\]");
      if (apiInspector) {
        gsap.fromTo(
          apiInspector,
          { opacity: 0, y: 50, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: apiInspector,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Refresh ScrollTrigger after initial DOM calculations
      ScrollTrigger.refresh();
    });

    return () => {
      // Revert all matchMedia setups and kill active triggers
      mm.revert();
    };
  }, []);

  return null;
}
