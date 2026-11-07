import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-three-fiber scenes mutate three.js objects, refs and shader
    // uniforms inside useFrame and seed random layouts once in useMemo. That
    // is the intended R3F pattern, but the React Compiler purity and
    // immutability rules cannot tell it apart from render-time mutation.
    files: ["src/components/Hero.tsx", "src/components/SignatureInteraction.tsx"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
