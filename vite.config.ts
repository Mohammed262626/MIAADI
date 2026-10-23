import nodeAdapter from "@sveltejs/adapter-node";
import vercelAdapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// Vercel sets VERCEL=1 during its own builds. Locally we build with adapter-node:
// adapter-vercel creates symlinks for its function files, which Windows refuses
// without Developer Mode / admin rights.
const isVercel = Boolean(
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VERCEL,
);

export default defineConfig(async () => ({
  plugins: [
    tailwindcss(),
    await sveltekit({
      adapter: isVercel ? vercelAdapter() : nodeAdapter(),
      preprocess: vitePreprocess(),
    }),
  ],
}));
