// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import clerk from "@clerk/astro";

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ["tuf-pc.tail977401.ts.net"],
  },
  integrations: [clerk()],
  adapter: node({ mode: "standalone" }),
  output: "server",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
