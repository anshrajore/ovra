import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
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
            <Lock className="w-4 h-4" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Privacy Notice</h1>
          <p className="text-xs text-gray-400">Compliance: DPDP Act 2023 (India) & GDPR • Last Updated: November 2026</p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-gray-300">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Scope & Sovereign Data Architecture</h2>
            <p>
              This Privacy Notice explains how OVRA processes, protects, and stores personal data and execution telemetry. OVRA is architected with sovereign data residency options, prioritizing regional execution (Asia Pacific / Mumbai, India) with cryptographic tenant segregation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Information We Process</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Identifiers:</strong> Name, work email address, and authentication provider tokens (Google OAuth).</li>
              <li><strong>Workflow Configurations:</strong> DAG structure, node parameter schemas, expressions, and schedules.</li>
              <li><strong>Execution Telemetry:</strong> Step execution durations, status codes, and error logs. Payload data exceeding 64 KiB is automatically offloaded to encrypted private storage buckets.</li>
              <li><strong>Vault Credentials:</strong> Sensitive API keys and OAuth tokens are stored in ciphertext using AES-256-GCM. We never store or log plain text secrets.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. AI Data Processing & Zero Training Pledge</h2>
            <p>
              When using OVRA AI Studio or Foundation Model nodes (Google Gemini, OpenAI, Claude), prompt payloads and context strings are transmitted solely for real-time inference. Your proprietary workflow data and prompts are <strong>never</strong> used to train foundational AI models without your explicit opt-in.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. User Rights & Data Deletion</h2>
            <p>
              You maintain the absolute right to export, modify, or permanently delete your workspaces, workflows, and execution audit trails at any time via the Settings console or by contacting <span className="text-amber-400 font-mono">anshrajore1266@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
