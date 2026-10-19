import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
// @ts-ignore — vite config runs under tsconfig.node.json where node types may be absent
  base: (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.DEPLOY_BASE ?? "/",
});
