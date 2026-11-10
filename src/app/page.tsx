import { PlumbArcaNavbar } from "@/components/landing/PlumbArcaNavbar";
import { Arca3DHero } from "@/components/landing/Arca3DHero";
import { PlumbManifesto } from "@/components/landing/PlumbManifesto";
import { RobinProjectFolders } from "@/components/landing/RobinProjectFolders";
import { TactileBadgeRack } from "@/components/landing/TactileBadgeRack";
import { LandingApiInspector } from "@/components/landing/LandingApiInspector";
import { ArcaFooter } from "@/components/landing/ArcaFooter";
import { ScrollRevealObserver } from "@/components/landing/ScrollRevealObserver";
import { LandingMotion } from "@/components/marketing/LandingMotion";
import { ProGsapLoader } from "@/components/common/ProGsapLoader";

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen bg-[#08090C] text-white flex flex-col overflow-x-hidden selection:bg-[#2342FF] selection:text-white">
      {/* Pro Minimal GSAP System Preloader */}
      <ProGsapLoader />

      {/* GSAP Motion System & ScrollTrigger Controller */}
      <LandingMotion />

      {/* Scroll Triggered Entrance Observer */}
      <ScrollRevealObserver />

      {/* 1. Floating Glassmorphic Top Navbar (Plumb & ARCA) */}
      <PlumbArcaNavbar />

      {/* 2. Electric Cobalt 3D Hero with Kinetic OVRA Backdrop (ARCA + Plumb + Robin) */}
      <Arca3DHero />

      {/* 3. Deep Editorial Manifesto & Live Execution Stream (Plumb) */}
      <PlumbManifesto />

      {/* 4. Cut-Out Folder Tabs & Physical Pipeline Case Studies (Robin) */}
      <RobinProjectFolders />

      {/* 5. Tactile Primitives & Playful Badge Rack (Robin Craft + ARCA Palette) */}
      <TactileBadgeRack />

      {/* 6. Live In-Canvas API Studio & cURL Inspector */}
      <LandingApiInspector />

      {/* 7. High-Contrast Electric Blue & Obsidian Footer (ARCA) */}
      <ArcaFooter />
    </main>
  );
}
