"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, Suspense, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

const noiseGLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

function ShaderMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse } = useThree();
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const clickIntensity = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.2 },
    uMouse: { value: new THREE.Vector2(0, 0) }
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current || !meshRef.current || !orbitRef.current) return;
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      uniforms.uTime.value = t;
    }
    uniforms.uMouse.value.x = THREE.MathUtils.lerp(uniforms.uMouse.value.x, mouse.x, 0.05);
    uniforms.uMouse.value.y = THREE.MathUtils.lerp(uniforms.uMouse.value.y, mouse.y, 0.05);
    
    const dist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
    
    // Increased decay duration from 0.05 to 0.02 (lasts ~2.2s)
    clickIntensity.current = THREE.MathUtils.lerp(clickIntensity.current, 0, 0.02);
    
    uniforms.uIntensity.value = THREE.MathUtils.lerp(uniforms.uIntensity.value, 0.15 + dist * 0.5 + clickIntensity.current, 0.05);
    
    if (!reduceMotion) {
      meshRef.current.rotation.y = t * 0.1;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      
      // Orbiting mesh logic + scale pulse based on main mesh intensity
      orbitRef.current.position.x = Math.cos(t * 0.5) * 3;
      orbitRef.current.position.z = Math.sin(t * 0.5) * 3;
      orbitRef.current.position.y = Math.sin(t * 0.3) * 0.5;
      orbitRef.current.rotation.y = t * 0.5;
      orbitRef.current.scale.setScalar(1.0 + clickIntensity.current * 0.5);
    }
  });

  return (
    <>
      <mesh 
        ref={meshRef}
        onPointerDown={() => { clickIntensity.current = 1.5; }}
      >
        <icosahedronGeometry args={[1.5, 32]} />
        <shaderMaterial 
          ref={matRef}
          uniforms={uniforms}
          vertexShader={`
            ${noiseGLSL}
            uniform float uTime;
            uniform float uIntensity;
            uniform vec2 uMouse;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vDisplacement;
            
            float getDisplacement(vec3 pos) {
              return snoise(pos * 1.5 + uTime * 0.2 + vec3(uMouse * 2.0, 0.0));
            }
            
            void main() {
              vec3 pos = position;
              float noise = getDisplacement(pos);
              vDisplacement = noise;
              
              pos += normal * noise * uIntensity;
              
              float epsilon = 0.01;
              vec3 tangent1 = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
              if (abs(dot(normal, vec3(1.0, 0.0, 0.0))) > 0.99) tangent1 = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
              vec3 tangent2 = normalize(cross(normal, tangent1));
              
              vec3 p1 = pos + tangent1 * epsilon;
              vec3 p2 = pos + tangent2 * epsilon;
              
              p1 += normal * getDisplacement(p1) * uIntensity;
              p2 += normal * getDisplacement(p2) * uIntensity;
              
              vec3 newNormal = normalize(cross(p1 - pos, p2 - pos));
              vNormal = normalize(normalMatrix * newNormal);
              
              vec4 worldPos = modelMatrix * vec4(pos, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform float uIntensity;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vDisplacement;
            
            void main() {
              vec3 baseColor = vec3(0.02, 0.02, 0.04);
              vec3 accentColor = vec3(0.39, 0.39, 0.95); 
              
              vec3 light1 = normalize(vec3(1.0, 1.0, 1.0));
              vec3 light2 = normalize(vec3(-0.5, -0.5, 1.0));
              
              float diff1 = max(dot(vNormal, light1), 0.0);
              float diff2 = max(dot(vNormal, light2), 0.0);
              vec3 diffuse = (diff1 * 0.6 + diff2 * 0.3) * accentColor;
              
              vec3 viewDir = normalize(cameraPosition - vWorldPosition);
              float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
              
              vec3 rim = fresnel * vec3(0.5, 0.5, 1.0) * (1.5 + uIntensity * 2.0);
              
              float mixVal = smoothstep(-0.2, 0.5, vDisplacement);
              vec3 color = mix(baseColor, diffuse, mixVal);
              
              color += rim;
              
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>
      
      <mesh ref={orbitRef}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color="#818CF8" wireframe={true} transparent opacity={0.5} />
      </mesh>
    </>
  );
}

function SignatureHud() {
  const [reading, setReading] = useState(0.42);
  const [coherence, setCoherence] = useState(98.4);
  
  useEffect(() => {
    const id = setInterval(() => {
      setReading(0.3 + Math.random() * 0.3);
      setCoherence(prev => Math.max(96.5, Math.min(99.9, prev + (Math.random() - 0.5) * 0.2)));
    }, 1200);
    return () => clearInterval(id);
  }, []);
  
  return (
    <div className="pointer-events-none absolute bottom-9 left-1/2 -translate-x-1/2 z-10 hidden md:block font-mono text-[10px] tracking-wider text-secondary/70">
      VECTOR·FIELD &nbsp; COHERENCE {coherence.toFixed(1)}% &nbsp; DISPLACEMENT {reading.toFixed(3)} &nbsp; <span className="animate-caret text-accent-bright">▍</span>
    </div>
  );
}

export default function SignatureInteraction() {
  return (
    <section id="signature" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 grid-bg opacity-20" />
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <ShaderMesh />
          </Suspense>
        </Canvas>
      </div>
      <div className="grain-overlay z-[6]" />
      <SignatureHud />

      <div className="absolute inset-0 z-5 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-background/40 blur-[100px] rounded-full"></div>
      </div>

      <div className="z-10 text-center px-6 pointer-events-none">
        {/* Badge opacity reduced */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-border bg-card/40 backdrop-blur-sm text-[11px] font-mono uppercase tracking-[0.15em] text-secondary opacity-90"
        >
          Processing Core
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl md:text-7xl font-medium tracking-tightest mb-6"
        >
          The Intelligence Engine
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-secondary max-w-xl mx-auto text-base md:text-lg font-light"
        >
          This core processes raw vectors and reorganizes them into structured, actionable models in real-time. Move your cursor or click to interact.
        </motion.p>
      </div>
    </section>
  );
}