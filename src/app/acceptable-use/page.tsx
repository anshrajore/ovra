import Link from "next/link";
import { ArrowLeft, AlertOctagon } from "lucide-react";

export default function AcceptableUsePage() {
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
            <AlertOctagon className="w-4 h-4" />
            <span>Platform Integrity</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Acceptable Use Policy</h1>
          <p className="text-xs text-gray-400">Security Guidelines & Prohibited Activities • Version 1.0</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-gray-300">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Prohibited Workflow Activities</h2>
            <p>
              Users may not utilize OVRA nodes, scheduled triggers, or webhook endpoints to conduct denial-of-service attacks, port scanning, unauthorized vulnerability testing, scraping private data without authorization, or transmitting unsolicited bulk communications (spam).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. SSRF & Private Network Protection</h2>
            <p>
              The OVRA control plane strictly enforces Server-Side Request Forgery (SSRF) protections. HTTP Request nodes are prohibited from resolving or requesting internal loopback addresses (`127.0.0.1/8`), AWS instance metadata endpoints (`169.254.169.254`), or private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) without verified hybrid VPC tunnel credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Fair Use & Rate Enforcements</h2>
            <p>
              To maintain sub-10ms scheduling latency across the shared queue infrastructure, workspaces must adhere to provisioned rate limits. Excessive automated loop iterations without batching will trigger temporary backoff throttling.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
