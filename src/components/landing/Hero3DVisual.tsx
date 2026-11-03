"use client";

export function Hero3DVisual() {
  return (
    <div className="relative w-full h-[360px] md:h-[420px] flex items-center justify-center select-none overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-amber-400/25 via-pink-400/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-600/25 via-indigo-500/15 to-teal-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Composition Container */}
      <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px]">
        {/* Transparent Glass Block (Top Right) */}
        <div
          className="absolute top-4 right-10 w-24 h-36 rounded-2xl border border-white/50 bg-gradient-to-br from-white/40 via-white/10 to-transparent backdrop-blur-md shadow-lg transform rotate-12 transition-transform duration-700 hover:rotate-6"
          style={{
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), inset 0 0 15px rgba(255, 255, 255, 0.6)",
          }}
        >
          {/* Subtle refraction lines */}
          <div className="absolute inset-x-2 top-3 h-0.5 bg-white/60 rounded" />
          <div className="absolute inset-x-2 top-6 h-0.5 bg-white/40 rounded" />
        </div>

        {/* Chrome Metallic Sphere (Top Right) */}
        <div
          className="absolute top-12 right-24 w-14 h-14 rounded-full shadow-2xl z-20 transform hover:scale-105 transition-transform"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffffff 0%, #d4d4d8 35%, #71717a 70%, #27272a 100%)",
            boxShadow:
              "0 15px 35px rgba(0,0,0,0.35), inset -2px -2px 6px rgba(0,0,0,0.6), inset 3px 3px 6px rgba(255,255,255,0.9)",
          }}
        />

        {/* Deep Purple Fluffy Cloud Cluster (Center Top) */}
        <div className="absolute top-8 left-12 w-48 h-48 z-10">
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
            <defs>
              <radialGradient id="purpleCluster" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="30%" stopColor="#4338CA" />
                <stop offset="70%" stopColor="#312E81" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </radialGradient>
              <filter id="clayTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1.2">
                  <feDistantLight azimuth="55" elevation="60" />
                </feDiffuseLighting>
                <feBlend mode="multiply" in="SourceGraphic" />
              </filter>
            </defs>
            <path
              d="M70,50 Q100,20 130,45 Q165,40 160,80 Q180,110 150,140 Q130,170 90,160 Q50,175 40,135 Q10,110 35,75 Q40,45 70,50 Z"
              fill="url(#purpleCluster)"
            />
            {/* Soft specular bulb highlights */}
            <circle cx="85" cy="55" r="22" fill="#818CF8" opacity="0.35" filter="blur(6px)" />
            <circle cx="135" cy="80" r="18" fill="#818CF8" opacity="0.3" filter="blur(6px)" />
          </svg>
        </div>

        {/* Teal Textured Coin / Disk (Center Left) */}
        <div
          className="absolute bottom-16 left-2 w-28 h-28 rounded-full z-15 shadow-xl transform -rotate-12 hover:scale-105 transition-transform"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #5EEAD4 0%, #0D9488 55%, #115E59 100%)",
            boxShadow:
              "0 20px 40px rgba(13, 148, 136, 0.35), inset 0 2px 5px rgba(255, 255, 255, 0.6)",
          }}
        >
          {/* Circular micro-ridges */}
          <div className="absolute inset-2 rounded-full border border-teal-200/40" />
          <div className="absolute inset-4 rounded-full border border-teal-200/30" />
        </div>

        {/* Vibrant Yellow 3D Star (Center Right) */}
        <div className="absolute bottom-6 right-8 w-44 h-44 z-30 transform hover:rotate-6 transition-transform">
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
            <defs>
              <linearGradient id="yellowStarGrad" x1="20%" y1="10%" x2="80%" y2="90%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#FACC15" />
                <stop offset="75%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
              <radialGradient id="starSpecular" cx="45%" cy="35%" r="45%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#FEF08A" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Puffy 5-point Star */}
            <path
              d="M100,15 Q115,65 155,75 Q115,100 130,150 Q95,120 60,150 Q75,100 35,75 Q85,65 100,15 Z"
              fill="url(#yellowStarGrad)"
            />
            {/* Specular Puffy Core */}
            <circle cx="95" cy="85" r="35" fill="url(#starSpecular)" />
          </svg>
        </div>

        {/* Glossy Orange Sphere (Front Center) */}
        <div
          className="absolute bottom-10 left-28 w-20 h-20 rounded-full z-40 shadow-2xl transform hover:scale-110 transition-transform"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #FF9E66 0%, #FF5C00 45%, #D43800 85%, #8A1A00 100%)",
            boxShadow:
              "0 20px 45px rgba(255, 92, 0, 0.45), inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 8px rgba(255,255,255,0.7)",
          }}
        />

        {/* Small Chrome Sphere Cluster (Bottom Right) */}
        <div
          className="absolute bottom-4 right-4 w-11 h-11 rounded-full shadow-xl z-35"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffffff 0%, #d4d4d8 35%, #71717a 70%, #27272a 100%)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
          }}
        />
        <div
          className="absolute bottom-10 right-0 w-7 h-7 rounded-full shadow-lg z-35"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffffff 0%, #e4e4e7 40%, #71717a 80%, #3f3f46 100%)",
          }}
        />
      </div>
    </div>
  );
}
