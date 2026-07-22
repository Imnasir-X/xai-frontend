"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, Suspense, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

const GRID_SIZE = 5;
const SPACING = 1.0;
const TOTAL_POINTS = GRID_SIZE * GRID_SIZE * GRID_SIZE;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const start = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) {
      camera.position.z = 7;
      return;
    }
    if (start.current === null) start.current = clock.getElapsedTime();
    const t = Math.min(1, (clock.getElapsedTime() - start.current) / 2.6);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.z = THREE.MathUtils.lerp(9.4, 7, eased);
  });
  return null;
}

function DataLattice({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const pulsesRef = useRef<THREE.Points>(null);
  const { mouse, camera, raycaster } = useThree();

  const formationProgress = useRef(0);

  const { gridPositions, vortexPositions, lineIndices } = useMemo(() => {
    const grid = []; const vortex = []; const indices = [];
    const half = GRID_SIZE / 2; let id = 0;
    const idMap = new Map<string, number>();

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          const px = (x - half + 0.5) * SPACING;
          const py = (y - half + 0.5) * SPACING;
          const pz = (z - half + 0.5) * SPACING;
          grid.push(px, py, pz);

          const radius = Math.sqrt(px * px + py * py);
          const angle = Math.atan2(py, px);
          const vortexRadius = Math.max(0.01, radius * 0.15);
          const vortexAngle = angle + radius * 1.5;
          vortex.push(
            Math.cos(vortexAngle) * vortexRadius,
            Math.sin(vortexAngle) * vortexRadius,
            pz * 2.5
          );

          idMap.set(`${x}-${y}-${z}`, id++);
        }
      }
    }

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          const currentId = idMap.get(`${x}-${y}-${z}`)!;
          if (x < GRID_SIZE - 1) indices.push(currentId, idMap.get(`${x+1}-${y}-${z}`)!);
          if (y < GRID_SIZE - 1) indices.push(currentId, idMap.get(`${x}-${y+1}-${z}`)!);
          if (z < GRID_SIZE - 1) indices.push(currentId, idMap.get(`${x}-${y}-${z+1}`)!);
        }
      }
    }
    return { gridPositions: new Float32Array(grid), vortexPositions: new Float32Array(vortex), lineIndices: new Uint32Array(indices) };
  }, []);

  const currentPositions = useMemo(
    () => (reducedMotion ? gridPositions.slice() : vortexPositions.slice()),
    [vortexPositions, gridPositions, reducedMotion]
  );
  const velocities = useMemo(() => new Float32Array(TOTAL_POINTS * 3), []);

  const { pulsePositions, pulseData } = useMemo(() => {
    const pulsePos = new Float32Array(6 * 3);
    const pData = [];
    for (let i = 0; i < 6; i++) {
      pData.push({
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.01,
        lineIdx: Math.floor(Math.random() * (lineIndices.length / 2))
      });
    }
    return { pulsePositions: pulsePos, pulseData: pData };
  }, [lineIndices]);

  const raycasterPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const cursorPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !linesRef.current || !groupRef.current || !pulsesRef.current) return;

    const t = clock.getElapsedTime();

    if (formationProgress.current < 1) {
      formationProgress.current = Math.min(1, formationProgress.current + (reducedMotion ? 1 : 0.008));
    }
    const form = 1 - Math.pow(1 - formationProgress.current, 3);

    const breathe = form === 1 && !reducedMotion ? Math.sin(t * 0.5) * 0.02 : 0;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(raycasterPlane, cursorPos);

    const pointsPos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const linesPos = linesRef.current.geometry.attributes.position.array as Float32Array;

    const stiffness = 0.05;
    const damping = 0.85;

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const i3 = i * 3;

      let targetX = THREE.MathUtils.lerp(vortexPositions[i3], gridPositions[i3], form) + Math.sin(t * 0.5 + i) * breathe;
      let targetY = THREE.MathUtils.lerp(vortexPositions[i3 + 1], gridPositions[i3 + 1], form) + Math.cos(t * 0.5 + i) * breathe;
      let targetZ = THREE.MathUtils.lerp(vortexPositions[i3 + 2], gridPositions[i3 + 2], form);

      velocities[i3] += (targetX - currentPositions[i3]) * stiffness;
      velocities[i3 + 1] += (targetY - currentPositions[i3 + 1]) * stiffness;
      velocities[i3 + 2] += (targetZ - currentPositions[i3 + 2]) * stiffness;

      if (!reducedMotion && Math.abs(currentPositions[i3 + 2] - cursorPos.z) < 1.5) {
        const dx = currentPositions[i3] - cursorPos.x;
        const dy = currentPositions[i3 + 1] - cursorPos.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = 1.2;
        if (distSq < maxDist * maxDist && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / maxDist) * 0.08;
          velocities[i3] += (dx / dist) * force;
          velocities[i3 + 1] += (dy / dist) * force;
        }
      }

      currentPositions[i3] += velocities[i3];
      currentPositions[i3 + 1] += velocities[i3 + 1];
      currentPositions[i3 + 2] += velocities[i3 + 2];

      velocities[i3] *= damping;
      velocities[i3 + 1] *= damping;
      velocities[i3 + 2] *= damping;

      pointsPos[i3] = currentPositions[i3];
      pointsPos[i3 + 1] = currentPositions[i3 + 1];
      pointsPos[i3 + 2] = currentPositions[i3 + 2];
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    for (let i = 0; i < lineIndices.length; i++) {
      const pointIndex = lineIndices[i] * 3;
      linesPos[i * 3] = pointsPos[pointIndex];
      linesPos[i * 3 + 1] = pointsPos[pointIndex + 1];
      linesPos[i * 3 + 2] = pointsPos[pointIndex + 2];
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true;

    const pPos = pulsesRef.current.geometry.attributes.position.array as Float32Array;
    pulseData.forEach((p, i) => {
      p.progress += reducedMotion ? p.speed * 0.3 : p.speed;
      if (p.progress > 1) {
        p.progress = 0;
        p.lineIdx = Math.floor(Math.random() * (lineIndices.length / 2));
      }
      const idx1 = lineIndices[p.lineIdx * 2] * 3;
      const idx2 = lineIndices[p.lineIdx * 2 + 1] * 3;

      pPos[i * 3] = THREE.MathUtils.lerp(pointsPos[idx1], pointsPos[idx2], p.progress);
      pPos[i * 3 + 1] = THREE.MathUtils.lerp(pointsPos[idx1 + 1], pointsPos[idx2 + 1], p.progress);
      pPos[i * 3 + 2] = THREE.MathUtils.lerp(pointsPos[idx1 + 2], pointsPos[idx2 + 2], p.progress);
    });
    pulsesRef.current.geometry.attributes.position.needsUpdate = true;

    if (!reducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.2, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.2, 0.04);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={gridPositions.length / 3} array={gridPositions.slice()} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#FFFFFF" transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={lineIndices.length} array={new Float32Array(lineIndices.length * 3)} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#4F46E5" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points ref={pulsesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={pulsePositions.length / 3} array={pulsePositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#818CF8" transparent opacity={1} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

function HudFrame() {
  const [sync, setSync] = useState(99.94);
  const [clockStr, setClockStr] = useState("");

  useEffect(() => {
    const tick = () => {
      setSync(99.9 + Math.random() * 0.09);
      setClockStr(new Date().toUTCString().slice(17, 25));
    };
    tick();
    const id = setInterval(tick, 1400);
    return () => clearInterval(id);
  }, []);

  const corner = "absolute w-3 h-3 border-white/15";
  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden md:block">
      <div className={`${corner} top-8 left-8 border-l border-t`} />
      <div className={`${corner} top-8 right-8 border-r border-t`} />
      <div className={`${corner} bottom-8 left-8 border-l border-b`} />
      <div className={`${corner} bottom-8 right-8 border-r border-b`} />

      <div className="absolute bottom-9 left-11 font-mono text-[10px] tracking-wider text-secondary/70">
        LATTICE·125 &nbsp; SYNC {sync.toFixed(2)}% &nbsp; {clockStr}
        <span className="animate-caret text-accent-bright">▍</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 grid-bg opacity-40" />
      <div className="absolute inset-0 z-0">
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 9.4], fov: 50 }}
        >
          <Suspense fallback={null}>
            <CameraRig reducedMotion={reducedMotion} />
            <DataLattice reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </div>

      {/* Base Radial Vignette */}
      <div className="absolute inset-0 z-5 pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(8,8,10,0.7) 0%, rgba(8,8,10,0.3) 50%, transparent 80%)" }} />
      {/* Secondary Inner Vignette for Text Readability */}
      <div className="absolute inset-0 z-5 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-background/60 blur-[80px] rounded-full"></div>
      </div>
      <div className="grain-overlay z-[6]" />
      <HudFrame />

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-7 px-3 py-1 rounded-full border border-border bg-card/40 backdrop-blur-sm text-[11px] font-mono uppercase tracking-[0.15em] text-secondary"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent-bright animate-premium-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-bright" />
          </span>
          Intelligence, structured
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl md:text-[5.5rem] font-medium leading-[0.95] tracking-tightest text-primary"
        >
          From Raw Data to <br />
          {/* Softened gradient stop */}
          <span className="bg-gradient-to-r from-primary via-primary/90 to-accent-bright/60 bg-clip-text text-transparent">
            Actionable Intelligence
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-secondary mt-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed font-light"
        >
          Xai transforms unstructured signals into structured intelligence, enabling decision-makers to act with clarity.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <a href="#dashboard" className="group flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-background text-[13px] font-medium hover:opacity-90 transition-opacity">
            Explore the workspace
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <a href="#flow" className="px-5 py-2.5 rounded-full border border-border text-[13px] text-secondary hover:text-primary hover:bg-card/40 hover:border-white/20 transition-all duration-300">
            See how it works
          </a>
        </motion.div>
      </div>

      {/* Brought scroll cue delay down to 0.6s */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-secondary pointer-events-none"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Scroll</span>
        <div className="h-8 w-[1px] bg-gradient-to-b from-secondary to-transparent" />
      </motion.div>
    </section>
  );
}