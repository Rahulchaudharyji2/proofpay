"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ShieldCheck, ChevronDown, Mouse, Lock, Shield, CheckCircle2, ChevronRight, Sparkles, Coins, Bot, Database, Activity, Cpu, Globe, ArrowRight } from "lucide-react";
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

  // Mouse Parallax Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Abstract Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[150px] mix-blend-screen"></div>
        <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[120px] mix-blend-screen"></div>
      </div>

      {/* Navbar - Preserving Structure & Wagmi Connect */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-6">
        <div className="flex items-center justify-between px-6 lg:px-12 max-w-[1400px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-indigo-400 w-8 h-8" strokeWidth={2.5} />
            <span className="font-bold tracking-tight text-xl text-white">
              Proof<span className="text-indigo-400">Pay</span>
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {mounted && isConnected && (
              <>
                <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
                <Link href="/agents/create" className="hover:text-indigo-400 transition-colors">Create Agent</Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              {/* Preserving exactly the ConnectWallet component to not break existing flow */}
              <ConnectWallet layout="navbar" />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        
        {/* Hero Section */}
        <section 
          className="relative min-h-[80vh] flex flex-col justify-center perspective-[2000px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          
          {/* Floating Sparkles */}
          <Sparkles className="absolute top-1/4 right-[40%] text-indigo-400 w-12 h-12 animate-pulse opacity-80" strokeWidth={1} />
          <Sparkles className="absolute bottom-1/3 left-1/4 text-indigo-400 w-8 h-8 animate-pulse opacity-60 delay-700" strokeWidth={1.5} />

          {/* Big Typography */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 w-full"
          >
            <motion.h1 variants={fadeUp} className="text-[12vw] md:text-[180px] font-black tracking-tighter leading-none text-white">
              Web3 AI
            </motion.h1>
            
            {/* Glass Card Overlapping */}
            <motion.div variants={fadeUp} className="absolute left-4 md:left-24 top-[40%] md:top-[45%] w-[320px] md:w-[400px] bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl z-20">
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
                Give your AI agents a cryptographic spending mandate. Our deep firewall blocks overspending before transactions hit the chain.
              </p>
              <Link href="/agents/create" className="inline-flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-colors">
                Explore Details <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[12vw] md:text-[180px] font-black tracking-tighter leading-none text-white text-right mt-12 md:mt-0 relative z-10">
              Escrow
            </motion.h1>
          </motion.div>

          {/* 3D Visual Replacement */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute right-0 md:right-[10%] top-[15%] md:top-[10%] w-[250px] md:w-[400px] aspect-square z-0 hidden md:block"
          >
            <motion.div 
              style={{ rotateX, rotateY }}
              className="relative w-full h-full flex items-center justify-center transform-style-3d cursor-pointer"
            >
              {/* Glass Cube Base */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] transform rotate-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-500/10"></div>
                
                {/* Floating Coins inside */}
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="flex gap-4 transform -rotate-12"
                >
                  <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] transform -translate-y-6 translate-x-4">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="w-16 h-16 bg-indigo-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(129,140,248,0.5)] transform translate-y-6 -translate-x-4">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <Mouse className="w-5 h-5 animate-bounce" />
            <div className="flex flex-col gap-0.5">
              <ChevronDown className="w-4 h-4 -mb-2" />
              <ChevronDown className="w-4 h-4 text-white/50" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32" ref={targetRef}>
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
            <motion.h2 style={{ y: y1 }} className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight max-w-xl">
              <span className="text-white">Secure AI</span><br/>
              <span className="text-slate-500">Execution</span>
              <Sparkles className="inline-block ml-4 text-indigo-400 w-8 h-8 -mt-8" strokeWidth={2} />
            </motion.h2>
            
            <motion.div style={{ y: y2 }} className="lg:w-1/3 pt-4">
              <p className="text-slate-400 leading-relaxed font-medium">
                ProofPay fosters a secure autonomous economy, providing a seamless experience to control AI agents. Verify every execution with cryptographically backed receipts on IPFS.
              </p>
            </motion.div>
          </div>

          {/* Staggered Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
            
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 md:col-start-1 md:mt-24 bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cryptographic Mandates</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Agents are bounded by strict on-chain limits. They physically cannot spend more than their approved caps.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-4 md:col-start-5 bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Deep AI Firewall</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every API request is intercepted. If an AI tries to buy a disallowed service, the firewall blocks the flow instantly.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-4 md:col-start-9 md:mt-48 bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Outcome Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Funds are escrowed until cryptographic proof of delivery (IPFS CID) is provided. No verified delivery, no payment.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 8-Step Architecture Compact Grid */}
      <section className="relative z-10 py-32 bg-black/20 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-white">The Web3 AI Lifecycle</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">An 8-step autonomous pipeline. From natural language to cryptographically verified settlement.</p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
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
                <div 
                  key={i} 
                  className="bg-[#0d0e12]/90 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all duration-300 relative group flex flex-col h-full"
                >
                  <div className="absolute top-6 right-6 text-5xl font-black text-white/[0.03] select-none pointer-events-none group-hover:text-indigo-500/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 z-10 relative">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed flex-1 z-10 relative">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">Ready to secure your agents?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
            Deploy an autonomous agent in seconds. Set the budget, pick the services, and watch the Web3 economy thrive securely.
          </p>
          <Link href="/agents/create" className="inline-flex items-center justify-center gap-2 bg-indigo-500 text-white font-bold py-4 px-10 rounded-full hover:bg-indigo-400 transition-colors shadow-[0_0_30px_rgba(99,102,241,0.3)] text-lg">
            Deploy Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#08090a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" strokeWidth={2.5} />
            <span className="font-bold tracking-tight text-xl text-white">
              Proof<span className="text-indigo-400">Pay</span>
            </span>
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
