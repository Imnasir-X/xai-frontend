"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  { id: "01", title: "Ingest Data", desc: "Connect seamlessly to APIs, databases, and streams. We aggregate raw signals into a unified pipeline." },
  { id: "02", title: "Analyze with AI", desc: "Neural networks map relationships and detect anomalies in real-time, structuring chaos into legible patterns." },
  { id: "03", title: "Generate Insight", desc: "Distill complex analytics into clear, actionable insights. Automated triggers deployed directly to you." }
];

export default function InsightFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const horizontal = horizontalRef.current;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.innerWidth < 768 || reducedMotion) return;

    if (container && horizontal) {
      const totalWidth = horizontal.scrollWidth - window.innerWidth;

      const tween = gsap.to(horizontal, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setScrollProgress(self.progress)
        }
      });

      cardsRef.current.forEach((card) => {
        if (!card) return;
        // Tightened scrub and rotation values
        gsap.fromTo(card,
          { rotateY: 12, x: 20, opacity: 0.65 },
          {
            rotateY: 0, x: 0, opacity: 0.95, ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 80%",
              end: "center 45%",
              scrub: 2
            }
          }
        );
        gsap.to(card,
          {
            rotateY: -12, x: -20, opacity: 0.65, ease: "power2.in",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "center 45%",
              end: "right 20%",
              scrub: 2
            }
          }
        );
      });

      return () => { tween.kill(); ScrollTrigger.getAll().forEach(st => st.kill()); };
    }
  }, []);

  return (
    <section id="flow" ref={containerRef} className="relative min-h-screen md:h-screen w-full overflow-hidden bg-background flex flex-col md:items-center justify-center py-24 md:py-0">
      {/* Brought header closer to the track */}
      <div className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 z-10 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tightest">The Insight Flow</h2>
        <p className="text-secondary mt-2 text-[13px] font-light">From chaos to clarity in three steps.</p>
      </div>

      {/* Tightened top margin */}
      <div ref={horizontalRef} className="flex flex-col md:flex-row items-center pl-0 md:pl-[40vw] gap-12 md:gap-8 will-change-transform px-6 md:px-0 md:mt-24" style={{ perspective: 1200 }}>
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex flex-col md:flex-row flex-shrink-0 items-center gap-8">
            <div
              ref={el => { if (el) cardsRef.current[i] = el; }}
              className="group/card relative flex h-[340px] w-full max-w-[400px] md:w-[400px] flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors duration-500 hover:border-white/15"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
              {/* Raised and faded ghost numeral */}
              <span className="pointer-events-none absolute -top-10 right-4 select-none font-display text-[100px] font-medium leading-none text-white/[0.025]">{stage.id}</span>

              <div className="relative z-20 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
                    <span className="h-1 w-1 rounded-full bg-accent-bright" />
                    Step {stage.id}
                  </div>
                  <h3 className="mb-4 text-2xl font-medium tracking-tight">{stage.title}</h3>
                  <p className="text-[13px] font-light leading-relaxed text-secondary">{stage.desc}</p>
                </div>
                <div className="h-[1px] w-full overflow-hidden rounded-full bg-border">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-accent-bright"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </div>
            {i < stages.length - 1 && <div className="flex-shrink-0 text-xl text-border/40 rotate-90 md:rotate-0">→</div>}
          </div>
        ))}
        <div className="hidden md:block flex-shrink-0 w-[10vw]"></div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-20 items-center gap-3">
        <div className="w-40 h-[2px] bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${scrollProgress * 100}%`, transition: 'width 0.1s linear' }} />
        </div>
        <span className="text-[10px] font-mono text-secondary">{Math.round(scrollProgress * 100)}%</span>
      </div>
    </section>
  );
}