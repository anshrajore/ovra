"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/animation/gsap-client";

interface ProGsapLoaderProps {
  onComplete?: () => void;
  minDuration?: number;
  autoDismiss?: boolean;
}

export function ProGsapLoader({
  onComplete,
  minDuration = 1.3,
  autoDismiss = true,
}: ProGsapLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const glyphLeftNodeRef = useRef<SVGCircleElement>(null);
  const glyphRightNodeRef = useRef<SVGCircleElement>(null);
  const glyphBridgeRef = useRef<SVGPathElement>(null);
  const statusLabelRef = useRef<HTMLParagraphElement>(null);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Check if user already saw the loader in this session to respect workflow navigation
    const hasSeen = sessionStorage.getItem("ovra_loader_seen");
    if (hasSeen && autoDismiss) {
      setVisible(false);
      onComplete?.();
      return;
    }

    const ctx = gsap.context(() => {
      const counterObj = { val: 0 };
      const statusSteps = [
        "INITIALIZING ENGINE CORE",
        "COMPILING SOVEREIGN DAG",
        "SECURING KMS ENVELOPE",
        "MUMBAI ap-south-1 NOMINAL",
      ];

      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("ovra_loader_seen", "true");
          // Smooth curtain reveal upwards
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.85,
            ease: "expo.inOut",
            onComplete: () => {
              setVisible(false);
              onComplete?.();
            },
          });
        },
      });

      // 1. Initial State Setup
      gsap.set(glyphBridgeRef.current, { strokeDasharray: 40, strokeDashoffset: 40 });
      gsap.set([glyphLeftNodeRef.current, glyphRightNodeRef.current], { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(progressLineRef.current, { scaleX: 0, transformOrigin: "0% 50%" });

      // 2. Entrance & Kinetic Glyph Bloom
      tl.to([glyphLeftNodeRef.current, glyphRightNodeRef.current], {
        scale: 1,
        duration: 0.45,
        stagger: 0.12,
        ease: "back.out(2)",
      })
      .to(
        glyphBridgeRef.current,
        {
          strokeDashoffset: 0,
          duration: 0.55,
          ease: "power2.inOut",
        },
        "-=0.2"
      )
      // 3. Counter and Hairline Progress interpolation
      .to(
        counterObj,
        {
          val: 100,
          duration: minDuration,
          ease: "power2.out",
          onUpdate: () => {
            if (numberRef.current) {
              const currentVal = Math.floor(counterObj.val);
              numberRef.current.textContent = currentVal < 10 ? `0${currentVal}` : `${currentVal}`;
              
              if (statusLabelRef.current) {
                const stepIdx = Math.min(
                  Math.floor((currentVal / 100) * statusSteps.length),
                  statusSteps.length - 1
                );
                statusLabelRef.current.textContent = statusSteps[stepIdx];
              }
            }
          },
        },
        "-=0.35"
      )
      .to(
        progressLineRef.current,
        {
          scaleX: 1,
          duration: minDuration,
          ease: "power2.out",
        },
        "<"
      )
      // 4. Subtle pulse bloom at 100%
      .to(
        [glyphLeftNodeRef.current, glyphRightNodeRef.current],
        {
          scale: 1.2,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        },
        "-=0.08"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [minDuration, autoDismiss, onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-10 sm:p-14 bg-[#08090C] text-white select-none overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(35, 66, 255, 0.08) 0%, transparent 60%),
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 32px 32px, 32px 32px",
      }}
    >
      {/* Top Telemetry Header */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2342FF] animate-pulse" />
          <span>OVRA // SYSTEM LOADER</span>
        </div>
        <div className="hidden sm:block">ARCH // SOVEREIGN ENGINE</div>
      </div>

      {/* Center Kinetic Dual-Node SVG + Micro Counter */}
      <div className="flex flex-col items-center justify-center gap-7">
        <div className="relative w-24 h-14 flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 96 56" fill="none">
            {/* Glowing signal bridge path */}
            <path
              ref={glyphBridgeRef}
              d="M24 28 C 40 16, 56 40, 72 28"
              stroke="#2342FF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Left Node */}
            <circle
              ref={glyphLeftNodeRef}
              cx="24"
              cy="28"
              r="7"
              fill="#FFFFFF"
              stroke="#2342FF"
              strokeWidth="3"
            />
            {/* Right Node */}
            <circle
              ref={glyphRightNodeRef}
              cx="72"
              cy="28"
              r="7"
              fill="#2342FF"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Monospace Precision Counter */}
        <div className="flex items-baseline gap-1 font-mono tracking-tighter">
          <span
            ref={numberRef}
            className="text-6xl sm:text-7xl font-light text-white tabular-nums tracking-tighter"
          >
            00
          </span>
          <span className="text-xl sm:text-2xl font-normal text-[#2342FF]">%</span>
        </div>

        {/* Dynamic Telemetry Status Stream */}
        <p
          ref={statusLabelRef}
          className="text-xs font-mono font-medium tracking-[0.2em] text-neutral-400 uppercase text-center h-4"
        >
          INITIALIZING ENGINE CORE
        </p>
      </div>

      {/* Bottom Precision Hairline Progress Track */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            ref={progressLineRef}
            className="w-full h-full bg-gradient-to-r from-[#2342FF] via-[#5E76FF] to-white shadow-[0_0_12px_#2342FF]"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
          <span>LATENCY // 14ms</span>
          <span>SUBSTRATE // POSTGRESQL</span>
        </div>
      </div>
    </div>
  );
}
