import { sentryVitePlugin } from "@sentry/vite-plugin";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills(), sentryVitePlugin({
    org: "achwahyu",
    project: "split-bill",
    authToken: sentryAuthToken,
    disable: !sentryAuthToken,
    telemetry: false,
  })],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: true
  }
})