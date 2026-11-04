import Link from "next/link";
import { ArrowLeft, FileCheck } from "lucide-react";

export default function DPAPage() {
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
            <FileCheck className="w-4 h-4" />
            <span>Enterprise Compliance</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Data Processing Addendum (DPA)</h1>
          <p className="text-xs text-gray-400">Standard Contractual Clauses & Sub-processor Governance</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-gray-300">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Nature & Purpose of Processing</h2>
            <p>
              This Data Processing Addendum (&quot;DPA&quot;) supplements the OVRA Terms of Service. Under this DPA, OVRA acts as a Data Processor on behalf of the customer (Data Fiduciary / Controller) to execute workflow DAGs, process webhook payloads, and store encrypted secrets.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Technical & Organizational Measures (TOMs)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>AES-256-GCM envelope encryption for sensitive credentials with automated rotation.</li>
              <li>PostgreSQL Row-Level Security (RLS) policies enforcing multi-tenant isolation.</li>
              <li>Encrypted data in transit via TLS 1.3 and encrypted at rest across all storage volumes.</li>
              <li>Comprehensive immutable audit logs for all credential access and workflow executions.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Sub-processors</h2>
            <p>
              We maintain a curated roster of enterprise infrastructure sub-processors (Supabase for PostgreSQL/Storage, Vercel for Edge Delivery). Customers receive advance notice of any planned sub-processor modifications.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
