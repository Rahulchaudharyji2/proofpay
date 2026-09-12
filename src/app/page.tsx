"use client";

import { useAccount, useConnect } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Zap, Lock, BrainCircuit, ArrowRight, ChevronRight, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-[#05050a] text-white selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              ProofPay
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <Link href="/dashboard" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-white/10">
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            ) : (
              <button 
                onClick={() => {
                  const injected = connectors.find(c => c.id === 'injected');
                  if (injected) connect({ connector: injected });
                }}
                className="relative group px-6 py-2.5 rounded-full overflow-hidden bg-indigo-600 text-white font-medium text-sm transition-all hover:scale-105"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-2">
                  Connect Wallet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
            <SparklesIcon className="w-3.5 h-3.5" /> Empowering Web3 AI Agents
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
             The Economic Security Layer <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
               for Autonomous AI Commerce
             </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
            Give your AI agents the autonomy to purchase services (inference, RPCs, APIs) while bounding their spend via cryptographic Smart Contract Mandates.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             {isConnected ? (
                <Link href="/dashboard" className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                  Launch App <ChevronRight className="w-5 h-5" />
                </Link>
             ) : (
                <button 
                  onClick={() => {
                    const injected = connectors.find(c => c.id === 'injected');
                    if (injected) connect({ connector: injected });
                  }}
                  className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-2"
                >
                  Connect to Start <ChevronRight className="w-5 h-5" />
                </button>
             )}
          </div>
        </section>

        {/* Feature Cards */}
        <section id="vision" className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6 text-purple-400" />}
              title="LLM-Powered Autonomy"
              desc="Agents use Google Gemini to autonomously select the best providers based on task requirements, quality scores, and latency."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
              title="Smart Contract Mandates"
              desc="Agents are cryptographically constrained. They can only spend within the exact budgets and parameters you deploy on-chain."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-indigo-400" />}
              title="Trustless Escrow"
              desc="Payments are locked in escrow (HTTP 402 flow) and only settled when the provider delivers verifiable cryptographic proof of work."
            />
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How ProofPay Works</h2>
            <p className="text-slate-400">A seamless flow from user intent to on-chain settlement.</p>
          </div>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-emerald-500/0 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <StepCard 
                number="01"
                title="Create Task"
                desc="Upload your prompt and constraints to your autonomous agent."
              />
              <StepCard 
                number="02"
                title="AI Negotiation"
                desc="Agent negotiates with providers and locks funds in escrow."
              />
              <StepCard 
                number="03"
                title="Service Delivery"
                desc="Provider fulfills the task and uploads cryptographic proof."
              />
              <StepCard 
                number="04"
                title="Settlement"
                desc="Smart contract verifies proof and releases the payment."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-slate-300">ProofPay Protocol</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2026 ProofPay. Designed for the Autonomous Economy.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-black/50 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 shadow-xl">
      <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl mb-6 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
        {number}
      </div>
      <h3 className="text-lg font-bold mb-2 text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}
