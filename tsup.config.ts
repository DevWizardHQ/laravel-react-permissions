import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
    entry: './index.ts',
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', '@inertiajs/react'],
  treeshake: true,
  minify: false,
  target: 'es2022',
  outExtension() {
    return {
      js: '.js',
    };
  },
  // Ensure proper bundling for better imports
  bundle: true,
  // Keep names for better debugging and IDE support
  keepNames: true,
});
