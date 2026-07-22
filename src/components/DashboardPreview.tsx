"use client";
import { useState, useRef, useEffect, useCallback, FormEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const usesReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function CountUp({ end, duration = 1.1, decimals = 0, suffix = "" }: { end: number; duration?: number; decimals?: number; suffix?: string; }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = fromRef.current;
    const startTime = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (end - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = end;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration]);

  return <span>{display.toFixed(decimals)}{suffix}</span>;
}

const suggestions = [
  "Why did retention drop last month?",
  "Summarize anomalies in Stream #4",
  "Forecast next week's GPU spend",
];

const getMockResponse = (query: string) => {
  const q = query.toLowerCase();
  if (q.includes("retention")) {
    return `Insight regarding '${query}': Retention dropped 4.2% due to the delayed release of Feature X.`;
  } else if (q.includes("revenue") || q.includes("gpu") || q.includes("spend")) {
    return `Insight regarding '${query}': MRR increased by 12.4%, driven primarily by Tier 2 upsells.`;
  } else if (q.includes("latency") || q.includes("stream") || q.includes("anomal")) {
    return `Insight regarding '${query}': p95 latency spiked to 420ms on the inference cluster at 14:00 UTC.`;
  }
  return `Insight regarding '${query}': Query processed. No structural anomalies detected. Confidence: 98.4%.`;
};

export default function DashboardPreview() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Workspace initialized. Ask me to analyze retention, revenue, or latency." }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isCodeRunning, setIsCodeRunning] = useState(false); // New state for code panel reaction
  const [activeTab, setActiveTab] = useState("Overview");
  const [highlightMetric, setHighlightMetric] = useState<string | null>(null);
  const [activityFeed, setActivityFeed] = useState([
    { time: "Just now", event: "Model Sentiment-V3 deployed", status: "Active" },
    { time: "1m ago", event: "Anomaly detected in Stream #4", status: "Resolved" },
  ]);
  const [clockStr, setClockStr] = useState("");
  const [liveMetrics, setLiveMetrics] = useState({ accuracy: 99.82, latency: 42, throughput: 1.24, coherence: 98.4 });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hasInteractedRef = useRef(false);
  const autoplayArmedRef = useRef(false);

  const markInteracted = useCallback(() => { hasInteractedRef.current = true; }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    const tick = () => setClockStr(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Live metrics drift continuously (including shared coherence)
  useEffect(() => {
    const id = setInterval(() => {
      setLiveMetrics(prev => ({
        accuracy: clamp(prev.accuracy + (Math.random() - 0.5) * 0.06, 99.4, 99.97),
        latency: clamp(prev.latency + (Math.random() - 0.5) * 6, 31, 57),
        throughput: clamp(prev.throughput + (Math.random() - 0.5) * 0.08, 0.9, 1.6),
        coherence: clamp(prev.coherence + (Math.random() - 0.5) * 0.2, 96.5, 99.9),
      }));
    }, usesReducedMotion() ? 6000 : 2600);
    return () => clearInterval(id);
  }, []);

  // Processing-volume chart streams like a real monitor
  const [volumeData, setVolumeData] = useState([40, 65, 50, 80, 45, 90, 60, 75, 85, 55, 70, 95, 62, 78]);
  useEffect(() => {
    if (usesReducedMotion()) return;
    const id = setInterval(() => {
      setVolumeData(prev => {
        const last = prev[prev.length - 1];
        const next = Math.round(clamp(last + (Math.random() - 0.5) * 34, 22, 97));
        return [...prev.slice(1), next];
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Deployed-model latency jitters
  const [models, setModels] = useState([
    { name: "Sentiment-V3", status: "Active", latency: 42 },
    { name: "Forecast-Pro", status: "Idle", latency: 120 },
    { name: "Anomaly-Radar", status: "Active", latency: 88 },
  ]);
  useEffect(() => {
    if (usesReducedMotion()) return;
    const id = setInterval(() => {
      setModels(prev => prev.map(m =>
        m.status === "Active" ? { ...m, latency: Math.round(clamp(m.latency + (Math.random() - 0.5) * 10, 28, 150)) } : m
      ));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const events = [
      { event: "Data ingestion from API completed", status: "Success" },
      { event: "Pipeline run_insight.py executed", status: "Success" },
      { event: "Model accuracy threshold met", status: "Active" },
    ];
    const interval = setInterval(() => {
      const newEvent = events[Math.floor(Math.random() * events.length)];
      setActivityFeed(prev => [{ time: "Just now", ...newEvent }, ...prev.slice(0, 2)]);
    }, 2500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  const runQuery = useCallback((query: string) => {
    if (!query.trim() || isThinking) return;

    setMessages(prev => [...prev, { sender: "user", text: query }]);
    setInput("");
    setIsThinking(true);
    setIsCodeRunning(true); // Trigger code panel highlight

    setActiveTab("Overview");
    const q = query.toLowerCase();
    if (q.includes("latency")) setHighlightMetric("latency");
    else if (q.includes("retention") || q.includes("accuracy")) setHighlightMetric("accuracy");
    else setHighlightMetric("throughput");

    // Stop code highlight after 800ms
    setTimeout(() => setIsCodeRunning(false), 800);

    setTimeout(() => {
      const responseText = getMockResponse(query);
      setIsThinking(false);
      setMessages(prev => [...prev, { sender: "ai", text: "" }]);

      let i = 0;
      const interval = setInterval(() => {
        if (i <= responseText.length) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { sender: "ai", text: responseText.slice(0, i) };
            return newMessages;
          });
          i++;
        } else {
          clearInterval(interval);
          setHighlightMetric(null);
        }
      }, 42); // Slowed down streaming slightly
    }, 1200);
  }, [isThinking]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || usesReducedMotion()) return;

    const runAutoDemo = async () => {
      const query = suggestions[0];
      for (let i = 0; i <= query.length; i++) {
        if (hasInteractedRef.current) return;
        setInput(query.slice(0, i));
        await new Promise(r => setTimeout(r, 26));
      }
      await new Promise(r => setTimeout(r, 400));
      if (hasInteractedRef.current) return;
      setInput("");
      runQuery(query);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !autoplayArmedRef.current && !hasInteractedRef.current) {
            autoplayArmedRef.current = true;
            setTimeout(() => {
              if (!hasInteractedRef.current) runAutoDemo();
            }, 1500);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [runQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    markInteracted();
    runQuery(input);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(560px circle at ${x}% ${y}%, rgba(129,140,248,0.07), transparent 45%)`;
    }
  };

  return (
    <section id="dashboard" className="relative w-full py-24 md:py-32 px-6 md:px-8 flex flex-col items-center bg-background">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="inline-block px-2.5 py-1 mb-4 text-[10px] font-mono uppercase tracking-[0.15em] border border-border rounded-full text-secondary">
            Intelligence Workspace
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="font-display text-4xl md:text-5xl font-medium tracking-tightest">From Inquiry to Execution</motion.h2>
        </div>

        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-[720px] md:h-[680px] bg-card border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col"
        >
          <div ref={glowRef} className="pointer-events-none absolute inset-0 z-0" />

          <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/70 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]/80" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-card border border-border text-[10px] font-mono text-secondary">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              app.xai.io/workspace
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-secondary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-60 animate-premium-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
              </span>
              LIVE · {clockStr || "—"}
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:flex w-[200px] border-r border-border bg-background p-4 flex-col gap-6">
              <div className="flex items-center gap-2 px-2">
                <div className="w-4 h-4 rounded-[3px] bg-primary" />
                <span className="font-display font-medium text-[13px] tracking-tight">Xai Workspace</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {["Dashboard", "Datasets", "Pipelines", "Settings"].map((item, i) => (
                  <div key={item} className={`px-2.5 py-1.5 rounded-md text-[12px] cursor-pointer transition-colors ${i === 0 ? 'bg-card text-primary border border-border' : 'text-secondary hover:text-primary'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Shared System Telemetry */}
              <div className="mt-auto p-3 border border-border rounded-lg text-[10px] text-secondary font-mono">
                <div className="flex justify-between mb-1">
                  <span>Coherence</span>
                  <span className="text-live">{liveMetrics.coherence.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-live" style={{ width: `${liveMetrics.coherence}%`, transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-4">

              {/* Top Bar + Tabs */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-2 text-[12px] text-secondary font-mono bg-background border border-border rounded-md px-2.5 py-1 w-full md:w-auto md:max-w-[300px] opacity-50 cursor-not-allowed">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <span>Search insights, models, logs...</span>
                </div>
                <div className="flex gap-1 p-1 bg-background border border-border rounded-md w-full md:w-auto">
                  {["Overview", "Active Models", "Automations"].map(tab => (
                    <button key={tab} onClick={() => { markInteracted(); setActiveTab(tab); }} className={`flex-1 md:flex-none px-3 py-1.5 text-[11px] rounded-[5px] relative transition-colors ${activeTab === tab ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                      {activeTab === tab && <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-card border border-border rounded-[5px]" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />}
                      <span className="relative z-10">{tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Tab Content + Chat (Split Layout) */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">

                {/* Left Panel: Insight Chat (Always Visible) */}
                <div className="border border-border rounded-lg p-6 flex flex-col gap-4 overflow-hidden max-h-[350px] md:max-h-none bg-background">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-50 animate-premium-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-secondary">Query Engine</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-2">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className={`max-w-[85%] text-[12px] rounded-lg px-3 py-2 ${msg.sender === 'user' ? 'self-end bg-accent/10 border border-accent/20 text-primary rounded-br-sm' : 'self-start bg-card border border-border text-secondary rounded-bl-sm'}`}
                        >
                          {msg.text}
                          {msg.sender === 'ai' && msg.text.length === 0 && <span className="inline-block w-2 h-3 bg-accent-bright animate-pulse"></span>}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isThinking && (
                      <div className="self-start text-[12px] text-secondary flex items-center gap-1.5">
                        Analyzing streams
                        <span className="flex gap-0.5">
                          <span className="h-1 w-1 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-1 w-1 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-1 w-1 rounded-full bg-accent animate-bounce"></span>
                        </span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Moved suggestions closer to input */}
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {suggestions.map((s) => (
                      <button key={s} type="button" onClick={() => { markInteracted(); runQuery(s); }} disabled={isThinking}
                        className="rounded-full border border-border px-2.5 py-1 text-[11px] text-secondary transition-colors hover:border-accent/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed">
                        {s}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="flex items-center gap-2 text-[12px] text-secondary font-mono bg-card border border-border rounded-md px-3 py-2 focus-within:border-accent transition-colors">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => { markInteracted(); setInput(e.target.value); }}
                      placeholder="Ask a question..."
                      aria-label="Ask the workspace a question"
                      className="bg-transparent outline-none flex-1 text-primary placeholder:text-secondary w-full"
                    />
                    <button type="submit" aria-label="Submit question" className="text-accent-bright hover:text-accent transition-colors disabled:opacity-50" disabled={isThinking}>↵</button>
                  </form>
                </div>

                {/* Right Panel: Dynamic Tab Content */}
                <div className="bg-background border border-border rounded-lg p-6 flex flex-col overflow-hidden">
                  {activeTab === "Overview" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full gap-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "accuracy", label: "Accuracy", value: <CountUp end={liveMetrics.accuracy} decimals={1} suffix="%" /> },
                          { id: "latency", label: "Latency", value: <CountUp end={liveMetrics.latency} decimals={0} suffix="ms" /> },
                          { id: "throughput", label: "Throughput", value: <CountUp end={liveMetrics.throughput} decimals={1} suffix="M" /> }
                        ].map(metric => (
                          // Added ring-1 ring-accent/30 when active
                          <div key={metric.id} className={`p-4 border rounded-lg flex flex-col justify-between transition-all duration-300 ${highlightMetric === metric.id ? 'border-accent bg-accent/5 scale-105 ring-1 ring-accent/30' : 'border-border'}`}>
                            <div className="text-[10px] uppercase tracking-wider text-secondary">{metric.label}</div>
                            <div className="text-xl font-mono tracking-tight tabular-nums">{metric.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="relative flex h-1 w-1">
                          <span className="relative inline-flex h-1 w-1 rounded-full bg-live" />
                        </span>
                        <div className="text-[10px] uppercase tracking-wider text-secondary">Processing Volume</div>
                      </div>
                      <div className="flex-1 flex items-end gap-1 pt-4 relative">
                        {isThinking && (
                          <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent/10 to-transparent pointer-events-none z-10"
                          />
                        )}
                        {volumeData.map((h, i) => (
                          <div key={i} className="flex-1 h-full flex items-end relative group">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                              className={`w-full rounded-sm transition-colors relative ${highlightMetric === 'throughput' && isThinking ? 'bg-accent animate-pulse' : 'bg-accent/30 group-hover:bg-accent/80'}`}
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-secondary font-mono bg-card border border-border px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                                {h}k req/s
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border pt-3 flex flex-col gap-2 overflow-hidden">
                        <AnimatePresence initial={false}>
                          {activityFeed.map((item, i) => (
                            <motion.div
                              key={item.event + i}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center justify-between text-[11px] border-l border-border pl-3 py-1"
                            >
                              <div>
                                <div className="text-primary leading-tight">{item.event}</div>
                                <div className="text-secondary text-[10px] font-mono">{item.time}</div>
                              </div>
                              <div className={`text-[10px] ${item.status === 'Active' ? 'text-accent-bright' : 'text-green-400'}`}>{item.status}</div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "Active Models" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full gap-3">
                      <div className="text-[10px] uppercase tracking-wider text-secondary mb-2">Deployed Instances</div>
                      {models.map(m => (
                        <div key={m.name} className="flex items-center justify-between p-3 border border-border rounded-md hover:border-white/15 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-live animate-pulse' : 'bg-secondary'}`}></div>
                            <span className="text-[12px] text-primary font-mono">{m.name}</span>
                          </div>
                          <span className="text-[11px] text-secondary font-mono tabular-nums">{m.latency}ms</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "Automations" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full gap-3">
                      <div className="text-[10px] uppercase tracking-wider text-secondary mb-2">Active Triggers</div>
                      {[
                        { trigger: "If Latency > 500ms", action: "Alert Slack #ops" },
                        { trigger: "If Retention drops 2%", action: "Email Product Team" },
                      ].map(a => (
                        <div key={a.trigger} className="p-3 border border-border rounded-md bg-card/50">
                          <div className="text-[11px] text-primary font-mono mb-1">WHEN</div>
                          <div className="text-[12px] text-secondary mb-3">{a.trigger}</div>
                          <div className="text-[11px] text-primary font-mono mb-1">THEN</div>
                          <div className="text-[12px] text-accent-bright">{a.action}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}