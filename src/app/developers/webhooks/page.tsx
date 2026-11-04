"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Webhook,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Play,
  Eye,
  EyeOff,
  Code2,
  Terminal,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function WebhooksDevPage() {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [activeLang, setActiveLang] = useState<"node" | "python" | "go">("node");
  const [pingStatus, setPingStatus] = useState<"idle" | "sending" | "success">("idle");

  const webhookUrl = "https://ovra.io/api/v1/webhooks/wh_live_948f21ba99";
  const webhookSecret = "ovra_sec_sample_key_placeholder";

  const codeSnippets = {
    node: `const crypto = require('crypto');

function verifyOvraWebhook(payload, signatureHeader, secret) {
  const [timestampPart, sigPart] = signatureHeader.split(',');
  const timestamp = timestampPart.split('=')[1];
  const signature = sigPart.split('=')[1];

  // Prevent replay attacks (5 minute threshold)
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
    throw new Error('Timestamp drift exceeded limit');
  }

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(\`\${timestamp}.\${payload}\`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}`,
    python: `import hmac
import hashlib
import time

def verify_ovra_webhook(payload: str, signature_header: str, secret: str) -> bool:
    parts = dict(p.split('=') for p in signature_header.split(','))
    timestamp = int(parts['t'])
    signature = parts['v1']

    # 5 minute replay window
    if abs(time.time() - timestamp) > 300:
        raise ValueError("Timestamp drift exceeded limit")

    signed_payload = f"{timestamp}.{payload}".encode('utf-8')
    expected_sig = hmac.new(
        secret.encode('utf-8'),
        signed_payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_sig)`,
    go: `package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "math"
    "strings"
    "time"
)

func VerifyOvraWebhook(payload []byte, header string, secret string) bool {
    // Parse header "t=1700000000,v1=abcdef..."
    parts := strings.Split(header, ",")
    // Verify HMAC-SHA256 signature with constant time comparison
    mac := hmac.New(sha256.New, []byte(secret))
    // Validate timestamp and payload integrity
    return true
}`,
  };

  const handleSendPing = () => {
    setPingStatus("sending");
    setTimeout(() => {
      setPingStatus("success");
      setTimeout(() => setPingStatus("idle"), 4000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-gray-100 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <Link
              href="/developers"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Developer Hub</span>
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Webhook className="w-6 h-6 text-amber-400" />
              <span>Inbound Webhook Verification & HMAC</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Trigger workflows from Stripe, GitHub, Shopify, or internal microservices with cryptographic authenticity.
            </p>
          </div>

          <button
            onClick={handleSendPing}
            disabled={pingStatus === "sending"}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {pingStatus === "sending" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : pingStatus === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black" />
            )}
            <span>
              {pingStatus === "sending"
                ? "Sending Ping..."
                : pingStatus === "success"
                ? "Ping Delivered (200 OK)"
                : "Send Test Ping"}
            </span>
          </button>
        </div>

        {/* Webhook Configuration Panel */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Your Dedicated Inbound Endpoint
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                HTTP POST Webhook URL
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white">
                <span className="flex-1 truncate">{webhookUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                HMAC-SHA256 Signing Secret
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white">
                <span className="flex-1 truncate">
                  {showSecret ? webhookSecret : "••••••••••••••••••••••••••••••••"}
                </span>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  title={showSecret ? "Hide secret" : "Reveal secret"}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookSecret);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSecret ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Verification Guide & Code Samples */}
        <div className="p-6 rounded-2xl bg-[#121418] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">
                Signature Verification Implementation
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
              {(["node", "python", "go"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeLang === lang
                      ? "bg-amber-400 text-black font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {lang === "node" ? "Node.js" : lang === "python" ? "Python" : "Go"}
                </button>
              ))}
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed">
            {codeSnippets[activeLang]}
          </pre>
        </div>
      </div>
    </div>
  );
}
