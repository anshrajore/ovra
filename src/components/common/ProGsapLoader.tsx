"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/animation/gsap-client";

const WORDS = ["OVRA", "Connect", "Orchestrate", "Scale"];

interface ProGsapLoaderProps {
  onComplete?: () => void;
  autoDismiss?: boolean;
}

export function ProGsapLoader({ onComplete, autoDismiss = true }: ProGsapLoaderProps) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [visible, setVisible] = useState(true);

  const loaderRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Set viewport dimensions
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect session so returning users don't get blocked
    if (autoDismiss && sessionStorage.getItem("ovra_loader_seen")) {
      setVisible(false);
      onComplete?.();
      return;
    }

    setDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Guaranteed failsafe: dismiss loader unconditionally after 2200ms
    const safetyTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2200);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(safetyTimer);
    };
  }, [autoDismiss, onComplete]);

  // Words cycle & Curved SVG Pull Exit
  useEffect(() => {
    if (dimension.width === 0 || dimension.height === 0 || !visible) return;

    const w = dimension.width;
    const h = dimension.height;

    // Word cycling timer
    if (index < WORDS.length - 1) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, 260);
      return () => clearTimeout(timer);
    }

    // When last word is reached, trigger the signature 21st.dev / Olivier Larose SVG Curve exit
    const exitTimer = setTimeout(() => {
      sessionStorage.setItem("ovra_loader_seen", "true");

      const animProps = {
        top: 0,
        curve: 0,
      };

      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false);
          onComplete?.();
        },
      });

      // 1. Text fades & scales out smoothly
      tl.to(textRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.25,
        ease: "power2.in",
      })
      // 2. Animate the liquid SVG curve tension and slide up
      .to(
        animProps,
        {
          top: -100,
          curve: 280,
          duration: 0.75,
          ease: "power3.in",
          onUpdate: () => {
            if (loaderRef.current && pathRef.current) {
              loaderRef.current.style.transform = `translateY(${animProps.top}%)`;
              pathRef.current.setAttribute(
                "d",
                `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + animProps.curve} 0 ${h} L0 0`
              );
            }
          },
        },
        "-=0.1"
      )
      // 3. Flatten curve smoothly as it exits the screen
      .to(
        animProps,
        {
          curve: 0,
          duration: 0.35,
          ease: "power2.out",
          onUpdate: () => {
            if (pathRef.current) {
              pathRef.current.setAttribute(
                "d",
                `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + animProps.curve} 0 ${h} L0 0`
              );
            }
          },
        },
        "-=0.2"
      );
    }, 320);

    return () => clearTimeout(exitTimer);
  }, [dimension, index, visible, onComplete]);

  // Initial SVG path
  useEffect(() => {
    if (dimension.width > 0 && dimension.height > 0 && pathRef.current) {
      const w = dimension.width;
      const h = dimension.height;
      pathRef.current.setAttribute(
        "d",
        `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`
      );
    }
  }, [dimension]);

  if (!visible || dimension.width === 0) return null;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center select-none"
      style={{
        width: "100vw",
        height: "calc(100vh + 300px)",
        willChange: "transform",
      }}
    >
      {/* SVG Canvas with Curved Bottom Arc */}
      <svg
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{
          height: "calc(100vh + 300px)",
        }}
      >
        <path ref={pathRef} fill="#0A0B0E" />
      </svg>

      {/* Minimal Centered Word with Electric Cobalt Node Dot */}
      <div
        ref={textRef}
        key={index}
        className="relative z-10 flex items-center gap-3 text-white transition-all duration-200"
        style={{
          marginTop: "-150px", // Offset for the extra 300px curve canvas
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#2342FF] animate-pulse" />
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-sans">
          {WORDS[index]}
        </h2>
      </div>
    </div>
  );
}
