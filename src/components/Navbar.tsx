"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const links = [
  { label: "Flow", href: "#flow" },
  { label: "Workspace", href: "#dashboard" },
  { label: "Engine", href: "#signature" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [coherence, setCoherence] = useState(98.4);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Shared system telemetry drift
  useEffect(() => {
    const id = setInterval(() => {
      setCoherence(prev => Math.max(96.5, Math.min(99.9, prev + (Math.random() - 0.5) * 0.2)));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-700 ${
        scrolled ? "bg-background/70 border-b border-border/50" : "bg-background/20 border-b border-transparent"
      }`}
    >
      <div className="mx-auto w-full px-6 md:px-8 lg:px-12 xl:max-w-7xl py-4 flex items-center justify-between">
        <a href="#" className="group flex items-center" onClick={() => setMenuOpen(false)}>
          {/* Logo SVG Only */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-6 h-6 text-primary transition-transform duration-500 group-hover:scale-110">
            <path d="M74 404 L150 404 L205 334 L170 283 Z" />
            <path d="M96 174 L180 174 L344 414 L260 414 Z" />
            <path d="M233 252 L348 98 L438 98 L277 315 Z" />
            <path d="M372 207 L438 118 L438 414 L372 414 Z" />
          </svg>
        </a>

        <div className="hidden md:flex items-center gap-9 text-[13px] text-secondary">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="group relative py-1 transition-colors hover:text-primary">
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Shared System Telemetry */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-secondary mr-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-50 animate-premium-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
            </span>
            Coherence {coherence.toFixed(1)}%
          </div>

          <button className="hidden md:flex group items-center gap-1.5 px-3.5 py-1.5 bg-primary text-background rounded-full text-[13px] font-medium hover:opacity-90 transition-opacity">
            Request Access
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>

          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full border border-border text-primary"
          >
            <div className="relative w-4 h-3">
              <span className={`absolute left-0 top-0 h-[1.5px] w-full bg-primary transition-transform duration-300 ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute left-0 bottom-0 h-[1.5px] w-full bg-primary transition-transform duration-300 ${menuOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Scroll-progress hairline (1.5px height, slight opacity boost) */}
      <div className="h-[1.5px] w-full bg-transparent overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-bright opacity-80 transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border/50"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.a
                  key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="py-3 text-[15px] text-secondary border-b border-border/60 last:border-none hover:text-primary transition-colors"
                >
                  {l.label}
                </motion.a>
              ))}
              <button className="mt-5 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-background rounded-full text-[13px] font-medium">
                Request Access
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}