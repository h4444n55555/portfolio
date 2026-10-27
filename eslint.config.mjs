import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Vendored from the Magic UI registry via the shadcn CLI — left as
    // upstream ships it so it stays updatable.
    files: ["src/components/ui/terminal.tsx"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  {
    // Vendored handwriting animation. Its effects derive geometry from the
    // parsed font and then commit the dash offsets across two frames — state
    // set in an effect is how the draw is staged, so the rule cannot be
    // satisfied without dismantling the animation.
    files: ["src/components/ui/handwriting-text.tsx"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  {
    // Vendored from React Bits. It mutates the texture returned by useTexture,
    // which the rule flags — but cloning to avoid that drops the decoded image
    // and WebGL then rejects the upload, killing the render loop.
    files: ["src/components/ui/lanyard.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
]);

export default eslintConfig;
