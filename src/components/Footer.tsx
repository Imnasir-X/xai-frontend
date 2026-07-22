"use client";
import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full border-t border-border bg-background overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      
      {/* Massive Ghost Wordmark (Opacity lowered to 0.008) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center overflow-hidden">
        <span className="font-display text-[24vw] font-medium leading-[0.8] text-white/[0.008] select-none translate-y-[20%]">Xai</span>
      </div>

      <div className="relative z-10 mx-auto w-full px-8 lg:px-12 xl:max-w-7xl py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              {/* Logo SVG Only */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4 text-primary">
                <path d="M74 404 L150 404 L205 334 L170 283 Z" />
                <path d="M96 174 L180 174 L344 414 L260 414 Z" />
                <path d="M233 252 L348 98 L438 98 L277 315 Z" />
                <path d="M372 207 L438 118 L438 414 L372 414 Z" />
              </svg>
            </div>
            <p className="mt-4 text-[13px] font-light leading-relaxed text-secondary">
              From raw data to structured intelligence to actionable insight.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[11px] text-secondary font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-premium-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>
              All systems operational
            </div>
          </div>
          <div className="flex gap-16 text-[13px]">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary/80 font-medium">Product</span>
              <a href="#flow" className="text-secondary transition-colors hover:text-primary">Flow</a>
              <a href="#dashboard" className="text-secondary transition-colors hover:text-primary">Workspace</a>
              <a href="#signature" className="text-secondary transition-colors hover:text-primary">Engine</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary/80 font-medium">Company</span>
              <a href="#" className="text-secondary transition-colors hover:text-primary">Privacy</a>
              <a href="#" className="text-secondary transition-colors hover:text-primary">Terms</a>
              <a href="#" className="text-secondary transition-colors hover:text-primary">Contact</a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-6 md:flex-row md:justify-between">
          <p className="text-secondary text-[11px] font-mono tracking-wider">© {year} XAI INTELLIGENCE WORKSPACE</p>
          <a href="#" className="group flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-secondary transition-colors hover:text-primary">
            Back to top
            <span className="transition-transform duration-300 group-hover:-translate-y-1">↑</span>
          </a>
        </div>
      </div>
    </motion.footer>
  );
}