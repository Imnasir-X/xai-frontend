# Xai: Intelligence Workspace

[![CI](https://github.com/Imnasir-X/xai-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Imnasir-X/xai-frontend/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A design-focused marketing site for a concept AI intelligence product, built with Next.js, three.js, GSAP and Framer Motion: a WebGL data-lattice hero, a scroll-driven insight flow, a live dashboard preview and a custom-shader signature interaction.

![Hero: WebGL data lattice](./docs/xai-01-hero.png)

**[Watch the narrated demo video](./docs/xai-frontend-demo-narrated.mp4)** (1 min 51 s, 1080p, English narration), captured from the running production build.

## Features

- **Hero data lattice**: a 5x5x5 point grid rendered with `@react-three/fiber` that forms out of a vortex into a clean lattice, with a cursor-driven repulsion field and travelling pulses along the connecting lines.
- **Insight Flow**: a GSAP ScrollTrigger section that pins and converts vertical scroll into horizontal travel across three stages.
- **Workspace dashboard preview**: a mock product UI with a streamed answer to typed or suggested questions, a live activity feed and count-up metrics. All content is simulated in the browser; there is no backend.
- **Intelligence Engine**: an icosahedron displaced by 3D simplex noise in a custom GLSL vertex shader, with recalculated normals and a Fresnel rim, reacting to the pointer.
- **Reduced-motion support**: the lattice forms instantly, the shader stops animating and the horizontal scroll and auto-demo are skipped when the OS requests reduced motion.
- Statically prerendered; deployable to any Next.js host.

## Screenshots

| | |
|---|---|
| ![Cursor vortex interaction](./docs/xai-02-hero-vortex.png) | ![Insight flow](./docs/xai-03-insight.png) |
| **Cursor-driven vortex interaction** | **Insight Flow (scroll-driven)** |
| ![Dashboard preview](./docs/xai-04-dashboard.png) | ![Intelligence engine](./docs/xai-05-signature.png) |
| **Workspace: dashboard preview** | **Intelligence Engine: signature interaction** |

## Tech stack

| Concern       | Choice                                   |
| ------------- | ---------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19        |
| Language      | TypeScript (strict)                      |
| Styling       | Tailwind CSS 3, CSS custom-property tokens |
| 3D / GPU      | three.js + `@react-three/fiber` 9, custom GLSL |
| Scroll motion | GSAP + ScrollTrigger                     |
| UI motion     | Framer Motion                            |
| Fonts         | Inter, Bricolage Grotesque, JetBrains Mono via `next/font` |

## Quick start

Requires Node.js 20.9 or newer.

```bash
git clone https://github.com/Imnasir-X/xai-frontend.git
cd xai-frontend
npm ci
npm run dev        # http://localhost:3000
```

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Development server               |
| `npm run build`     | Production build (static export of `/`) |
| `npm run start`     | Serve the production build       |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit`                   |

## Usage

Scroll through the page top to bottom. Move the pointer over the hero to push the lattice around and over the Intelligence Engine to change its displacement. In the Workspace section, type a question (for example "Why did retention drop last month?") or click a suggested prompt to see a simulated streamed answer.

## Project structure

```text
xai-frontend/
├── src/
│   ├── app/
│   │   ├── globals.css             # Design tokens, type scale, keyframes, utilities
│   │   ├── layout.tsx              # Root layout and next/font setup
│   │   └── page.tsx                # Section composition
│   ├── components/
│   │   ├── Navbar.tsx              # Fixed, blurred navigation
│   │   ├── Hero.tsx                # three.js data lattice and HUD
│   │   ├── InsightFlow.tsx         # GSAP pinned horizontal scroll
│   │   ├── DashboardPreview.tsx    # Simulated live product UI
│   │   ├── SignatureInteraction.tsx # Custom GLSL displacement + Fresnel
│   │   └── Footer.tsx
│   └── tailwind.config.ts          # Design-system source of truth
├── tailwind.config.ts              # Re-exports src/tailwind.config.ts
├── docs/                           # Screenshots and demo video
├── eslint.config.mjs
├── next.config.mjs
├── postcss.config.mjs
└── tsconfig.json                   # `@/*` path alias to ./src/*
```

Colors, fonts and easing live in `src/tailwind.config.ts` and `globals.css`; components use those tokens (`bg-background`, `text-secondary`, `font-display`, `bg-live`) rather than hard-coded values.

## Animation decisions

Each interaction is chosen to *communicate the product* (raw data to structured
intelligence), not just to decorate.

### Hero: 3D data lattice (`Hero.tsx`)
- A 5x5x5 (125-point) grid rendered with `@react-three/fiber`. Points start in
  a vortex and are pulled into a clean lattice by a damped spring: a literal
  "chaos to structure" metaphor. Once formed, the lattice breathes slightly.
- Line segments are rebuilt each frame from the live point positions so the
  connective mesh moves with the points, and a few pulses travel along them.
- The pointer is projected into the scene and pushes nearby points away.
- Lines use additive blending at low opacity, and a radial gradient overlay
  fades the lattice at the edges so it frames the headline.

### Insight Flow: pinned horizontal scroll (`InsightFlow.tsx`)
- GSAP `ScrollTrigger` **pins** the section and translates the card track on X,
  converting vertical scroll into horizontal travel. `invalidateOnRefresh`
  keeps the distance correct on resize; triggers are cleaned up on unmount.
- Each stage has its own **geometric glyph** (scatter to converge, neural grid,
  target) plus a numbered node threaded by a continuous connector line, giving
  the three steps distinct personality and a sense of progression.
- Hover lifts the card (`-translate-y`, indigo shadow) and warms the glyph/nodes
  to the accent color.

### Workspace: live dashboard (`DashboardPreview.tsx`)
- When the section scrolls into view (`IntersectionObserver`), an auto-demo
  types a suggested question and runs it, unless the visitor has already
  interacted.
- **Streaming answer**: the canned response types out character by character
  with a blinking caret, and the related metric is highlighted while it runs.
- **Live activity feed**: new events prepend with Framer Motion `layout` and
  `AnimatePresence` enter/exit transitions.
- **Count-up metrics**: a `requestAnimationFrame` cubic-ease hook animates
  the metric values, which then jitter within realistic ranges.

### Intelligence Engine: custom GLSL (`SignatureInteraction.tsx`)
- An icosahedron displaced by 3D simplex noise in the **vertex shader**.
- **Normals are recalculated** from finite differences (sampling the
  displacement at two tangent-offset points) so lighting stays accurate after
  displacement: no faceting artifacts.
- A **Fresnel rim term** in the fragment shader adds a physical, high-end edge
  glow; base color is deep indigo rather than flat black.
- Displacement intensity and noise offset **track the pointer**, so the core
  visibly reacts to the user.

## License

Released under the [MIT License](LICENSE). Copyright (c) 2026 Nasir Khan.
