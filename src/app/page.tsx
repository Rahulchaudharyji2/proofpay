"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Bot, ShieldCheck, Zap, Database, Activity, Lock, Cpu, Globe, CheckCircle2, Network, Shield } from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/5 blur-[120px] mix-blend-screen"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/60 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-[1px]">
              <div className="w-full h-full bg-[#030305] rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-indigo-400 w-5 h-5" />
              </div>
            </div>
            <span className="font-black tracking-tighter text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              ProofPay
            </span>
          </div>
          <div className="flex items-center gap-6">
            {mounted && isConnected && (
              <>
                <Link href="/dashboard" className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/agents/create" className="hidden md:block text-sm font-semibold bg-white text-black hover:bg-slate-200 transition-colors py-2 px-5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Deploy Agent
                </Link>
              </>
            )}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ConnectWallet layout="navbar" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-xs tracking-widest uppercase mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            W3A-1 Architecture Live
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.05]">
            Economic Security for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              Autonomous AI.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Give your AI agents a cryptographic spending mandate. Our firewall ensures they only purchase verified services—blocking prompt injections and overspending before the transaction hits the chain.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/agents/create" className="group relative px-8 py-4 bg-white rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300 w-full sm:w-auto">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2 font-bold text-black group-hover:text-white transition-colors duration-300">
                Deploy Agent <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/10 text-white font-semibold py-4 px-8 rounded-full transition-all w-full sm:w-auto backdrop-blur-md">
              Enter Command Center
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mt-40"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {[
            { icon: <Lock className="w-6 h-6 text-indigo-400" />, title: "Cryptographic Mandates", desc: "Agents are bounded by strict on-chain limits. They physically cannot spend more than their approved daily or transaction caps." },
            { icon: <Shield className="w-6 h-6 text-purple-400" />, title: "Deep AI Firewall", desc: "Every API request is intercepted. If an AI tries to buy a disallowed service, the firewall blocks the HTTP 402 flow instantly." },
            { icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />, title: "Outcome Verification", desc: "Funds are escrowed until cryptographic proof of delivery (IPFS CID) is provided. No verified delivery, no payment." }
          ].map((feature, i) => (
            <motion.div key={i} variants={fadeUp} className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* 8-Step Architecture Compact Grid */}
      <section className="relative z-10 py-24 bg-black/40 border-y border-white/5" ref={targetRef}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black/0 to-black/0 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-white">The Web3 + AI Lifecycle</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">An 8-step autonomous pipeline. From natural language to cryptographically verified settlement.</p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-emerald-500/0 -translate-y-1/2"></div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {[
                { step: "01", icon: <Bot />, title: "Intent Parsing", desc: "User prompt is analyzed to determine the required service." },
                { step: "02", icon: <Database />, title: "Provider Selection", desc: "AI evaluates and matches Price vs. Quality." },
                { step: "03", icon: <ShieldCheck />, title: "Mandate Firewall", desc: "System verifies the agent's on-chain spending limits." },
                { step: "04", icon: <Lock />, title: "HTTP 402 Escrow", desc: "Crypto funds are locked in the PaymentEscrow contract." },
                { step: "05", icon: <Cpu />, title: "Service Delivery", desc: "Provider executes the ML model or storage task." },
                { step: "06", icon: <Globe />, title: "IPFS Receipt", desc: "Provider uploads result to IPFS, returning a CID." },
                { step: "07", icon: <Activity />, title: "Outcome Verification", desc: "Hashes original request and result CID on-chain." },
                { step: "08", icon: <CheckCircle2 />, title: "Settlement", desc: "Escrow unlocks and funds transfer to provider." }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeUp}
                  className="bg-[#0a0a0e]/80 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl hover:border-indigo-500/40 hover:bg-white/[0.03] transition-all duration-300 relative group flex flex-col h-full"
                >
                  <div className="absolute top-4 right-4 text-4xl font-black text-white/5 select-none pointer-events-none group-hover:text-indigo-500/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed flex-1">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">Ready to secure your agents?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
            Deploy an autonomous agent in seconds. Set the budget, pick the services, and watch the Web3 economy thrive.
          </p>
          <Link href="/agents/create" className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold py-4 px-10 rounded-full hover:bg-slate-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] text-lg">
            Deploy Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#020203]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-black tracking-tighter text-xl text-slate-600">
            <ShieldCheck className="w-6 h-6" />
            <span>ProofPay</span>
          </div>
          <p className="text-slate-500 font-medium text-sm text-center md:text-right">
            Built for the ETHGlobal Agentic Ethereum Hackathon 2026.<br/>
            Securing the autonomous economy.
          </p>
        </div>
      </footer>
    </div>
  );
}
