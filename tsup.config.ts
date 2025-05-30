import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  globalName: 'DecisionEngine',
  outDir: 'dist',
  target: 'es2022',
})
