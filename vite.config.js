import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Root path for custom domain (portfolio.pritamrao.tech)
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'lenis'],
        },
      },
    },
  }
})
