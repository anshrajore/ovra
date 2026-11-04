import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#0C0D10] text-gray-200 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Cookie className="w-4 h-4" />
            <span>Browser Storage</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cookie Policy</h1>
          <p className="text-xs text-gray-400">Strictly Necessary & Functional Cookies</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-gray-300">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Use of Cookies</h2>
            <p>
              OVRA utilizes strictly necessary session cookies managed via Supabase SSR to authenticate requests, maintain active workspace sessions, and prevent cross-site request forgery (CSRF).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Zero Third-Party Advertising Trackers</h2>
            <p>
              We do not employ third-party behavioral advertising cookies or cross-site tracking scripts. Client-side storage (`localStorage`) is used exclusively to persist your active canvas zoom levels, project selections, and node library favorites locally in your browser.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
