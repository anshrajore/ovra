import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
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
            <Shield className="w-4 h-4" />
            <span>Legal Governance</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-gray-400">Effective Date: November 4, 2026 • Version 1.2</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-gray-300">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Agreement to Terms</h2>
            <p>
              By accessing, registering for, or using the OVRA Workflow Automation Platform (&quot;OVRA&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;), provided by Ansh Rajore, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Permitted Use & Sovereign Operation</h2>
            <p>
              OVRA provides a decoupled, node-based automation and AI orchestration engine. You are responsible for ensuring that all workflows, triggers, connectors, and expressions executed within your workspace comply with applicable laws, including India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act) and international data protection standards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Credentials, Security & Tenant Isolation</h2>
            <p>
              Customer credentials stored within the OVRA Vault are encrypted using AES-256-GCM envelope encryption. You retain full ownership and responsibility for third-party API keys, OAuth tokens, and database connection strings supplied to the service. We enforce strict PostgreSQL Row-Level Security (RLS) ensuring that your workflow state and execution telemetry are inaccessible to other tenants.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Service Level Commitments & Uptime</h2>
            <p>
              OVRA targets a 99.9% monthly uptime SLA for enterprise workflow execution queues. In the event of scheduled maintenance or critical cloud provider disruptions, we provide proactive status alerts and automated execution retry policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">5. Limitation of Liability & Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
